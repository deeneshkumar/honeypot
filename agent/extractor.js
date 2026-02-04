const REGEX_PATTERNS = {
    upi: /\b[\w\.\-]{2,256}@[a-zA-Z]{3,20}\b/g,
    phone: /\b[6-9]\d{9}\b/g,
    bank_account: /\b\d{9,18}\b/g,
    ifsc: /\b[A-Za-z]{4}0[A-Z0-9]{6}\b/g,
    url: /https?:\/\/[^\s]+/g,
    keywords: /(upi|paytm|bank|account|transfer|loan|KYC|verify|OTP|click|login|secure|update|blocked)/i
};

function extractEntities(text) {
    const extracted = {
        upi_ids: text.match(REGEX_PATTERNS.upi) || [],
        phone_numbers: text.match(REGEX_PATTERNS.phone) || [],
        bank_accounts: text.match(REGEX_PATTERNS.bank_account) || [],
        phishing_links: text.match(REGEX_PATTERNS.url) || []
    };
    return extracted;
}

function calculateScamScore(text) {
    let score = 0;
    if (REGEX_PATTERNS.keywords.test(text)) score += 0.4;
    if (REGEX_PATTERNS.url.test(text)) score += 0.3;
    if (REGEX_PATTERNS.phone.test(text)) score += 0.2;
    if (REGEX_PATTERNS.upi.test(text)) score += 0.3;
    if (REGEX_PATTERNS.bank_account.test(text)) score += 0.3;

    // Cap at 0.95 purely on rules (LLM can boost to 1.0)
    return Math.min(score, 0.95);
}

module.exports = { extractEntities, calculateScamScore };
