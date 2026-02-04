const express = require('express');
const router = express.Router();

router.get('/analyze', (req, res) => {
    const { session_id } = req.query;

    if (!session_id || !global.sessions[session_id]) {
        return res.status(404).json({ error: 'Session not found' });
    }

    const session = global.sessions[session_id];

    // Construct the final response structure
    const response = {
        session_id: session.session_id,
        is_scam: session.metadata.is_scam,
        confidence: session.metadata.confidence,
        extracted_data: session.extracted_data,
        conversation_log: session.conversation_log,
        explanation: session.metadata.explanation,
        action_recommendation: session.metadata.action_recommendation
    };

    res.json(response);
});

module.exports = router;
