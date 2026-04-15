const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET all teams (NO USERS TABLE)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                vehicle_id,
                name,
                lat,
                lng,
                status
            FROM teams
        `);

        res.json(result.rows);
    } catch (err) {
        console.error("🔥 DB ERROR:", err);
        res.status(500).json({
            error: "Failed to retrieve teams",
            details: err.message
        });
    }
});

module.exports = router;