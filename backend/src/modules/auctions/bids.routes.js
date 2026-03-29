const express = require('express');
const router = express.Router({ mergeParams: true });
const bidsCtrl = require('./bids.controller');
const { authenticate, optionalAuth } = require('../../middleware/auth.middleware');
const { placeBidSchema, validate } = require('./auctions.validation');

router.post('/', authenticate, validate(placeBidSchema), bidsCtrl.placeBid);
router.get('/',  optionalAuth, bidsCtrl.getBidHistory);

module.exports = router;
