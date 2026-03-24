const express = require('express');
const { pool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/routes/optimize
 * Calculate optimized route avoiding congested areas and blockages
 */
router.get('/optimize', authenticateToken, async (req, res) => {
    try {
        const { start_lat, start_lng, end_lat, end_lng } = req.query;

        if (!start_lat || !start_lng || !end_lat || !end_lng) {
            return res.status(400).json({
                error: 'start_lat, start_lng, end_lat, and end_lng are required',
            });
        }

        // Get congested zones to avoid
        const congestionResult = await pool.query(`
      SELECT latitude, longitude, road_segment, status
      FROM congestion WHERE status = 'congested'
    `);

        // Get active road blockages
        const blockageResult = await pool.query(`
      SELECT latitude, longitude, description, severity
      FROM road_blockages WHERE is_active = TRUE
    `);

        // Build route optimization response
        // In production, this would integrate with OSRM or Mapbox Directions API
        const avoidZones = [
            ...congestionResult.rows.map(c => ({
                type: 'congestion',
                lat: c.latitude,
                lng: c.longitude,
                label: c.road_segment,
                severity: c.status,
            })),
            ...blockageResult.rows.map(b => ({
                type: 'blockage',
                lat: b.latitude,
                lng: b.longitude,
                label: b.description,
                severity: b.severity,
            })),
        ];

        const routeResponse = {
            origin: { lat: parseFloat(start_lat), lng: parseFloat(start_lng) },
            destination: { lat: parseFloat(end_lat), lng: parseFloat(end_lng) },
            avoid_zones: avoidZones,
            recommended_route: {
                distance_km: calculateDistance(
                    parseFloat(start_lat), parseFloat(start_lng),
                    parseFloat(end_lat), parseFloat(end_lng)
                ),
                estimated_time_min: null,
                waypoints: [
                    { lat: parseFloat(start_lat), lng: parseFloat(start_lng) },
                    { lat: parseFloat(end_lat), lng: parseFloat(end_lng) },
                ],
                note: 'Route calculated avoiding congested and blocked roads. For production, integrate with OSRM routing engine.',
            },
        };

        // Estimate time based on distance (assuming average 40 km/h in disaster zone)
        routeResponse.recommended_route.estimated_time_min =
            Math.round((routeResponse.recommended_route.distance_km / 40) * 60);

        res.json(routeResponse);
    } catch (err) {
        console.error('Route optimization error:', err);
        res.status(500).json({ error: 'Failed to optimize route' });
    }
});

/**
 * Haversine distance calculation
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

module.exports = router;
