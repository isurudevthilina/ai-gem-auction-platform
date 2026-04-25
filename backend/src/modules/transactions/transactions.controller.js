const catchAsync = require('../../utils/catchAsync');
const apiResponse = require('../../utils/apiResponse');
const service = require('./transactions.service');

const initiateBuyNow = catchAsync(async (req, res) => {
  const result = await service.initiateBuyNow(req.user.id, req.body.gem_id);
  apiResponse(res, 201, result, 'Purchase initiated.');
});

const confirmPayment = catchAsync(async (req, res) => {
  const txn = await service.confirmPayment(
    req.user.id, req.params.id, req.body.payment_reference
  );
  apiResponse(res, 200, txn, 'Payment confirmed.');
});

const markOfflineComplete = catchAsync(async (req, res) => {
  const txn = await service.markOfflineComplete(req.user.id, req.params.id);
  apiResponse(res, 200, txn, 'Transaction marked complete.');
});

const offerNextBidder = catchAsync(async (req, res) => {
  const result = await service.offerNextBidder(req.user.id, req.params.id);
  apiResponse(res, 200, result, 'Second-chance offer created.');
});

const getMyPurchases = catchAsync(async (req, res) => {
  const filters = {
    status: req.query.status || 'all',
    page: req.query.page || 0,
    limit: req.query.limit || 12,
  };
  const role = req.query.role === 'seller' ? 'seller' : 'buyer';
  const result = await service.getMyPurchases(req.user.id, role, filters);
  apiResponse(res, 200, result, 'Transactions retrieved.');
});

const getTransactionById = catchAsync(async (req, res) => {
  const txn = await service.getTransactionById(req.params.id, req.user.id);
  apiResponse(res, 200, txn, 'Transaction retrieved.');
});

module.exports = {
  initiateBuyNow, confirmPayment, markOfflineComplete,
  getMyPurchases, getTransactionById, offerNextBidder,
};
