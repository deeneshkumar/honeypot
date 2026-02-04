const express = require('express');
const router = express.Router();
const { calculateScamScore } = require('../../agent/extractor');

// Configuration
const REQUIRED_API_KEY = process.env.HONEYPOT_API_KEY || "HONEYPOT_SECRET_KEY_123";

// Middleware for API Key validation
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    // Strict compliance status codes and messages
    if (!apiKey) {
        return res.status(401).json({ error: "API key missing" });
    }

    if (apiKey !== REQUIRED_API_KEY) {
        return res.status(403).json({ error: "Invalid API key" });
    }

    next();
};

// The Test Endpoint
router.post('/api/honeypot/test', validateApiKey, (req, res) => {
    // Basic mock analysis based on input
    const incomingMessage = req.body.message || "No message provided";
    const score = calculateScamScore(incomingMessage);

    // Construct the required response structure for the tester
    const response = {
        "status": "active",
        "service": "agentic-honeypot",
        "honeypot": true,
        "session_id": `test-session-${Date.now()}`,
        "received_message": incomingMessage,
        "analysis": {
            "is_scam": score > 0.5,
            "confidence": parseFloat(score.toFixed(2))
        },
        "message": "Honeypot endpoint is active and responding correctly."
    };

    res.json(response);
});

module.exports = router;
