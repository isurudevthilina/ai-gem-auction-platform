const repository = require('./watchlist.repository');
const ApiError = require('../../utils/apiError');

const getFolders = async (userId) => {
    const realFolders = await repository.getFolders(userId);
    const totalCount = await repository.countAll(userId);
    const uncategorizedCount = await repository.countByFolder(userId, null);

    const endedFolder = realFolders.find((f) => f.is_system && f.name === 'Ended');
    const userFolders = realFolders.filter((f) => !(f.is_system && f.name === 'Ended'));

    const result = [
        { id: 'all', name: 'All Saved', gem_count: totalCount },
        { id: 'uncategorized', name: 'Uncategorized', gem_count: uncategorizedCount },
        ...userFolders,
    ];

    if (endedFolder) {
        const endedCount = await repository.countByFolder(userId, endedFolder.id);
        result.push({ ...endedFolder, gem_count: endedCount });
    }

    return result;
};

const createFolder = async (userId, name) => {
    return repository.createFolder(userId, name);
};

const renameFolder = async (folderId, userId, name) => {
    if (folderId === 'all' || folderId === 'uncategorized') {
        throw new ApiError(400, 'Cannot rename this folder');
    }
    if (name.trim() === 'Ended') {
        throw new ApiError(400, 'Folder name not allowed');
    }
    return repository.renameFolder(folderId, userId, name);
};

const deleteFolder = async (folderId, userId) => {
    if (folderId === 'all' || folderId === 'uncategorized') {
        throw new ApiError(400, 'Cannot delete this folder');
    }
    return repository.deleteFolder(folderId, userId);
};

const getWatchlist = async (userId, folderId) => {
    if (folderId === 'all' || !folderId) {
        return repository.getAll(userId);
    }
    return repository.getWatchlistByFolder(userId, folderId);
};

const addToWatchlist = async (userId, data) => {
    return repository.addToWatchlist(userId, data.gem_id, data.auction_id, data.folder_id);
};

const removeFromWatchlist = async (userId, gemId) => {
    return repository.removeFromWatchlist(userId, gemId);
};

const removeOlderThan = async (userId, days) => {
    return repository.removeOlderThan(userId, days);
};

const moveToFolder = async (userId, watchlistId, folderId) => {
    const resolvedFolderId = folderId === 'uncategorized' ? null : folderId;
    return repository.moveToFolder(userId, watchlistId, resolvedFolderId);
};

const checkWatchlist = async (userId, gemId) => {
    return repository.isInWatchlist(userId, gemId);
};

module.exports = {
    getFolders,
    createFolder,
    renameFolder,
    deleteFolder,
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    removeOlderThan,
    moveToFolder,
    checkWatchlist,
};
