const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5001;

app.use(express.json());

// Load scenarios
const scenarios = {};
const scenariosDir = path.join(__dirname, 'scenarios');
fs.readdirSync(scenariosDir).forEach(file => {
    if (file.endsWith('.json')) {
        const name = file.replace('scenario_', '').replace('.json', '');
        scenarios[name] = JSON.parse(fs.readFileSync(path.join(scenariosDir, file), 'utf8'));
    }
});

// Endpoint to start driving a scenario for a session
app.post('/mock/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    // Default to upi_payment_request if not specified or unknown
    let scenarioName = 'upi_payment_request';

    // Check if the session was created with a specific scenario (you might pass this in)
    // For now we just pick upi_payment_request or random

    const scenario = scenarios[scenarioName];
    if (!scenario) {
        return res.status(404).json({ error: 'Scenario not found' });
    }

    console.log(`Starting mock scenario ${scenarioName} for session ${sessionId}`);

    // Fire and forget the conversation loop (simulation)
    simulateConversation(sessionId, scenario);

    res.json({ message: 'Simulation started', scenario: scenarioName });
});

async function simulateConversation(sessionId, scenario) {
    const targetUrl = 'http://127.0.0.1:3000/ingest-message';

    for (const turn of scenario.turns) {
        // Wait simulated delay
        await new Promise(r => setTimeout(r, turn.delay_ms || 1000));

        const payload = {
            session_id: sessionId,
            sender: 'scammer',
            message: turn.message,
            timestamp: new Date().toISOString()
        };

        console.log(`[Mock] Sending to ${sessionId}: ${turn.message}`);

        try {
            const response = await axios.post(targetUrl, payload);
            console.log(`[Mock] Agent replied: ${response.data.reply}`);
        } catch (error) {
            console.error(`[Mock] Error sending message: ${error.message}`);
        }
    }
}

app.listen(PORT, () => {
    console.log(`Mock Scammer running on http://localhost:${PORT}`);
    console.log(`Loaded scenarios: ${Object.keys(scenarios).join(', ')}`);
});
