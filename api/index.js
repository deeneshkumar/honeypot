const app = require('../server/app');

// Vercel expects a function export
module.exports = (req, res) => {
    app(req, res);
};
