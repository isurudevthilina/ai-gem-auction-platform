const service = require('./auctions.service');
const bidService = require('./bids.service');
const catchAsync = require('../../utils/catchAsync');
const apiResponse = require('../../utils/apiResponse');

const _catchAsync = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

const placeBid = _catchAsync(async (req, res) => {
    const result = await service.placeBid(req.params.id, req.user.id, req.validated.amount);

    if (result.error) {
        const statusMap = {
            auction_not_found:   404,
            auction_not_active:  400,
            auction_not_started: 400,
            auction_ended:       400,
            seller_cannot_bid:   403,
            bid_too_low:         422,
            minimum_wallet_balance_required: 400,
            internal_error:      500,
        };
        const statusCode = statusMap[result.error] || 400;
        return res.status(statusCode).json({
            success: false,
            message: result.meta?.error_message || result.error,
            error_code: result.error,
            min_required: result.meta?.min_required,
            required_min_wallet_balance: result.meta?.required_min_wallet_balance,
            current_wallet_balance: result.meta?.current_wallet_balance,
            effective_wallet_balance: result.meta?.effective_wallet_balance,
            required_hold_amount: result.meta?.required_hold_amount,
        });
    }

    res.status(201).json({
        success: true,
        message: 'Bid placed successfully!',
        data: result.data,
    });
});

const getBidHistory = _catchAsync(async (req, res) => {
    const result = await service.getBidHistory(req.params.id, req.query);
    res.json({ success: true, ...result });
});

// ── Personal bid history handlers ────────────────────────────────────────

const getMyBidHistory = catchAsync(async (req, res) => {
    const filters = {
        status: req.query.status || 'all',
        sort:   req.query.sort   || 'newest',
        page:   req.query.page   || 0,
        limit:  req.query.limit  || 12,
    };
    const result = await bidService.getMyBidHistory(req.user.id, filters);
    apiResponse(res, 200, result, 'Bid history retrieved.');
});

const getMyBidStats = catchAsync(async (req, res) => {
    const stats = await bidService.getBidStats(req.user.id);
    apiResponse(res, 200, stats, 'Bid stats retrieved.');
});

const getMyAuctionBids = catchAsync(async (req, res) => {
    const bids = await bidService.getBidsByAuction(req.params.auctionId, req.user.id);
    apiResponse(res, 200, bids, 'Bids retrieved.');
});

module.exports = { placeBid, getBidHistory, getMyBidHistory, getMyBidStats, getMyAuctionBids };
