const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ success: true, message: 'Watchlist Module working' });
});

router.post('/', (req, res) => {
    res.json({ success: true, message: 'Add to watchlist' });
});

router.delete('/:id', (req, res) => {
    res.json({ success: true, message: `Remove from watchlist ${req.params.id}` });
});

module.exports = router;
