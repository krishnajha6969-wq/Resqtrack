const express = require('express');
const { pool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/teams
 * Get all rescue teams with their current locations
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT t.*, u.full_name as operator_name, i.title as incident_title
      FROM teams t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN incidents i ON t.assigned_incident_id = i.id
      ORDER BY t.team_name
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Get teams error:', err);
        res.status(500).json({ error: 'Failed to retrieve teams' });
    }
});

/**
 * GET /api/teams/:id
 * Get a single team by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.*, u.full_name as operator_name
       FROM teams t LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get team error:', err);
        res.status(500).json({ error: 'Failed to retrieve team' });
    }
});

/**
 * POST /api/team/location
 * Update team GPS location — broadcasts via WebSocket
 */
router.post('/location', authenticateToken, async (req, res) => {
    try {
        const { team_id, latitude, longitude, status } = req.body;

        if (!team_id || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: 'team_id, latitude, and longitude are required' });
        }

        const updateFields = ['latitude = $2', 'longitude = $3', 'last_update = NOW()'];
        const params = [team_id, latitude, longitude];

        if (status) {
            updateFields.push(`status = $${params.length + 1}`);
            params.push(status);
        }

        const result = await pool.query(
            `UPDATE teams SET ${updateFields.join(', ')} WHERE id = $1
       RETURNING *`,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const team = result.rows[0];

        // Broadcast location update via WebSocket
        const io = req.app.get('io');
        if (io) {
            io.to('command_center').emit('team:location', team);
        }

        res.json(team);
    } catch (err) {
        console.error('Location update error:', err);
        res.status(500).json({ error: 'Failed to update location' });
    }
});

/**
 * PUT /api/teams/:id/status
 * Update team status
 */
router.put('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['available', 'busy', 'responding', 'offline'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await pool.query(
            `UPDATE teams SET status = $2, last_update = NOW() WHERE id = $1 RETURNING *`,
            [req.params.id, status]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const io = req.app.get('io');
        if (io) {
            io.to('command_center').emit('team:status', result.rows[0]);
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Status update error:', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;
