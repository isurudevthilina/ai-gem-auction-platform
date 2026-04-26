const repository = require('./notifications.repository');

const getNotifications = async (userId, filters) => {
  return repository.findByUser(userId, filters);
};

const getUnreadCount = async (userId) => {
  return repository.getUnreadCount(userId);
};

const getRecent = async (userId) => {
  return repository.getRecent(userId, 5);
};

const markAsRead = async (userId, ids) => {
  return repository.markAsRead(userId, ids);
};

const markAllAsRead = async (userId) => {
  return repository.markAllAsRead(userId);
};

const deleteOne = async (userId, notificationId) => {
  return repository.deleteOne(userId, notificationId);
};

const deleteAllRead = async (userId) => {
  return repository.deleteAllRead(userId);
};

module.exports = {
  getNotifications,
  getUnreadCount,
  getRecent,
  markAsRead,
  markAllAsRead,
  deleteOne,
  deleteAllRead,
};
