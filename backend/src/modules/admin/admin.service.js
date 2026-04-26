const repository = require('./admin.repository');

const getDashboardData = async () => {
  const [stats, recentUsers, recentListings, recentActivity, pendingCerts, auctionsEndingSoon] =
    await Promise.all([
      repository.getPlatformStats(),
      repository.getRecentUsers(8),
      repository.getRecentListings(8),
      repository.getRecentActivity(20),
      repository.getPendingCertificates(),
      repository.getAuctionsEndingSoon(),
    ]);

  return { stats, recentUsers, recentListings, recentActivity, pendingCerts, auctionsEndingSoon };
};

const getPlatformStats = async () => repository.getPlatformStats();

const getRecentActivity = async (limit) => repository.getRecentActivity(limit);

module.exports = { getDashboardData, getPlatformStats, getRecentActivity };
