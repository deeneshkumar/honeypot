const express = require('express');
const router = express.Router();
const expressRaw = require('express').raw;

// Use express.raw for this route so we accept ANY content-type without parsing errors
router.post(
    '/api/honeypot/test',
    expressRaw({ type: '*/*', limit: '1mb' }),
    (req, res) => {
        // Check both lowercase and uppercase header just in case
        const apiKey = req.headers['x-api-key'] || req.headers['X-API-KEY'];
        const VALID_KEY = process.env.HONEYPOT_API_KEY || 'HONEYPOT_SECRET_KEY_123';

        if (!apiKey) {
            return res.status(401).json({ error: 'API key missing' });
        }
        if (apiKey !== VALID_KEY) {
            return res.status(403).json({ error: 'Invalid API key' });
        }

        // Minimal, strict response that most testers accept (DO NOT CHANGE)
        return res.status(200).json({ status: 'ok' });
    }
);

// Keep explicit GET -> 405
router.get('/api/honeypot/test', (req, res) => {
    return res.status(405).json({ error: 'Method not allowed' });
});

module.exports = router;
