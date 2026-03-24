const express = require('express');
const { pool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/incidents
 * List all incidents with optional filters
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { status, severity } = req.query;
        let query = `
      SELECT i.*, t.team_name as assigned_team_name, u.full_name as reporter_name
      FROM incidents i
      LEFT JOIN teams t ON i.assigned_team_id = t.id
      LEFT JOIN users u ON i.reported_by = u.id
    `;
        const conditions = [];
        const params = [];

        if (status) {
            params.push(status);
            conditions.push(`i.status = $${params.length}`);
        }
        if (severity) {
            params.push(severity);
            conditions.push(`i.severity = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY i.created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Get incidents error:', err);
        res.status(500).json({ error: 'Failed to retrieve incidents' });
    }
});

/**
 * GET /api/incidents/:id
 * Get a single incident
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT i.*, t.team_name as assigned_team_name
       FROM incidents i LEFT JOIN teams t ON i.assigned_team_id = t.id
       WHERE i.id = $1`,
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Incident not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get incident error:', err);
        res.status(500).json({ error: 'Failed to retrieve incident' });
    }
});

/**
 * POST /api/incidents
 * Create a new incident
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, latitude, longitude, severity, description, incident_type } = req.body;

        if (!title || !latitude || !longitude || !severity) {
            return res.status(400).json({ error: 'title, latitude, longitude, and severity are required' });
        }

        const result = await pool.query(
            `INSERT INTO incidents (title, latitude, longitude, severity, description, incident_type, reported_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [title, latitude, longitude, severity, description || '', incident_type || 'general', req.user.id]
        );

        const incident = result.rows[0];

        // Broadcast new incident
        const io = req.app.get('io');
        if (io) {
            io.emit('incident:new', incident);
        }

        res.status(201).json(incident);
    } catch (err) {
        console.error('Create incident error:', err);
        res.status(500).json({ error: 'Failed to create incident' });
    }
});

/**
 * PUT /api/incidents/assign
 * Assign a team to an incident
 */
router.put('/assign', authenticateToken, async (req, res) => {
    try {
        const { incident_id, team_id } = req.body;

        if (!incident_id || !team_id) {
            return res.status(400).json({ error: 'incident_id and team_id are required' });
        }

        // Update incident
        const incidentResult = await pool.query(
            `UPDATE incidents SET assigned_team_id = $2, status = 'in_progress', updated_at = NOW()
       WHERE id = $1 RETURNING *`,
            [incident_id, team_id]
        );

        if (incidentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Incident not found' });
        }

        // Update team
        await pool.query(
            `UPDATE teams SET assigned_incident_id = $2, status = 'responding', last_update = NOW()
       WHERE id = $1`,
            [team_id, incident_id]
        );

        // Create mission
        await pool.query(
            `INSERT INTO missions (team_id, incident_id, status) VALUES ($1, $2, 'assigned')`,
            [team_id, incident_id]
        );

        const io = req.app.get('io');
        if (io) {
            io.emit('incident:assigned', incidentResult.rows[0]);
            io.to(`team_${team_id}`).emit('mission:new', incidentResult.rows[0]);
        }

        res.json(incidentResult.rows[0]);
    } catch (err) {
        console.error('Assign incident error:', err);
        res.status(500).json({ error: 'Failed to assign incident' });
    }
});

/**
 * PUT /api/incidents/:id/status
 * Update incident status
 */
router.put('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['reported', 'in_progress', 'resolved', 'closed'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await pool.query(
            `UPDATE incidents SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
            [req.params.id, status]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Incident not found' });
        }

        const io = req.app.get('io');
        if (io) {
            io.emit('incident:updated', result.rows[0]);
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update incident status error:', err);
        res.status(500).json({ error: 'Failed to update incident status' });
    }
});

module.exports = router;
