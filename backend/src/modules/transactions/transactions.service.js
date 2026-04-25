const repository = require('./transactions.repository');
const { supabaseAdmin } = require('../../config/supabase');
const ApiError = require('../../utils/apiError');
const walletService = require('../wallet/wallet.service');

const initiateBuyNow = async (buyerId, gemId) => {
  const { data: gem, error } = await supabaseAdmin
    .from('gems')
    .select(`id, title, status, listing_type, buy_now_price, seller_id,
             seller:profiles!gems_seller_id_fkey(id, full_name)`)
    .eq('id', gemId).single();
  if (error || !gem) throw new ApiError(404, 'Gem not found');

  if (gem.listing_type !== 'direct_sell')
    throw new ApiError(400, 'This gem is not available for direct purchase');

  if (gem.status !== 'listed')
    throw new ApiError(400, 'This gem is no longer available');

  if (buyerId === gem.seller_id)
    throw new ApiError(400, 'You cannot purchase your own listing');

  if (gem.buy_now_price == null)
    throw new ApiError(400, 'No price set for this gem');

  await repository.markGemSold(gemId);

  const txn = await repository.create({
    gem_id: gemId,
    buyer_id: buyerId,
    seller_id: gem.seller_id,
    amount: gem.buy_now_price,
    type: 'buy_now',
    status: 'pending',
  });

  await repository.notifyUser(
    gem.seller_id, 'new_bid',
    'Purchase Request Received',
    `A buyer has requested to purchase "${gem.title}"`,
    { gem_id: gemId, transaction_id: txn.id, buyer_id: buyerId, amount: gem.buy_now_price }
  );

  const requiresOfflineArrangement = parseFloat(gem.buy_now_price) >= 1000;
  return { transaction: txn, requiresOfflineArrangement };
};

const confirmPayment = async (buyerId, transactionId, paymentReference) => {
  const full = await repository.findById(transactionId);
  if (full.buyer_id !== buyerId) throw new ApiError(403, 'Access denied');
  if (full.status !== 'pending') throw new ApiError(400, 'Transaction is not pending');
  if (parseFloat(full.amount) >= 1000)
    throw new ApiError(400, 'High-value transactions require offline arrangement');

  const simRef = paymentReference
    ? `SIM-${paymentReference}`
    : `SIM-${Date.now()}`;
  await repository.updateStatus(transactionId, buyerId, 'completed', simRef);

  if (full.auction_id) {
    await walletService.releaseBidDeposit(buyerId, full.auction_id);
  }

  await repository.notifyUser(
    full.seller_id, 'auction_won', 'Payment Confirmed',
    `Buyer completed payment for "${full.gem.title}". Amount: $${parseFloat(full.amount).toLocaleString()}`,
    { transaction_id: transactionId, amount: full.amount }
  );

  await repository.notifyUser(
    buyerId, 'auction_won', 'Purchase Complete',
    `Your purchase of "${full.gem.title}" is confirmed.`,
    { transaction_id: transactionId, gem_id: full.gem_id }
  );

  return await repository.findById(transactionId);
};

const markOfflineComplete = async (sellerId, transactionId) => {
  const full = await repository.findById(transactionId);
  if (full.seller_id !== sellerId) throw new ApiError(403, 'Access denied');
  if (parseFloat(full.amount) < 1000)
    throw new ApiError(400, 'Use online payment flow for gems under $1,000');
  if (full.status !== 'pending') throw new ApiError(400, 'Transaction is not pending');

  await repository.updateStatus(transactionId, sellerId, 'completed');

  if (full.auction_id) {
    await walletService.releaseBidDeposit(full.buyer_id, full.auction_id);
  }

  await repository.notifyUser(
    full.buyer_id, 'auction_won', 'Transaction Confirmed',
    `The seller has confirmed your purchase of "${full.gem.title}".`,
    { transaction_id: transactionId }
  );

  return await repository.findById(transactionId);
};

const offerNextBidder = async (sellerId, transactionId) => {
  const full = await repository.findById(transactionId);
  if (full.seller_id !== sellerId) throw new ApiError(403, 'Access denied');
  if (full.status !== 'pending') throw new ApiError(400, 'Transaction is not pending');
  if (!full.auction_id) throw new ApiError(400, 'This transaction is not tied to an auction');

  const { data: bids, error } = await supabaseAdmin
    .from('bids')
    .select('bidder_id, amount, created_at')
    .eq('auction_id', full.auction_id)
    .order('amount', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw new ApiError(500, error.message);

  const nextBid = (bids || []).find((bid) => bid.bidder_id !== full.buyer_id);
  if (!nextBid) throw new ApiError(400, 'No next bidder available');

  await walletService.transferPenaltyToSeller(full.buyer_id, full.seller_id, full.auction_id);

  await repository.updateStatus(transactionId, sellerId, 'disputed');

  const offerRecord = await supabaseAdmin
    .from('second_chance_offers')
    .insert({
      auction_id: full.auction_id,
      transaction_id: transactionId,
      original_winner_id: full.buyer_id,
      next_bidder_id: nextBid.bidder_id,
      seller_id: full.seller_id,
      amount: nextBid.amount,
      status: 'pending',
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (offerRecord.error) throw new ApiError(500, offerRecord.error.message);

  const newTxn = await repository.create({
    auction_id: full.auction_id,
    gem_id: full.gem_id,
    buyer_id: nextBid.bidder_id,
    seller_id: full.seller_id,
    amount: nextBid.amount,
    type: 'auction_win',
    status: 'pending',
  });

  await repository.notifyUser(
    nextBid.bidder_id,
    'auction_won',
    'Second-Chance Offer',
    `The seller offered you "${full.gem.title}" at your last bid price of $${Number(nextBid.amount).toLocaleString()}.`,
    { auction_id: full.auction_id, transaction_id: newTxn.id, amount: nextBid.amount }
  );

  await repository.notifyUser(
    sellerId,
    'auction_won',
    'Second-Chance Offer Sent',
    `Second-chance offer sent to the next bidder for "${full.gem.title}".`,
    { auction_id: full.auction_id, transaction_id: transactionId, next_bidder_id: nextBid.bidder_id }
  );

  return { offer: offerRecord.data, transaction: newTxn };
};

const getMyPurchases = async (userId, role, filters) => {
  const result = role === 'seller'
    ? await repository.findBySeller(userId, filters)
    : await repository.findByBuyer(userId, filters);

  const enriched = await Promise.all(result.data.map(async (item) => {
    const requires_offline = parseFloat(item.amount) >= 1000;
    let can_review = false;
    if (item.status === 'completed' && role !== 'seller') {
      const { data: rev } = await supabaseAdmin
        .from('reviews').select('id')
        .eq('transaction_id', item.id)
        .eq('reviewer_id', userId)
        .maybeSingle();
      can_review = !rev;
    }
    return { ...item, requires_offline, can_review };
  }));

  return { ...result, data: enriched };
};

const getTransactionById = async (id, userId) => {
  const txn = await repository.findById(id);
  if (txn.buyer_id !== userId && txn.seller_id !== userId)
    throw new ApiError(403, 'Access denied');
  return txn;
};

module.exports = {
  initiateBuyNow, confirmPayment, markOfflineComplete,
  getMyPurchases, getTransactionById, offerNextBidder,
};
