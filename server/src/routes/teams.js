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
                team_name,
                latitude,
                longitude,
                status
            FROM teams
        `);

        // Add `lat` and `lng` aliases exactly as expected by your frontend map
        const mappedTeams = result.rows.map(team => ({
            ...team,
            lat: team.latitude,
            lng: team.longitude
        }));
        
        res.json(mappedTeams);
    } catch (err) {
        console.error("🔥 DB ERROR:", err);
        res.status(500).json({
            error: "Failed to retrieve teams",
            details: err.message
        });
    }
});

module.exports = router;