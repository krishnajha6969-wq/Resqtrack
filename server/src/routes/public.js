const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

async function reverseGeocode(lat, lng) {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`);
        if (!res.ok) return null;
        const data = await res.json();
        if (data && data.address) {
            const { road, suburb, neighbourhood, city, town, village } = data.address;
            const street = road || neighbourhood || suburb;
            const area = city || town || village || suburb;
            if (street && area) return `${street}, ${area}`;
            if (street) return street;
            if (area) return area;
        }
        return data?.display_name?.split(',').slice(0, 2).join(',') || null;
    } catch (err) {
        console.error('Reverse geocode error:', err);
        return null;
    }
}


/**
 * POST /api/public/incident/report
 * Citizen reports an incident — NO authentication required
 */
router.post('/incident/report', async (req, res) => {
    try {
        const {
            title, latitude, longitude, severity, description,
            incident_type, victim_count, reporter_name, reporter_phone, hazards
        } = req.body;

        if (!title || !latitude || !longitude || !severity) {
            return res.status(400).json({ error: 'title, latitude, longitude, and severity are required' });
        }

        const result = await pool.query(
            `INSERT INTO incidents (title, latitude, longitude, severity, description, incident_type, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'reported')
             RETURNING *`,
            [
                title,
                latitude,
                longitude,
                severity,
                description || '',
                incident_type || 'general',
            ]
        );

        const incident = result.rows[0];

        // Broadcast to admin dashboard & rescue teams via WebSocket
        const io = req.app.get('io');
        if (io) {
            io.emit('incident:new', {
                ...incident,
                is_citizen_reported: true,
                reporter_name: reporter_name || 'Anonymous Citizen',
                reporter_phone: reporter_phone || '',
                victim_count: victim_count || 0,
                hazards: hazards || '',
            });
        }

        res.status(201).json({
            success: true,
            incident_id: incident.id,
            message: 'Incident reported. Help is on the way.',
            estimated_response_time: '8-12 minutes',
        });
    } catch (err) {
        console.error('Public incident report error:', err);
        res.status(500).json({ error: 'Failed to report incident' });
    }
});

/**
 * POST /api/public/congestion/report
 * Citizen reports traffic congestion — NO authentication required
 */
router.post('/congestion/report', async (req, res) => {
    try {
        const { latitude, longitude, congestion_level, congestion_type, description } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'latitude and longitude are required' });
        }

        // Map congestion_level to status
        let status = 'clear';
        if (congestion_level === 'blocked') status = 'congested';
        else if (congestion_level === 'heavy') status = 'congested';
        else if (congestion_level === 'moderate') status = 'moderate';
        else status = 'clear';

        let road_segment = req.body.road_segment;
        if (!road_segment) {
            const geoName = await reverseGeocode(latitude, longitude);
            road_segment = geoName ? geoName : `Citizen Report (${parseFloat(latitude).toFixed(3)}, ${parseFloat(longitude).toFixed(3)})`;
        }

        const result = await pool.query(
            `INSERT INTO congestion (road_segment, latitude, longitude, vehicle_density, average_speed, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                road_segment,
                latitude,
                longitude,
                congestion_level === 'blocked' ? 20 : congestion_level === 'heavy' ? 15 : congestion_level === 'moderate' ? 8 : 3,
                congestion_level === 'blocked' ? 0 : congestion_level === 'heavy' ? 5 : congestion_level === 'moderate' ? 15 : 30,
                status,
            ]
        );

        const congestion = result.rows[0];

        // Broadcast to admin dashboard
        const io = req.app.get('io');
        if (io) {
            io.emit('congestion:update', {
                ...congestion,
                congestion_type: congestion_type || '',
                description: description || '',
                is_citizen_reported: true,
            });
        }

        res.status(201).json({
            success: true,
            congestion_id: congestion.id,
            message: 'Traffic report submitted. Rescue teams will reroute.',
        });
    } catch (err) {
        console.error('Public congestion report error:', err);
        res.status(500).json({ error: 'Failed to report congestion' });
    }
});

module.exports = router;
