const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const bidsCtrl = require('./bids.controller');

// All personal bid routes require authentication
router.use(authenticate);

// Static routes BEFORE parameterised to avoid conflicts
router.get('/my-history', bidsCtrl.getMyBidHistory);
router.get('/my-stats',   bidsCtrl.getMyBidStats);
router.get('/:auctionId/my-bids', bidsCtrl.getMyAuctionBids);

module.exports = router;
