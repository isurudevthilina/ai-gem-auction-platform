const express = require('express');
const router = express.Router();

// This is a placeholder route to test the connection
router.get('/test', (req, res) => {
    res.json({ message: "Auth route is working!" });
});

module.exports = router;