const catchAsync = require('../../utils/catchAsync');
const apiResponse = require('../../utils/apiResponse');
const service = require('./notifications.service');

const getNotifications = catchAsync(async (req, res) => {
  const filters = {
    type: req.query.type,
    is_read: req.query.is_read,
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  };
  const result = await service.getNotifications(req.user.id, filters);
  apiResponse(res, 200, result, 'Notifications fetched');
});

const getUnreadCount = catchAsync(async (req, res) => {
  const count = await service.getUnreadCount(req.user.id);
  apiResponse(res, 200, { count }, 'Unread count fetched');
});

const getRecent = catchAsync(async (req, res) => {
  const recent = await service.getRecent(req.user.id);
  apiResponse(res, 200, recent, 'Recent notifications fetched');
});

const markAsRead = catchAsync(async (req, res) => {
  const result = await service.markAsRead(req.user.id, req.body.ids);
  apiResponse(res, 200, result, 'Notifications marked as read');
});

const markAllAsRead = catchAsync(async (req, res) => {
  const result = await service.markAllAsRead(req.user.id);
  apiResponse(res, 200, result, 'All notifications marked as read');
});

const deleteOne = catchAsync(async (req, res) => {
  const result = await service.deleteOne(req.user.id, req.params.id);
  apiResponse(res, 200, result, 'Notification deleted');
});

const deleteAllRead = catchAsync(async (req, res) => {
  const result = await service.deleteAllRead(req.user.id);
  apiResponse(res, 200, result, 'Read notifications cleared');
});

module.exports = {
  getNotifications,
  getUnreadCount,
  getRecent,
  markAsRead,
  markAllAsRead,
  deleteOne,
  deleteAllRead,
};
