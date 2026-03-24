const express = require('express');
const { pool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Congestion detection thresholds
const SPEED_THRESHOLD = 15; // km/h
const VEHICLE_COUNT_THRESHOLD = 3;

/**
 * GET /api/congestion
 * Get all congestion zones
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT c.*, u.full_name as reporter_name
      FROM congestion c
      LEFT JOIN users u ON c.reported_by = u.id
      ORDER BY c.created_at DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Get congestion error:', err);
        res.status(500).json({ error: 'Failed to retrieve congestion data' });
    }
});

/**
 * POST /api/congestion/report
 * Report congestion data with automatic detection
 */
router.post('/report', authenticateToken, async (req, res) => {
    try {
        const { road_segment, latitude, longitude, vehicle_density, average_speed } = req.body;

        if (!road_segment || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: 'road_segment, latitude, and longitude are required' });
        }

        const density = vehicle_density || 0;
        const speed = average_speed || 0;

        // Congestion detection logic
        let status = 'clear';
        if (speed < SPEED_THRESHOLD && density > VEHICLE_COUNT_THRESHOLD) {
            status = 'congested';
        } else if (speed < SPEED_THRESHOLD * 2 || density > VEHICLE_COUNT_THRESHOLD - 1) {
            status = 'moderate';
        }

        // Upsert congestion data
        const result = await pool.query(
            `INSERT INTO congestion (road_segment, latitude, longitude, vehicle_density, average_speed, status, reported_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         vehicle_density = $4, average_speed = $5, status = $6, updated_at = NOW()
       RETURNING *`,
            [road_segment, latitude, longitude, density, speed, status, req.user.id]
        );

        const congestion = result.rows[0];

        // Broadcast congestion update
        const io = req.app.get('io');
        if (io) {
            io.emit('congestion:update', congestion);
        }

        res.status(201).json(congestion);
    } catch (err) {
        console.error('Report congestion error:', err);
        res.status(500).json({ error: 'Failed to report congestion' });
    }
});

/**
 * GET /api/congestion/heatmap
 * Get congestion data formatted for heatmap visualization
 */
router.get('/heatmap', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT latitude, longitude, vehicle_density, average_speed, status
      FROM congestion
      WHERE status != 'clear'
      ORDER BY vehicle_density DESC
    `);

        const heatmapData = result.rows.map(row => ({
            lat: row.latitude,
            lng: row.longitude,
            intensity: row.status === 'congested' ? 1.0 : 0.5,
            density: row.vehicle_density,
            speed: row.average_speed,
        }));

        res.json(heatmapData);
    } catch (err) {
        console.error('Get heatmap error:', err);
        res.status(500).json({ error: 'Failed to retrieve heatmap data' });
    }
});

module.exports = router;
