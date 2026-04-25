const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const controller = require('./wallet.controller');
const { topUpSchema, buyGemsSchema, withdrawSchema } = require('./wallet.validation');

router.use(authenticate);
router.get('/me', controller.getMyWallet);
router.post('/top-up', validate(topUpSchema), controller.topUpWallet);
router.post('/buy-gems', validate(buyGemsSchema), controller.buyGems);
router.post('/withdraw', validate(withdrawSchema), controller.withdrawToBank);

module.exports = router;
