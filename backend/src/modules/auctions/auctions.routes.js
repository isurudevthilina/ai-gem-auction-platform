const express = require('express');
const router = express.Router();
const ctrl = require('./auctions.controller');
const { authenticate, requireRole, optionalAuth } = require('../../middleware/auth.middleware');
const { createAuctionSchema, updateAuctionSchema, validate } = require('./auctions.validation');

router.get('/',       optionalAuth,                                              ctrl.listAuctions);
router.get('/my',     authenticate, requireRole('seller', 'admin'),              ctrl.getMyAuctions);
router.get('/:id',    optionalAuth,                                              ctrl.getAuction);
router.post('/',      authenticate, requireRole('seller', 'admin'), validate(createAuctionSchema), ctrl.createAuction);
router.patch('/:id',  authenticate, requireRole('seller', 'admin'), validate(updateAuctionSchema), ctrl.updateAuction);
router.delete('/:id', authenticate, requireRole('seller', 'admin'),              ctrl.cancelAuction);

module.exports = router;
