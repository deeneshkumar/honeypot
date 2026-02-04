const express = require('express');
const router = express.Router();

router.post('/api/honeypot/test', (req, res) => {
    const apiKey = req.headers['x-api-key'];
    const VALID_KEY = process.env.HONEYPOT_API_KEY || 'HONEYPOT_SECRET_KEY_123';

    // Auth checks
    if (!apiKey) {
        return res.status(401).json({ error: 'API key missing' });
    }

    if (apiKey !== VALID_KEY) {
        return res.status(403).json({ error: 'Invalid API key' });
    }

    // 🔥 STRICT TESTER RESPONSE — DO NOT ADD ANYTHING
    return res.status(200).json({ status: "ok" });
});

// Explicitly reject GET
router.get('/api/honeypot/test', (req, res) => {
    return res.status(405).json({ error: "Method not allowed" });
});

module.exports = router;
