const express = require('express');
const router = express.Router();
const { calculateScamScore } = require('../../agent/extractor');
const { callLLM } = require('../../agent/agent_controller');

router.post('/ingest-message', async (req, res) => {
    const { session_id, sender, message, timestamp } = req.body;

    if (!global.sessions[session_id]) {
        return res.status(404).json({ error: 'Session not found' });
    }

    const session = global.sessions[session_id];

    // 1. Log Incoming Message
    session.conversation_log.push({
        sender: sender || 'scammer',
        text: message,
        timestamp: timestamp || new Date().toISOString()
    });

    // 2. Detect & Score
    const score = calculateScamScore(message);

    // Update session metadata if score helps us decide it's a scam
    if (score > 0.6) {
        session.metadata.is_scam = true;
        session.metadata.explanation = `High likelihood of scam detected. Score: ${score.toFixed(2)}`;
        session.metadata.action_recommendation = "Engage and extract details.";
        session.metadata.confidence = Math.max(session.metadata.confidence, score);
    }

    // 3. Decide to Engage (Always engage in this honeypot prototype)
    // In real life, might only engage if score > threshold.

    // 4. Call Agent
    const agentResponse = await callLLM(session.conversation_log, message);

    // 5. Update Session with Agent's Intel
    // Merge extracted data
    const newExtraction = agentResponse.extraction.entity_details;
    if (newExtraction) {
        if (newExtraction.upi_ids) session.extracted_data.upi_ids.push(...newExtraction.upi_ids);
        if (newExtraction.bank_accounts) session.extracted_data.bank_accounts.push(...newExtraction.bank_accounts);
        if (newExtraction.phone_numbers) session.extracted_data.phone_numbers.push(...newExtraction.phone_numbers);
        if (newExtraction.phishing_links) session.extracted_data.phishing_links.push(...newExtraction.phishing_links);

        // Deduplicate
        session.extracted_data.upi_ids = [...new Set(session.extracted_data.upi_ids)];
        session.extracted_data.bank_accounts = [...new Set(session.extracted_data.bank_accounts)];
        session.extracted_data.phone_numbers = [...new Set(session.extracted_data.phone_numbers)];
        session.extracted_data.phishing_links = [...new Set(session.extracted_data.phishing_links)];
    }

    // 6. Log Agent Reply
    session.conversation_log.push({
        sender: 'agent',
        text: agentResponse.reply_text,
        timestamp: new Date().toISOString()
    });

    res.json({
        reply: agentResponse.reply_text,
        metadata: {
            intent: "engage",
            confidence: agentResponse.extraction.confidence
        }
    });
});

// Internal endpoint if needed
router.post('/agent/respond', async (req, res) => {
    // This could just reuse logic or call a function. 
    // Implementing purely for API contract compliance if external caller needs it.
    const { session_id, latest_message, conversation_history } = req.body;
    const agentResponse = await callLLM(conversation_history, latest_message);
    res.json({
        reply: agentResponse.reply_text,
        metadata: {
            intent: "engage",
            confidence: agentResponse.extraction.confidence
        }
    });
});

module.exports = router;
