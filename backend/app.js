require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const analyzeRoutes = require("./src/routes/analyzeRoutes");
const draftRoutes = require("./src/routes/draftRoutes");
const schemeRoutes = require("./src/routes/schemeRoutes");

const app = express();

// Security headers
app.use(helmet());

// Configure CORS: allow wide-open in development, restrict in production
if (process.env.NODE_ENV === 'production') {
    const allowed = process.env.FRONTEND_URL || '';
    app.use(
        cors({
            origin: function (origin, callback) {
                if (!origin || origin === allowed) return callback(null, true);
                return callback(new Error('Not allowed by CORS'));
            },
        }),
    );
} else {
    app.use(cors());
}

// Limit request body size to prevent accidental large payloads
app.use(express.json({ limit: '100kb' }));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "CivicAI backend is running"
    });
});

app.use("/api/analyze", analyzeRoutes);
app.use("/api/draft", draftRoutes);
app.use("/api/schemes", schemeRoutes);

module.exports = app;

// Generic error handler — do not expose stack traces in production
// (Placed after module.exports so it is executed when app is used)
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
        // In dev print the error to console for debugging
        // Keep logs concise; do not print request bodies containing user content
        // eslint-disable-next-line no-console
        console.error(err && err.stack ? err.stack : err);
    }

    // If headers already sent, delegate
    if (res.headersSent) return next(err);

    res.status(500).json({ success: false, message: 'Internal server error.' });
});