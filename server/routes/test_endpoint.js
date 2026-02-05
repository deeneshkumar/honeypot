const express = require('express');
const router = express.Router();
const expressRaw = require('express').raw;
const axios = require('axios');
const { extractEntities } = require('../../agent/extractor');

// In-memory session store (Critical for multi-turn tracking)
// Key: sessionId, Value: session state object
const sessions = {};

const SCAM_KEYWORDS = ["blocked", "verify", "urgent", "account", "upi", "bank", "suspend", "kyc", "pan", "aadhar"];

/**
 * Helper to merge new intelligence into session storage
 */
function updateIntelligence(session, newEntities, text) {
    if (newEntities.upi_ids) session.intelligence.upiIds.push(...newEntities.upi_ids);
    if (newEntities.bank_accounts) session.intelligence.bankAccounts.push(...newEntities.bank_accounts);
    if (newEntities.phone_numbers) session.intelligence.phoneNumbers.push(...newEntities.phone_numbers);
    if (newEntities.phishing_links) session.intelligence.phishingLinks.push(...newEntities.phishing_links);

    // De-duplicate
    session.intelligence.upiIds = [...new Set(session.intelligence.upiIds)];
    session.intelligence.bankAccounts = [...new Set(session.intelligence.bankAccounts)];
    session.intelligence.phoneNumbers = [...new Set(session.intelligence.phoneNumbers)];
    session.intelligence.phishingLinks = [...new Set(session.intelligence.phishingLinks)];

    // Check strict keywords
    const lowerText = text.toLowerCase();
    SCAM_KEYWORDS.forEach(kw => {
        if (lowerText.includes(kw) && !session.intelligence.suspiciousKeywords.includes(kw)) {
            session.intelligence.suspiciousKeywords.push(kw);
            session.scamDetected = true;
        }
    });
}

/**
 * Helper to send the mandatory callback to GUVI
 */
async function sendGuviCallback(session) {
    if (session.callbackSent) return; // Prevent double sending

    const payload = {
        sessionId: session.id,
        scamDetected: session.scamDetected,
        totalMessagesExchanged: session.turnCount,
        extractedIntelligence: session.intelligence,
        agentNotes: "Scammer used urgency tactics and requested financial details."
    };

    console.log(`[CALLBACK] Sending result for session ${session.id}...`, JSON.stringify(payload, null, 2));

    try {
        await axios.post('https://hackathon.guvi.in/api/updateHoneyPotFinalResult', payload, {
            timeout: 5000
        });
        console.log(`[CALLBACK] Success for session ${session.id}`);
        session.callbackSent = true;
    } catch (error) {
        console.error(`[CALLBACK] Failed for session ${session.id}:`, error.message);
        // We do not retry here to keep it simple, but in prod we might.
    }
}

router.post(
    '/api/honeypot/test',
    expressRaw({ type: '*/*', limit: '1mb' }),
    async (req, res) => {
        const apiKey = req.headers['x-api-key'];
        const VALID_KEY = process.env.HONEYPOT_API_KEY || 'HONEYPOT_SECRET_KEY_123';

        // 1. Auth Check
        if (!apiKey) return res.status(401).json({ error: 'API key missing' });
        if (apiKey !== VALID_KEY) return res.status(403).json({ error: 'Invalid API key' });

        // 2. Parse Body safely
        let payload = {};
        try {
            payload = JSON.parse(req.body.toString());
        } catch (e) {
            return res.status(400).json({ error: 'Invalid JSON' });
        }

        const sessionId = payload.sessionId || `unknown_${Date.now()}`;
        const incomingMessage = payload.message || {};
        const text = incomingMessage.text || "";

        // 3. Initialize or Retrieve Session
        if (!sessions[sessionId]) {
            console.log(`[New Session] ${sessionId}`);
            sessions[sessionId] = {
                id: sessionId,
                turnCount: 0,
                scamDetected: false,
                callbackSent: false,
                intelligence: {
                    bankAccounts: [],
                    upiIds: [],
                    phishingLinks: [],
                    phoneNumbers: [],
                    suspiciousKeywords: []
                }
            };
        }
        const session = sessions[sessionId];
        session.turnCount++;

        // 4. Intelligence Extraction & Scam Detection
        const extracted = extractEntities(text);
        updateIntelligence(session, extracted, text);

        // Log for debugging
        console.log(`[Session ${sessionId}] Turn: ${session.turnCount}, ScamDetected: ${session.scamDetected}`);

        // 5. Generate Agent Reply (Persona Logic with Rotation)
        const replyOptions = {
            initial: [
                "Why is my account being suspended? I did not receive any prior notice.",
                "I don't understand. Is this a mistake? My account should be fine.",
                "Who is this? I haven't requested any changes to my account."
            ],
            follow_up: [
                "I am worried. Can you explain exactly what verification is needed?",
                "This sounds serious. What documents do I need to provide?",
                "Is there a way to do this at my local branch? I prefer going in person."
            ],
            evasive: [
                "This seems very unusual. Is there an official reference number for this case?",
                "I'm trying to open the link but it says page not found. Can you check it?",
                "My nephew works in IT, I really should ask him first before doing this."
            ]
        };

        let reply = "";

        if (session.turnCount === 1) {
            const responses = replyOptions.initial;
            reply = responses[Math.floor(Math.random() * responses.length)];
        } else if (session.turnCount === 2) {
            const responses = replyOptions.follow_up;
            reply = responses[Math.floor(Math.random() * responses.length)];
        } else {
            const responses = replyOptions.evasive;
            reply = responses[Math.floor(Math.random() * responses.length)];
        }

        // 6. Check Trigger for Callback
        // Trigger if scam detected AND (reached turn 3 OR we have gathered critical info like UPI/Bank)
        const criticalInfoFound = session.intelligence.upiIds.length > 0 || session.intelligence.bankAccounts.length > 0;

        if (session.scamDetected && (session.turnCount >= 3 || criticalInfoFound)) {
            // Fire and forget (don't block response)
            sendGuviCallback(session).catch(e => console.error("Async callback error", e.message));
        }

        // 7. Return Response (Strict Schema)
        return res.status(200).json({
            status: "success",
            reply: reply
        });
    }
);

module.exports = router;
