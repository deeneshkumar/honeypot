const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// 🔹 Test endpoint FIRST (tester-safe)
const testRoutes = require('./routes/test_endpoint');
app.use('/', testRoutes);

// Vercel/Express Body Buffer Fix
// 1. If req.body is already parsed (by Vercel), allow it.
// 2. Otherwise use express.json()
app.use((req, res, next) => {
    if (req.body) return next();
    express.json()(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

// Load routes
const sessionRoutes = require('./routes/session');
const ingestRoutes = require('./routes/ingest');
const analyzeRoutes = require('./routes/analyze');

app.use('/', sessionRoutes);
app.use('/', ingestRoutes);
app.use('/', analyzeRoutes);

// Removed duplicate test route import from below

// Simple health check
app.get('/', (req, res) => {
    res.json({ status: "Autonomous Honeypot Server Running" });
});

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    try { fs.mkdirSync(dataDir); } catch (e) { }
}

// Global 404 Handler (Always return JSON)
app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
});

// Global Error Handler (Always return JSON)
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// Only start server if not running as a module (i.e. local dev)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}


module.exports = app;
