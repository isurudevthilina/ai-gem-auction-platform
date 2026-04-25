const { supabaseAdmin } = require('../../config/supabase');
const ApiError = require('../../utils/apiError');

const toMoney = (value) => Number(Number(value || 0).toFixed(2));
const MIN_TOP_UP_WHEN_WALLET_ZERO_USD = 300;
const MAX_TOP_UP_USD = 4000;
const BID_SECURITY_HOLD_USD = 300;
const GEMS_PER_USD = 10;

const ensureWallet = async (userId) => {
    const { data: existing, error } = await supabaseAdmin
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) throw new ApiError(500, error.message);
    if (existing) return existing;

    const { data: created, error: createError } = await supabaseAdmin
        .from('wallets')
        .insert({ user_id: userId, available_balance: 0, locked_balance: 0 })
        .select()
        .single();

    if (createError) throw new ApiError(500, createError.message);
    return created;
};

const getWallet = async (userId) => {
    const wallet = await ensureWallet(userId);
    return wallet;
};

const getBidSecurityState = async (userId, auctionId) => {
    const wallet = await ensureWallet(userId);

    const { data: existingHold, error } = await supabaseAdmin
        .from('wallet_holds')
        .select('deposit_amount, status')
        .eq('user_id', userId)
        .eq('auction_id', auctionId)
        .eq('status', 'locked')
        .maybeSingle();

    if (error) throw new ApiError(500, error.message);

    const availableBalance = toMoney(wallet.available_balance);
    const lockedForThisAuction = toMoney(existingHold?.deposit_amount || 0);

    return {
        available_balance: availableBalance,
        locked_for_this_auction: lockedForThisAuction,
        effective_balance: toMoney(availableBalance + lockedForThisAuction),
        has_locked_hold: !!existingHold,
        required_min_balance: BID_SECURITY_HOLD_USD,
        required_hold_amount: BID_SECURITY_HOLD_USD,
    };
};

const topUpWallet = async (userId, payload) => {
    const amount = toMoney(payload.amount);
    if (amount <= 0) throw new ApiError(400, 'Top-up amount must be greater than zero');
    if (amount > MAX_TOP_UP_USD) {
        throw new ApiError(400, `Top-up amount is too high. Maximum allowed is USD ${MAX_TOP_UP_USD}.`);
    }

    const wallet = await ensureWallet(userId);
    const currentBalance = toMoney(wallet.available_balance);

    if (currentBalance <= 0 && amount < MIN_TOP_UP_WHEN_WALLET_ZERO_USD) {
        throw new ApiError(400, `When wallet balance is zero, minimum top-up is USD ${MIN_TOP_UP_WHEN_WALLET_ZERO_USD}.`);
    }

    const newBalance = toMoney(Number(wallet.available_balance || 0) + amount);

    const { data: updated, error: updateError } = await supabaseAdmin
        .from('wallets')
        .update({ available_balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

    if (updateError) throw new ApiError(500, updateError.message);

    const { error: topUpError } = await supabaseAdmin
        .from('wallet_topups')
        .insert({
            user_id: userId,
            amount,
            card_last4: (payload.card_number || '').replace(/\D/g, '').slice(-4) || null,
            payment_reference: `DEMO-${Date.now()}`,
            metadata: {
                holder_name: payload.holder_name || null,
                expiry: payload.expiry || null,
                currency_mode: payload.currency_mode || 'auto',
                currency_code: payload.currency_code || 'USD',
                display_amount: payload.display_amount ?? amount,
            },
        });

    if (topUpError) throw new ApiError(500, topUpError.message);

    return updated;
};

const lockBidDeposit = async (userId, auctionId, bidAmount, holdAmount = BID_SECURITY_HOLD_USD) => {
    const requiredDeposit = toMoney(holdAmount);
    const wallet = await ensureWallet(userId);

    const { data: existingHold, error: holdError } = await supabaseAdmin
        .from('wallet_holds')
        .select('*')
        .eq('user_id', userId)
        .eq('auction_id', auctionId)
        .eq('status', 'locked')
        .maybeSingle();

    if (holdError) throw new ApiError(500, holdError.message);

    const currentLocked = toMoney(wallet.locked_balance);
    const currentAvailable = toMoney(wallet.available_balance);

    const existingDeposit = existingHold ? toMoney(existingHold.deposit_amount) : 0;
    const diff = toMoney(requiredDeposit - existingDeposit);

    if (diff > 0 && currentAvailable < diff) {
        throw new ApiError(400, 'Insufficient wallet balance for bidding deposit');
    }

    const nextAvailable = toMoney(currentAvailable - diff);
    const nextLocked = toMoney(currentLocked + diff);

    const { error: updateError } = await supabaseAdmin
        .from('wallets')
        .update({ available_balance: nextAvailable, locked_balance: nextLocked, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

    if (updateError) throw new ApiError(500, updateError.message);

    const holdPayload = {
        user_id: userId,
        auction_id: auctionId,
        bid_amount: toMoney(bidAmount),
        deposit_amount: requiredDeposit,
        status: 'locked',
        updated_at: new Date().toISOString(),
    };

    if (existingHold) {
        const { error: holdUpdateError } = await supabaseAdmin
            .from('wallet_holds')
            .update(holdPayload)
            .eq('id', existingHold.id);
        if (holdUpdateError) throw new ApiError(500, holdUpdateError.message);
    } else {
        const { error: holdInsertError } = await supabaseAdmin
            .from('wallet_holds')
            .insert(holdPayload);
        if (holdInsertError) throw new ApiError(500, holdInsertError.message);
    }

    return { deposit_amount: requiredDeposit };
};

const releaseBidDeposit = async (userId, auctionId) => {
    const { data: hold, error } = await supabaseAdmin
        .from('wallet_holds')
        .select('*')
        .eq('user_id', userId)
        .eq('auction_id', auctionId)
        .eq('status', 'locked')
        .maybeSingle();

    if (error) throw new ApiError(500, error.message);
    if (!hold) return { released: false, amount: 0 };

    const wallet = await ensureWallet(userId);
    const amount = toMoney(hold.deposit_amount);

    const { error: updateError } = await supabaseAdmin
        .from('wallets')
        .update({
            available_balance: toMoney(Number(wallet.available_balance || 0) + amount),
            locked_balance: toMoney(Number(wallet.locked_balance || 0) - amount),
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

    if (updateError) throw new ApiError(500, updateError.message);

    const { error: holdUpdateError } = await supabaseAdmin
        .from('wallet_holds')
        .update({ status: 'released', released_at: new Date().toISOString() })
        .eq('id', hold.id);

    if (holdUpdateError) throw new ApiError(500, holdUpdateError.message);

    return { released: true, amount };
};

const transferPenaltyToSeller = async (winnerId, sellerId, auctionId) => {
    const { data: hold, error } = await supabaseAdmin
        .from('wallet_holds')
        .select('*')
        .eq('user_id', winnerId)
        .eq('auction_id', auctionId)
        .eq('status', 'locked')
        .maybeSingle();

    if (error) throw new ApiError(500, error.message);
    if (!hold) return { transferred: false, amount: 0 };

    const amount = toMoney(hold.deposit_amount);
    const winnerWallet = await ensureWallet(winnerId);
    const sellerWallet = await ensureWallet(sellerId);

    const { error: winnerUpdateError } = await supabaseAdmin
        .from('wallets')
        .update({
            locked_balance: toMoney(Number(winnerWallet.locked_balance || 0) - amount),
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', winnerId);

    if (winnerUpdateError) throw new ApiError(500, winnerUpdateError.message);

    const { error: sellerUpdateError } = await supabaseAdmin
        .from('wallets')
        .update({
            available_balance: toMoney(Number(sellerWallet.available_balance || 0) + amount),
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', sellerId);

    if (sellerUpdateError) throw new ApiError(500, sellerUpdateError.message);

    const { error: holdUpdateError } = await supabaseAdmin
        .from('wallet_holds')
        .update({
            status: 'transferred',
            released_at: new Date().toISOString(),
            transferred_to_user_id: sellerId,
        })
        .eq('id', hold.id);

    if (holdUpdateError) throw new ApiError(500, holdUpdateError.message);

    return { transferred: true, amount };
};

const buyGems = async (userId, payload) => {
    const usdAmount = toMoney(payload.usd_amount);
    if (usdAmount <= 0) throw new ApiError(400, 'Purchase amount must be greater than zero');

    const wallet = await ensureWallet(userId);
    const available = toMoney(wallet.available_balance);

    if (available < usdAmount) {
        throw new ApiError(400, 'Insufficient available wallet balance for gem purchase');
    }

    const gemsAmount = Math.floor(Number(usdAmount) * GEMS_PER_USD);
    if (gemsAmount <= 0) {
        throw new ApiError(400, 'Amount is too low to purchase gems');
    }

    const nextAvailable = toMoney(available - usdAmount);
    const nextGemBalance = Number(wallet.gem_balance || 0) + gemsAmount;

    const { data: updatedWallet, error: walletErr } = await supabaseAdmin
        .from('wallets')
        .update({
            available_balance: nextAvailable,
            gem_balance: nextGemBalance,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

    if (walletErr) throw new ApiError(500, walletErr.message);

    const { data: purchase, error: purchaseErr } = await supabaseAdmin
        .from('wallet_gem_purchases')
        .insert({
            user_id: userId,
            usd_amount: usdAmount,
            gems_amount: gemsAmount,
            exchange_rate: GEMS_PER_USD,
            metadata: {
                note: 'Simulated gem purchase from virtual wallet',
            },
        })
        .select()
        .single();

    if (purchaseErr) throw new ApiError(500, purchaseErr.message);

    return {
        wallet: updatedWallet,
        purchase,
        gems_received: gemsAmount,
        exchange_rate: GEMS_PER_USD,
    };
};

const withdrawToBank = async (userId, payload) => {
    const amount = toMoney(payload.amount);
    if (amount <= 0) throw new ApiError(400, 'Withdrawal amount must be greater than zero');

    const wallet = await ensureWallet(userId);
    const available = toMoney(wallet.available_balance);

    if (available < amount) {
        throw new ApiError(400, 'Insufficient available wallet balance for withdrawal');
    }

    const nextAvailable = toMoney(available - amount);

    const { data: updatedWallet, error: walletErr } = await supabaseAdmin
        .from('wallets')
        .update({ available_balance: nextAvailable, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

    if (walletErr) throw new ApiError(500, walletErr.message);

    const cleanAccountNo = String(payload.account_number || '').replace(/\s+/g, '');
    const { data: withdrawal, error: withdrawalErr } = await supabaseAdmin
        .from('wallet_withdrawals')
        .insert({
            user_id: userId,
            amount,
            bank_name: payload.bank_name,
            account_number: cleanAccountNo,
            transfer_reference: `SIM-WD-${Date.now()}`,
            status: 'successful',
            metadata: {
                note: 'Simulated transfer to bank account',
            },
        })
        .select()
        .single();

    if (withdrawalErr) throw new ApiError(500, withdrawalErr.message);

    return {
        wallet: updatedWallet,
        withdrawal,
    };
};

module.exports = {
    getWallet,
    getBidSecurityState,
    topUpWallet,
    lockBidDeposit,
    releaseBidDeposit,
    transferPenaltyToSeller,
    buyGems,
    withdrawToBank,
};
