const { supabaseAdmin } = require('../../config/supabase');

const REPAIR_LOOKBACK_DAYS = 3650;
let cronBusy = false;

const toNum = (v) => Number(v || 0);

const getTopBid = async (auctionId) => {
  const { data, error } = await supabaseAdmin
    .from('bids')
    .select('id, bidder_id, amount, created_at')
    .eq('auction_id', auctionId)
    .order('amount', { ascending: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data || null;
};

const ensureWinnerTransaction = async (auction, topBid) => {
  const { data: existing, error: existingErr } = await supabaseAdmin
    .from('transactions')
    .select('id, buyer_id, status, type')
    .eq('auction_id', auction.id)
    .eq('type', 'auction_win')
    .eq('buyer_id', topBid.bidder_id)
    .maybeSingle();

  if (existingErr) throw existingErr;

  if (existing) {
    return { created: false };
  }

  // If there is an older pending auction transaction for this auction with the wrong buyer,
  // repoint it to the deterministic winner instead of creating duplicates.
  const { data: pendingAny, error: pendingAnyErr } = await supabaseAdmin
    .from('transactions')
    .select('id, buyer_id, status, type')
    .eq('auction_id', auction.id)
    .eq('type', 'auction_win')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pendingAnyErr) throw pendingAnyErr;

  if (pendingAny) {
    const { error: repointErr } = await supabaseAdmin
      .from('transactions')
      .update({
        buyer_id: topBid.bidder_id,
        seller_id: auction.seller_id,
        gem_id: auction.gem_id,
        amount: topBid.amount,
        status: 'pending',
      })
      .eq('id', pendingAny.id);

    if (repointErr) throw repointErr;

    await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: topBid.bidder_id,
          type: 'auction_won',
          title: 'You won the auction!',
          message: `Congratulations! Your bid of $${topBid.amount} won the auction for ${auction.gem?.title || 'a gem'}.`,
          data: {
            auction_id: auction.id,
            gem_id: auction.gem_id,
            amount: topBid.amount,
          },
        },
      ]);

    return { created: false, repointed: true, id: pendingAny.id };
  }

  const { data: inserted, error: insertErr } = await supabaseAdmin
    .from('transactions')
    .insert({
      auction_id: auction.id,
      gem_id: auction.gem_id,
      buyer_id: topBid.bidder_id,
      seller_id: auction.seller_id,
      amount: topBid.amount,
      type: 'auction_win',
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertErr) throw insertErr;

  await supabaseAdmin
    .from('notifications')
    .insert([
      {
        user_id: topBid.bidder_id,
        type: 'auction_won',
        title: 'You won the auction!',
        message: `Congratulations! Your bid of $${topBid.amount} won the auction for ${auction.gem?.title || 'a gem'}.`,
        data: {
          auction_id: auction.id,
          gem_id: auction.gem_id,
          amount: topBid.amount,
        },
      },
      {
        user_id: auction.seller_id,
        type: 'auction_started',
        title: 'Your gem has been sold!',
        message: `Your auction ended. Final price: $${topBid.amount}`,
        data: {
          auction_id: auction.id,
          gem_id: auction.gem_id,
          amount: topBid.amount,
          buyer_id: topBid.bidder_id,
        },
      },
    ]);

  return { created: true, id: inserted.id };
};

const completeExpiredActiveAuctions = async () => {
  const nowIso = new Date().toISOString();
  const { data: expired, error } = await supabaseAdmin
    .from('auctions')
    .select('id, gem_id, seller_id, current_price, reserve_price, bid_count, end_time, status, winner_id, gem:gems(title)')
    .eq('status', 'active')
    .lt('end_time', nowIso)
    .limit(200);

  if (error) throw error;

  let completed = 0;

  for (const auction of expired || []) {
    const topBid = await getTopBid(auction.id);
    const winningAmount = topBid ? toNum(topBid.amount) : toNum(auction.current_price);

    const reserveNotMet = auction.reserve_price != null && winningAmount < toNum(auction.reserve_price);

    const payload = reserveNotMet
      ? { status: 'reserve_not_met', winner_id: null }
      : { status: 'completed', winner_id: topBid?.bidder_id || null };

    // Guard with status=active so duplicate runners do not double-process.
    const update = await supabaseAdmin
      .from('auctions')
      .update(payload)
      .eq('id', auction.id)
      .eq('status', 'active')
      .select('id');

    if (update.error) throw update.error;
    if (!update.data || update.data.length === 0) continue;

    completed += 1;

    if (reserveNotMet) continue;

    if (topBid) {
      await ensureWinnerTransaction(auction, topBid);

      await supabaseAdmin
        .from('gems')
        .update({ status: 'sold' })
        .eq('id', auction.gem_id);
    }
  }

  return completed;
};

const repairCompletedWinnerMismatches = async () => {
  const now = new Date();
  const start = new Date(now.getTime() - REPAIR_LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const nowIso = now.toISOString();

  const { data: completed, error } = await supabaseAdmin
    .from('auctions')
    .select('id, gem_id, seller_id, current_price, reserve_price, bid_count, end_time, status, winner_id, gem:gems(title)')
    .eq('status', 'completed')
    .gt('bid_count', 0)
    .gte('end_time', start)
    .lt('end_time', nowIso)
    .limit(200);

  if (error) throw error;

  let repaired = 0;

  for (const auction of completed || []) {
    const topBid = await getTopBid(auction.id);
    if (!topBid) continue;
    if (auction.winner_id === topBid.bidder_id) continue;

    const winnerUpdate = await supabaseAdmin
      .from('auctions')
      .update({ winner_id: topBid.bidder_id, current_price: topBid.amount })
      .eq('id', auction.id)
      .eq('status', 'completed');

    if (winnerUpdate.error) throw winnerUpdate.error;

    await ensureWinnerTransaction(auction, topBid);

    await supabaseAdmin
      .from('gems')
      .update({ status: 'sold' })
      .eq('id', auction.gem_id);

    repaired += 1;
  }

  return repaired;
};

const runAuctionCompletionCron = async () => {
  if (cronBusy) {
    return { skipped: true, completed: 0, repaired: 0 };
  }

  cronBusy = true;
  try {
    const completed = await completeExpiredActiveAuctions();
    const repaired = await repairCompletedWinnerMismatches();
    return { skipped: false, completed, repaired };
  } finally {
    cronBusy = false;
  }
};

module.exports = {
  runAuctionCompletionCron,
};
