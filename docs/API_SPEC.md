# Autonomous Honeypot API Specification

## Overview
This document outlines the RESTful API endpoints for the Autonomous Honeypot system. The API facilitates session management, message ingestion, and intelligence analysis.

## Base Configuration
-   **Base URL**: `http://localhost:3000`
-   **Content-Type**: `application/json`

## Endpoints

### 1. Initialize Session
Creates a new honeypot session context. This endpoint initializes the state required for conversation tracking and data extraction.

-   **Endpoint**: `/start-session`
-   **Method**: `POST`

**Request Payload:**
```json
{
  "scenario": "upi_payment_request"
}
```

**Response Payload:**
```json
{
  "session_id": "sess_1738678000000",
  "mock_scammer_endpoint": "http://localhost:5001/mock/sess_1738678000000"
}
```

### 2. Message Ingestion
Accepts incoming messages from external sources (simulated or live). This endpoint is the entry point for the detection and engagement logic.

-   **Endpoint**: `/ingest-message`
-   **Method**: `POST`

**Request Payload:**
```json
{
  "session_id": "sess_1738678000000",
  "sender": "scammer",
  "message": "Immediate payment required.",
  "timestamp": "2026-02-04T10:00:00Z"
}
```

**Response Payload:**
```json
{
  "reply": "Could you provide the UPI ID for the transfer?",
  "metadata": {
      "intent": "engage",
      "confidence": 0.85
  }
}
```

### 3. Session Analysis
Retrieves the finalized intelligence report for a specific session. This output is structured for downstream processing by fraud analysis systems.

-   **Endpoint**: `/analyze`
-   **Method**: `GET`
-   **Query Parameter**: `session_id`

**Response Payload:**
```json
{
  "session_id": "sess_1738678000000",
  "is_scam": true,
  "confidence": 0.95,
  "extracted_data": {
    "upi_ids": ["target@upi"],
    "bank_accounts": [],
    "phone_numbers": [],
    "phishing_links": []
  },
  "explanation": "High confidence scam detection triggered by keyword density and extracted financial identifiers.",
  "action_recommendation": "Block sender and flag identifiers for monitoring."
}
```
