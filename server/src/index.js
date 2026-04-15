const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const incidentRoutes = require('./routes/incidents');
const congestionRoutes = require('./routes/congestion');
const routeRoutes = require('./routes/routes');

// Import WebSocket handler
const { setupWebSocket } = require('./websocket/handler');

// Initialize Express
const app = express();
const server = http.createServer(app);

// ✅ FIXED CORS (IMPORTANT FOR DEPLOYMENT)
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    },
});

app.set('io', io);

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ✅ FIXED CORS HERE ALSO
app.use(cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ============================================
// ROUTES
// ============================================
app.use('/api', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/congestion', congestionRoutes);
app.use('/api/routes', routeRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'operational',
        service: 'ResQTrack API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// WebSocket
setupWebSocket(io);

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };