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

// POST — create a new team
router.post('/', async (req, res) => {
    try {
        const { team_name, vehicle_id, latitude, longitude } = req.body;
        if (!team_name || !vehicle_id) {
            return res.status(400).json({ error: 'team_name and vehicle_id are required' });
        }
        const result = await pool.query(
            `INSERT INTO teams (team_name, vehicle_id, latitude, longitude, status)
             VALUES ($1, $2, $3, $4, 'available')
             RETURNING *`,
            [team_name, vehicle_id, latitude || 19.2952, longitude || 72.8544]
        );
        const team = result.rows[0];

        // Broadcast to admin dashboard
        const io = req.app?.get?.('io');
        if (io) io.emit('team:new', team);

        res.status(201).json({ ...team, lat: team.latitude, lng: team.longitude });
    } catch (err) {
        console.error('Create team error:', err);
        res.status(500).json({ error: 'Failed to create team' });
    }
});

// PUT — update team status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const result = await pool.query(
            `UPDATE teams SET status = $2, last_update = NOW() WHERE id = $1 RETURNING *`,
            [req.params.id, status]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Team not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update team error:', err);
        res.status(500).json({ error: 'Failed to update team' });
    }
});

// DELETE — remove a team
router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM teams WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Team not found' });
        res.json({ success: true, deleted: result.rows[0] });
    } catch (err) {
        console.error('Delete team error:', err);
        res.status(500).json({ error: 'Failed to delete team' });
    }
});

module.exports = router;