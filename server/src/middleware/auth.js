require('dotenv').config();

/**
 * TEMP: Authentication Disabled for Development
 * Allows all requests without token
 */
function authenticateToken(req, res, next) {
    // Skip token verification
    next();
}

/**
 * TEMP: Role check disabled
 */
function requireRole(...roles) {
    return (req, res, next) => {
        // Skip role validation
        next();
    };
}

const JWT_SECRET = process.env.JWT_SECRET || 'resqtrack-fallback-secret';

module.exports = { authenticateToken, requireRole, JWT_SECRET };