const express = require('express');
const router = express.Router();
const expressRaw = require('express').raw;

router.post(
    '/api/honeypot/test',
    expressRaw({ type: '*/*', limit: '1mb' }),
    (req, res) => {
        const apiKey = req.headers['x-api-key'];
        const VALID_KEY = process.env.HONEYPOT_API_KEY || 'HONEYPOT_SECRET_KEY_123';

        if (!apiKey) {
            return res.status(401).json({ error: 'API key missing' });
        }
        if (apiKey !== VALID_KEY) {
            return res.status(403).json({ error: 'Invalid API key' });
        }

        let payload = {};
        try {
            payload = JSON.parse(req.body.toString());
        } catch (e) {
            payload = {};
        }

        const incomingText =
            payload?.message?.text ||
            "I received a message about my account.";

        // 🎭 Honeypot persona reply (believable victim)
        const reply =
            "Why is my account being suspended? I did not receive any prior notice.";

        return res.status(200).json({
            status: "success",
            reply: reply
        });
    }
);

module.exports = router;
