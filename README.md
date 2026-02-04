# Autonomous Agentic Honeypot: Defensive Scam Intelligence System

## Overview
The Autonomous Agentic Honeypot is a defensive artificial intelligence system designed to detect, engage, and extract intelligence from fraudulent actors. By simulating a vulnerable user persona, the system autonomously interacts with scammers to gather verifiable identification data, including Unified Payments Interface (UPI) identifiers, bank account details, and phishing URLs.

This system shifts the cybersecurity paradigm from passive blocking to active intelligence gathering, enabling fraud prevention teams to identify and neutralize scam infrastructure.

## Key Capabilities
- **Autonomous Engagement**: The system utilizes an agentic architecture to conduct natural conversations, maintaining scammer engagement without human intervention.
- **Intelligence Extraction**: The system autonomously parses conversation logs to identify and extract personally identifiable information (PII) and financial identifiers used by fraudulent actors.
- **Simulated Environment**: Includes a Mock Scammer API to facilitate safe testing and demonstration of defensive capabilities without requiring interaction with live threat actors.
- **Structured Reporting**: Produces standardized JSON intelligence reports containing confidence scores, extraction methods, and actionable recommendations.

## System Architecture
The system is composed of four primary modules:
1.  **Detection Module**: Analyzes incoming messages using heuristic algorithms and keyword density scoring to identify potential threats.
2.  **Agent Logic**: A persona-driven controller that manages conversation state and determines optimal engagement strategies to elicit information.
3.  **Extraction Engine**: A hybrid processing layer utilizing regular expressions and logic to identify financial and identity data within unstructured text.
4.  **Reporting Interface**: Aggregates session data into structured formats suitable for integration with fraud monitoring dashboards.

## Technology Stack
-   **Runtime**: Node.js (v14+)
-   **Server**: Express.js
-   **Communication**: REST API (Axios)
-   **Data Storage**: In-memory session management with JSON persistence

## Installation and Setup

### Prerequisites
-   Node.js (LTS Version)
-   Git

### Deployment Steps
1.  **Clone the Repository**
    ```bash
    git clone <repository_url>
    cd honeypot
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Execute Demonstration**
    The system includes an automated runner script that initializes the server, starts the mock scammer, and executes a predefined threat scenario.
    ```bash
    node demo_runner.js
    ```

4.  **Review Output**
    Upon completion, analysis logs are generated in the `data/` directory.

## Endpoint Tester Inspection
To validate system availability and compliance with testing standards, a dedicated verification endpoint is available.

-   **Endpoint**: `http://localhost:3000/api/honeypot/test`
-   **Method**: `POST`
-   **Authentication**: `x-api-key` header required.
-   **Default Key**: `HONEYPOT_SECRET_KEY_123` (Configurable via `HONEYPOT_API_KEY` environment variable)

## Usage Disclaimer
This tool is intended for research and defensive cybersecurity purposes only. Users are responsible for ensuring compliance with all applicable local, state, and federal laws regarding network interaction and data collection.
