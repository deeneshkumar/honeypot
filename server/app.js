const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Handle JSON Parse Errors (e.g. invalid JSON from Tester)
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad JSON:', err.message);
        return res.status(400).json({ error: 'Invalid JSON request body' });
    }
    next();
});

// Load routes
const sessionRoutes = require('./routes/session');
const ingestRoutes = require('./routes/ingest');
const analyzeRoutes = require('./routes/analyze');

app.use('/', sessionRoutes);
app.use('/', ingestRoutes);
app.use('/', analyzeRoutes);

// Test Endpoint (Secured)
const testRoutes = require('./routes/test_endpoint');
app.use('/', testRoutes);

// Simple health check
app.get('/', (req, res) => {
    res.send('Autonomous Honeypot Server Running');
});

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Only start server if not running as a module (i.e. local dev)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
