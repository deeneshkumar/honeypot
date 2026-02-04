const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// In-memory session store (global for now, for prototype)
// In a real app, use a DB or Redis.
global.sessions = {};

router.post('/start-session', (req, res) => {
    const { scenario } = req.body;
    const sessionId = `sess_${Date.now()}`;

    // Initialize session structure
    global.sessions[sessionId] = {
        session_id: sessionId,
        scenario: scenario || 'unknown',
        start_time: new Date().toISOString(),
        conversation_log: [],
        extracted_data: {
            upi_ids: [],
            bank_accounts: [],
            phone_numbers: [],
            phishing_links: []
        },
        metadata: {
            is_scam: false,
            confidence: 0,
            explanation: '',
            action_recommendation: ''
        }
    };

    res.json({
        session_id: sessionId,
        mock_scammer_endpoint: `http://127.0.0.1:5001/mock/${sessionId}`
    });
});

module.exports = router;
