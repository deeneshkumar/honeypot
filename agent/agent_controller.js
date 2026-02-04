const { SYSTEM_PROMPT } = require('./llm_prompts');
const { extractEntities, calculateScamScore } = require('./extractor');

// MOCK LLM IMPLEMENTATION (For demo robustness)
// In a real scenario, this would call OpenAI/Anthropic APIs.
async function callLLM(conversationHistory, latestMessage) {
    // 1. Simulate finding entities via Regex (Hybrid approach)
    const entities = extractEntities(latestMessage);
    const hasEntities = Object.values(entities).some(arr => arr && arr.length > 0);

    // 2. Simple Rule-Based Response Logic (Mocking the "Intellect")
    let replyText = "";
    let confidence = 0.5;

    if (hasEntities) {
        // If scammer provided data, ask for confirmation
        const found = [];
        if (entities.upi_ids.length) found.push(`UPI (${entities.upi_ids[0]})`);
        if (entities.bank_accounts.length) found.push(`Account (${entities.bank_accounts[0]})`);
        if (entities.phishing_links.length) found.push(`Link`);

        replyText = `Okay, got it. Just to be safe, can you confirm the ${found.join(' and ')} again? My manager is asking.`;
        confidence = 0.9;
    } else if (latestMessage.toLowerCase().includes('hi') || latestMessage.toLowerCase().includes('hello')) {
        replyText = "Hello? Who is this?";
    } else {
        // Generic stall/engage
        replyText = "I'm not sure I understand. Which bank is this regarding? I need to know before I can proceed.";
        confidence = 0.7;
    }

    // 3. Construct the "LLM" response object
    return {
        reply_text: replyText,
        extraction: {
            detected_entities: [
                ...entities.upi_ids,
                ...entities.bank_accounts,
                ...entities.phone_numbers,
                ...entities.phishing_links
            ],
            // Simplified for prototype
            entity_details: entities,
            extraction_method: "regex+mock_llm",
            confidence: confidence
        }
    };
}

module.exports = { callLLM };
