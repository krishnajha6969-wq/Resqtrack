const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET all teams
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM teams');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching teams:', err);
        res.status(500).json({ error: 'Failed to retrieve teams', details: err.message });
    }
});

module.exports = router;