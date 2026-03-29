const service = require('./auctions.service');

const catchAsync = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

const listAuctions = catchAsync(async (req, res) => {
    const result = await service.listAuctions(req.query);
    res.json({ success: true, ...result });
});

const getAuction = catchAsync(async (req, res) => {
    const result = await service.getAuctionById(req.params.id, req.user || null);
    if (result.error === 'not_found') {
        return res.status(404).json({ success: false, message: 'Auction not found.' });
    }
    res.json({ success: true, data: result.data });
});

const createAuction = catchAsync(async (req, res) => {
    const result = await service.createAuction(req.validated, req.user.id);
    if (result.error === 'gem_not_found') return res.status(404).json({ success: false, message: 'Gem not found.' });
    if (result.error === 'forbidden')     return res.status(403).json({ success: false, message: 'You can only auction your own gems.' });
    if (result.error === 'gem_sold')      return res.status(400).json({ success: false, message: 'Gem already sold.' });
    if (result.error === 'duplicate') {
        return res.status(409).json({
            success: false,
            message: 'An active auction already exists for this gem.',
            existing_auction_id: result.existing_id,
        });
    }
    res.status(201).json({ success: true, message: 'Auction created.', data: result.data });
});

const getMyAuctions = catchAsync(async (req, res) => {
    const result = await service.getSellerAuctions(req.user.id);
    res.json({ success: true, data: result.data });
});

const updateAuction = catchAsync(async (req, res) => {
    const result = await service.updateAuction(req.params.id, req.validated, req.user);
    if (result.error === 'not_found')   return res.status(404).json({ success: false, message: 'Auction not found.' });
    if (result.error === 'forbidden')   return res.status(403).json({ success: false, message: 'You do not own this auction.' });
    if (result.error === 'not_active')  return res.status(400).json({ success: false, message: 'Cannot modify a non-active auction.' });
    if (result.error === 'has_bids')    return res.status(400).json({ success: false, message: 'Cannot modify — bids exist. Contact admin.' });
    if (result.error === 'no_changes')  return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    res.json({ success: true, message: 'Auction updated.', data: result.data });
});

const cancelAuction = catchAsync(async (req, res) => {
    const result = await service.cancelAuction(req.params.id, req.user);
    if (result.error === 'not_found')  return res.status(404).json({ success: false, message: 'Auction not found.' });
    if (result.error === 'forbidden')  return res.status(403).json({ success: false, message: 'You do not own this auction.' });
    if (result.error === 'not_active') return res.status(400).json({ success: false, message: 'Auction is not active.' });
    if (result.error === 'has_bids')   return res.status(400).json({ success: false, message: 'Cannot delete — bids exist. Contact admin.' });
    res.json({ success: true, message: 'Auction cancelled successfully.' });
});

module.exports = { listAuctions, getAuction, createAuction, getMyAuctions, updateAuction, cancelAuction };
