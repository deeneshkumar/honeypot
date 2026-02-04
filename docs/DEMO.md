# System Demonstration Procedure

## Prerequisites
-   Node.js runtime environment installed.
-   Network ports 3000 (Server) and 5001 (Simulation) must be available.

## Initialization
1.  Navigate to the project root directory.
2.  Install dependencies:
    ```bash
    npm install
    ```

## Automated Execution (Recommended)
The system employs a unified runner script to orchestrate the server, simulation, and analysis phases.

**Command:**
```bash
node demo_runner.js
```

**Process Flow:**
1.  **Session Initialization**: The runner establishes a new session on the primary server.
2.  **Simulation Trigger**: The runner activates the Mock Scammer triggers a predefined attack scenario.
3.  **Engagement**: The system autonomously interacts with the simulated actor for a fixed duration.
4.  **Analysis**: The runner queries the analysis endpoint and outputs the structured intelligence report to the console and `data/` directory.

## Manual Execution
For granular control or debugging, components may be executed independently.

1.  **Start Primary Server**:
    ```bash
    node server/app.js
    ```

2.  **Start Mock Simulation**:
    ```bash
    node mock_scammer/mock_server.js
    ```

3.  **Trigger Scenario**:
    Issue a POST request to the start-session endpoint, followed by a trigger request to the mock scammer endpoint returned in the response.
