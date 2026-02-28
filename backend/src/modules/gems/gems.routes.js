const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ success: true, message: 'Gems Module working' });
});

router.post('/', (req, res) => {
    res.json({ success: true, message: 'Create gem' });
});

router.get('/:id', (req, res) => {
    res.json({ success: true, message: `Get gem ${req.params.id}` });
});

router.patch('/:id', (req, res) => {
    res.json({ success: true, message: `Patch gem ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
    res.json({ success: true, message: `Delete gem ${req.params.id}` });
});

module.exports = router;
