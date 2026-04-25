const service = require('./watchlist.service');
const catchAsync = require('../../utils/catchAsync');
const apiResponse = require('../../utils/apiResponse');

const getFolders = catchAsync(async (req, res) => {
    const folders = await service.getFolders(req.user.id);
    apiResponse(res, 200, folders, 'Folders retrieved.');
});

const createFolder = catchAsync(async (req, res) => {
    const folder = await service.createFolder(req.user.id, req.body.name);
    apiResponse(res, 201, folder, 'Folder created.');
});

const renameFolder = catchAsync(async (req, res) => {
    const folder = await service.renameFolder(req.params.id, req.user.id, req.body.name);
    apiResponse(res, 200, folder, 'Folder renamed.');
});

const deleteFolder = catchAsync(async (req, res) => {
    const result = await service.deleteFolder(req.params.id, req.user.id);
    apiResponse(res, 200, result, 'Folder deleted.');
});

const getWatchlist = catchAsync(async (req, res) => {
    const items = await service.getWatchlist(req.user.id, req.query.folder);
    apiResponse(res, 200, items, 'Watchlist retrieved.');
});

const addToWatchlist = catchAsync(async (req, res) => {
    const item = await service.addToWatchlist(req.user.id, req.body);
    apiResponse(res, 201, item, 'Added to watchlist.');
});

const removeFromWatchlist = catchAsync(async (req, res) => {
    const result = await service.removeFromWatchlist(req.user.id, req.params.gemId);
    apiResponse(res, 200, result, 'Removed from watchlist.');
});

const removeOlderThan = catchAsync(async (req, res) => {
    const result = await service.removeOlderThan(req.user.id, req.body.days);
    apiResponse(res, 200, result, 'Old watchlist items removed.');
});

const moveToFolder = catchAsync(async (req, res) => {
    const item = await service.moveToFolder(req.user.id, req.params.id, req.body.folder_id);
    apiResponse(res, 200, item, 'Moved to folder.');
});

const checkWatchlist = catchAsync(async (req, res) => {
    const result = await service.checkWatchlist(req.user.id, req.params.gemId);
    apiResponse(res, 200, result, 'Watchlist check complete.');
});

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
