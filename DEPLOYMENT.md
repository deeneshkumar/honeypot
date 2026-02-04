# 🚀 Deployment Guide (Render)

This guide walks you through deploying the **Autonomous Agentic Honeypot** to Render.com so it can be accessed by the Endpoint Tester.

## Prerequisites
- [x] Code pushed to GitHub (Repo: `deeneshkumar/honeypot`).
- [x] Application has a `start` script (We just added this).
- [x] Application listens on `process.env.PORT`.

##  Step-by-Step Deployment

1.  **Log in to Render**
    -   Go to [https://render.com](https://render.com).
    -   Sign in with your **GitHub** account.

2.  **Create New Web Service**
    -   Click the **"New +"** button.
    -   Select **"Web Service"**.

3.  **Connect Repository**
    -   Find `deeneshkumar/honeypot` in the list.
    -   Click **"Connect"**.

4.  **Configure Settings**
    -   **Name**: `honeypot-agent` (or similar).
    -   **Region**: Any (e.g., Singapore, Frankfurt).
    -   **Branch**: `main`.
    -   **Runtime**: `Node`.
    -   **Build Command**: `npm install` (Default is correct).
    -   **Start Command**: `node server/app.js` (OR `npm start`).

5.  **Environment Variables (Crucial!)**
    Scroll down to "Environment Variables" and click **"Add Environment Variable"**.
    
    | Key | Value |
    | :--- | :--- |
    | `PORT` | `3000` |
    | `HONEYPOT_API_KEY` | `HONEYPOT_SECRET_KEY_123` |

6.  **Deploy**
    -   Click **"Create Web Service"**.
    -   Wait 2-3 minutes for the build to finish.
    -   When you see "Your service is live", copy the URL (e.g., `https://honeypot-agent.onrender.com`).
##  Validating the Deployment

Once deployed, use the **Endpoint Tester** tool:

-   **Endpoint URL**: `https://<YOUR-APP-NAME>.onrender.com/api/honeypot/test`
-   **Method**: `POST`
-   **Headers**: `x-api-key: HONEYPOT_SECRET_KEY_123`
-   **Body**: `{ "message": "Verify deployment" }`

If you get a valid JSON response, you have **PASSED**! 
