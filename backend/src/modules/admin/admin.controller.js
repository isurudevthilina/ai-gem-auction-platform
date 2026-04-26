const catchAsync = require('../../utils/catchAsync');
const apiResponse = require('../../utils/apiResponse');
const service = require('./admin.service');

const getDashboardData = catchAsync(async (req, res) => {
  const data = await service.getDashboardData();
  apiResponse(res, 200, data, 'Dashboard data retrieved.');
});

const getPlatformStats = catchAsync(async (req, res) => {
  const stats = await service.getPlatformStats();
  apiResponse(res, 200, stats, 'Platform stats retrieved.');
});

const getRecentActivity = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const activity = await service.getRecentActivity(limit);
  apiResponse(res, 200, activity, 'Recent activity retrieved.');
});

module.exports = { getDashboardData, getPlatformStats, getRecentActivity };
