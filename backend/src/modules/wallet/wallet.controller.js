const catchAsync = require('../../utils/catchAsync');
const apiResponse = require('../../utils/apiResponse');
const walletService = require('./wallet.service');

const getMyWallet = catchAsync(async (req, res) => {
    const wallet = await walletService.getWallet(req.user.id);
    apiResponse(res, 200, wallet, 'Wallet retrieved.');
});

const topUpWallet = catchAsync(async (req, res) => {
    const wallet = await walletService.topUpWallet(req.user.id, req.body);
    apiResponse(res, 200, wallet, 'Wallet topped up successfully.');
});

const buyGems = catchAsync(async (req, res) => {
    const result = await walletService.buyGems(req.user.id, req.body);
    apiResponse(res, 200, result, 'Gem purchase completed successfully.');
});

const withdrawToBank = catchAsync(async (req, res) => {
    const result = await walletService.withdrawToBank(req.user.id, req.body);
    apiResponse(res, 200, result, 'Transfer successful.');
});

module.exports = { getMyWallet, topUpWallet, buyGems, withdrawToBank };
