const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ success: true, message: 'Certificates Module working' });
});

router.post('/', (req, res) => {
    res.json({ success: true, message: 'Create certificate' });
});

router.get('/:id', (req, res) => {
    res.json({ success: true, message: `Get certificate ${req.params.id}` });
});

router.patch('/:id', (req, res) => {
    res.json({ success: true, message: `Patch certificate ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
    res.json({ success: true, message: `Delete certificate ${req.params.id}` });
});

module.exports = router;
