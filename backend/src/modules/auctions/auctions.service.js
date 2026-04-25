const { supabaseAdmin } = require('../../config/supabase');
const repo = require('./auctions.repository');
const walletService = require('../wallet/wallet.service');

const MIN_AUCTION_WALLET_BALANCE = 300;
const BID_SECURITY_HOLD_AMOUNT = 300;

const createAuction = async (validated, sellerId) => {
    // Verify gem exists
    const { data: gem, error: gemErr } = await supabaseAdmin
        .from('gems')
        .select('id, seller_id, status')
        .eq('id', validated.gem_id)
        .single();

    if (gemErr || !gem) return { error: 'gem_not_found' };
    if (gem.seller_id !== sellerId) return { error: 'forbidden' };
    if (gem.status === 'sold') return { error: 'gem_sold' };

    // No duplicate active auction for this gem
    const { data: existing } = await supabaseAdmin
        .from('auctions')
        .select('id')
        .eq('gem_id', validated.gem_id)
        .eq('status', 'active')
        .maybeSingle();

    if (existing) return { error: 'duplicate', existing_id: existing.id };

    const record = {
        gem_id:            validated.gem_id,
        seller_id:         sellerId,
        starting_price:    validated.starting_price,
        current_price:     validated.starting_price,
        min_bid_increment: validated.min_bid_increment,
        start_time:        validated.start_time || new Date().toISOString(),
        end_time:          validated.end_time,
        status:            'active',
    };
    if (validated.reserve_price !== undefined) {
        record.reserve_price = validated.reserve_price;
    }

    const auction = await repo.create(record);

    // Mark gem as listed
    await supabaseAdmin.from('gems').update({ status: 'listed' }).eq('id', validated.gem_id);

    return { data: auction };
};

const getAuctionById = async (id, requestUser) => {
    const auction = await repo.findById(id);
    if (!auction) return { error: 'not_found' };

    // Strip reserve_price for non-owner/non-admin
    const isOwner = requestUser && requestUser.id === auction.seller?.id;
    const isAdmin = requestUser && requestUser.role === 'admin';
    if (!isOwner && !isAdmin) {
        delete auction.reserve_price;
    }

    return { data: auction };
};

const listAuctions = async (filters) => {
    const result = await repo.findAll(filters);
    return { data: result.data, pagination: result.pagination };
};

const getSellerAuctions = async (sellerId) => {
    const data = await repo.findBySeller(sellerId);
    return { data };
};

const updateAuction = async (id, validated, requestUser) => {
    const auction = await repo.findRaw(id);
    if (!auction) return { error: 'not_found' };
    if (auction.seller_id !== requestUser.id && requestUser.role !== 'admin') {
        return { error: 'forbidden' };
    }
    if (auction.status !== 'active') return { error: 'not_active' };

    const updates = {};

    if (validated.status === 'cancelled') {
        if (auction.bid_count > 0 && requestUser.role !== 'admin') {
            return { error: 'has_bids' };
        }
        updates.status = 'cancelled';
    }

    if (validated.end_time) {
        updates.end_time = validated.end_time;
    }

    if (validated.min_bid_increment !== undefined) {
        if (auction.bid_count > 0 && requestUser.role !== 'admin') {
            return { error: 'has_bids' };
        }
        updates.min_bid_increment = validated.min_bid_increment;
    }

    if (Object.keys(updates).length === 0) {
        return { error: 'no_changes' };
    }

    const updated = await repo.update(id, updates);

    // If cancelled, reset gem to draft
    if (updates.status === 'cancelled') {
        await supabaseAdmin.from('gems').update({ status: 'draft' }).eq('id', auction.gem_id);
    }

    return { data: updated };
};

const cancelAuction = async (id, requestUser) => {
    const auction = await repo.findRaw(id);
    if (!auction) return { error: 'not_found' };
    if (auction.seller_id !== requestUser.id && requestUser.role !== 'admin') {
        return { error: 'forbidden' };
    }
    if (auction.status !== 'active') return { error: 'not_active' };
    if (auction.bid_count > 0 && requestUser.role !== 'admin') {
        return { error: 'has_bids' };
    }

    await supabaseAdmin.from('auctions').update({ status: 'cancelled' }).eq('id', id);
    await supabaseAdmin.from('gems').update({ status: 'draft' }).eq('id', auction.gem_id);

    return { success: true };
};

const placeBid = async (auctionId, bidderId, amount) => {
    const securityState = await walletService.getBidSecurityState(bidderId, auctionId);

    if (Number(securityState.effective_balance || 0) < MIN_AUCTION_WALLET_BALANCE) {
        return {
            error: 'minimum_wallet_balance_required',
            meta: {
                error_message: `A minimum wallet balance of $${MIN_AUCTION_WALLET_BALANCE} is required to join an auction. Please top up first.`,
                required_min_wallet_balance: MIN_AUCTION_WALLET_BALANCE,
                current_wallet_balance: Number(securityState.available_balance || 0),
                effective_wallet_balance: Number(securityState.effective_balance || 0),
                required_hold_amount: BID_SECURITY_HOLD_AMOUNT,
                top_up_path: '/wallet/top-up',
            },
        };
    }

    const { data: previousWinningBid } = await supabaseAdmin
        .from('bids')
        .select('bidder_id, amount')
        .eq('auction_id', auctionId)
        .eq('is_winning', true)
        .maybeSingle();

    const { data: result, error } = await supabaseAdmin.rpc('place_bid', {
        p_auction_id: auctionId,
        p_bidder_id:  bidderId,
        p_amount:     amount,
    });

    if (error) throw error;

    if (!result.success) {
        return { error: result.error_code, meta: result };
    }

    const { deposit_amount } = await walletService.lockBidDeposit(
        bidderId,
        auctionId,
        amount,
        BID_SECURITY_HOLD_AMOUNT
    );

    if (previousWinningBid && previousWinningBid.bidder_id && previousWinningBid.bidder_id !== bidderId) {
        await walletService.releaseBidDeposit(previousWinningBid.bidder_id, auctionId);
    }

    return {
        data: {
            bid_id:     result.bid_id,
            new_price:  result.new_price,
            auction_id: result.auction_id,
            deposit_amount,
        },
    };
};

const getBidHistory = async (auctionId, { page, limit }) => {
    const result = await repo.findBids({ auction_id: auctionId, page, limit });
    return { data: result.data, pagination: result.pagination };
};

module.exports = {
    createAuction,
    getAuctionById,
    listAuctions,
    getSellerAuctions,
    updateAuction,
    cancelAuction,
    placeBid,
    getBidHistory,
};
