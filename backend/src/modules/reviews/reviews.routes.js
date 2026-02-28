const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ success: true, message: 'Reviews Module working' });
});

router.post('/', (req, res) => {
    res.json({ success: true, message: 'Create review' });
});

router.get('/:id', (req, res) => {
    res.json({ success: true, message: `Get review ${req.params.id}` });
});

router.patch('/:id', (req, res) => {
    res.json({ success: true, message: `Patch review ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
    res.json({ success: true, message: `Delete review ${req.params.id}` });
});

module.exports = router;
