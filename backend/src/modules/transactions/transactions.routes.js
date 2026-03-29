const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const ctrl = require('./transactions.controller');
const { buyNowSchema, confirmPaymentSchema } =
  require('./transactions.validation');

router.use(authenticate);

// Static routes BEFORE parameterised to avoid conflicts
router.get('/', ctrl.getMyPurchases);
router.post('/buy-now', validate(buyNowSchema), ctrl.initiateBuyNow);
router.get('/:id', ctrl.getTransactionById);
router.post('/:id/confirm-payment',
  validate(confirmPaymentSchema), ctrl.confirmPayment);
router.patch('/:id/mark-complete', ctrl.markOfflineComplete);

module.exports = router;
