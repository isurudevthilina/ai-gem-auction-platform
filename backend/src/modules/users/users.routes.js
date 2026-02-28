const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ success: true, message: 'Users Module working' });
});

router.get('/:id', (req, res) => {
    res.json({ success: true, message: `Get user ${req.params.id}` });
});

router.patch('/:id', (req, res) => {
    res.json({ success: true, message: `Patch user ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
    res.json({ success: true, message: `Delete user ${req.params.id}` });
});

module.exports = router;
