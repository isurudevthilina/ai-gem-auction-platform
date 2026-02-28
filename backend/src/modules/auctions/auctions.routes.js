const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ success: true, message: 'Auctions Module working' });
});

router.post('/', (req, res) => {
    res.json({ success: true, message: 'Create auction' });
});

router.get('/:id', (req, res) => {
    res.json({ success: true, message: `Get auction ${req.params.id}` });
});

router.patch('/:id', (req, res) => {
    res.json({ success: true, message: `Patch auction ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
    res.json({ success: true, message: `Delete auction ${req.params.id}` });
});

module.exports = router;
