const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
