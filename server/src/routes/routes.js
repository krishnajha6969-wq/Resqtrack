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

        // ---- SMART ROUTING AVOIDANCE LOGIC ----
        const waypoints = [{ lat: parseFloat(start_lat), lng: parseFloat(start_lng) }];
        
        let hasDetour = false;
        
        // Loop through avoid zones to see if they intersect our path roughly
        // We use a simplified bounding / distance math for the hackathon
        avoidZones.forEach(zone => {
            // Find distance from zone to the straight line segment
            const dist = pointToLineDistance(
                zone.lat, zone.lng, 
                parseFloat(start_lat), parseFloat(start_lng), 
                parseFloat(end_lat), parseFloat(end_lng)
            );
            
            // If the route passes within ~600m (~0.006 degrees) of a severe congestion or blockage
            if (dist < 0.006 && (zone.severity === 'congested' || zone.severity === 'critical')) {
                hasDetour = true;
                // Calculate midpoint
                const midLat = (parseFloat(start_lat) + parseFloat(end_lat)) / 2;
                const midLng = (parseFloat(start_lng) + parseFloat(end_lng)) / 2;
                
                // Add an orthogonal deflection 
                // swap dx, dy and multiply by a scalar to push it sideways
                const dx = parseFloat(end_lat) - parseFloat(start_lat);
                const dy = parseFloat(end_lng) - parseFloat(start_lng);
                
                // Normal vector
                const nLat = -dy * 0.5; // Bend out
                const nLng = dx * 0.5;
                
                waypoints.push({
                    lat: midLat + nLat,
                    lng: midLng + nLng,
                    is_detour: true,
                    avoided_zone: zone.label
                });
            }
        });
        
        waypoints.push({ lat: parseFloat(end_lat), lng: parseFloat(end_lng) });

        const routeResponse = {
            origin: { lat: parseFloat(start_lat), lng: parseFloat(start_lng) },
            destination: { lat: parseFloat(end_lat), lng: parseFloat(end_lng) },
            avoid_zones: avoidZones,
            recommended_route: {
                distance_km: calculateDistance(
                    parseFloat(start_lat), parseFloat(start_lng),
                    parseFloat(end_lat), parseFloat(end_lng)
                ) * (hasDetour ? 1.4 : 1), // Increase calculated distance if detoured
                estimated_time_min: null,
                waypoints: waypoints,
                note: hasDetour ? 'Route dynamically detoured to avoid active congestion/blockages.' : 'Clear path calculated.',
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

// Helper: Distance from Point P to Line Segment AB (in degrees approximation)
function pointToLineDistance(px, py, ax, ay, bx, by) {
    const l2 = (bx - ax) ** 2 + (by - ay) ** 2;
    if (l2 === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
    let t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = ax + t * (bx - ax);
    const projY = ay + t * (by - ay);
    return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

module.exports = router;
