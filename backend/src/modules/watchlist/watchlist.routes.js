const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const controller = require('./watchlist.controller');
const {
    createFolderSchema,
    renameFolderSchema,
    addToWatchlistSchema,
    moveToFolderSchema,
} = require('./watchlist.validation');

router.use(authenticate);

// ── Folder routes (before parameterised routes) ──
router.get('/folders', controller.getFolders);
router.post('/folders', validate(createFolderSchema), controller.createFolder);
router.patch('/folders/:id', validate(renameFolderSchema), controller.renameFolder);
router.delete('/folders/:id', controller.deleteFolder);

// ── Watchlist check (before :gemId param) ──
router.get('/check/:gemId', controller.checkWatchlist);

// ── Watchlist CRUD ──
router.get('/', controller.getWatchlist);
router.post('/', validate(addToWatchlistSchema), controller.addToWatchlist);
router.delete('/:gemId', controller.removeFromWatchlist);
router.patch('/:id/move', validate(moveToFolderSchema), controller.moveToFolder);

module.exports = router;
