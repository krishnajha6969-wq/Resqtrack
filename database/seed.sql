-- ResQTrack Seed Data
-- For development and demo purposes
-- All coordinates are in Mira-Bhayander area

-- Insert admin user (password: admin123)
INSERT INTO users (id, email, password_hash, full_name, role) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@resqtrack.io', '$2b$10$XvJ2Q5VJ7VQ5VJ7VQ5VJ7u', 'Command Admin', 'command_center'),
('a0000000-0000-0000-0000-000000000002', 'rescue1@resqtrack.io', '$2b$10$XvJ2Q5VJ7VQ5VJ7VQ5VJ7u', 'Alpha Team Lead', 'rescue_team'),
('a0000000-0000-0000-0000-000000000003', 'rescue2@resqtrack.io', '$2b$10$XvJ2Q5VJ7VQ5VJ7VQ5VJ7u', 'Bravo Team Lead', 'rescue_team');

-- Insert teams (Mira-Bhayander coordinates)
INSERT INTO teams (id, vehicle_id, team_name, latitude, longitude, status, user_id) VALUES
('b0000000-0000-0000-0000-000000000001', 'RV-001', 'Alpha Rescue', 19.2820, 72.8550, 'available', 'a0000000-0000-0000-0000-000000000002'),
('b0000000-0000-0000-0000-000000000002', 'RV-002', 'Bravo Medical', 19.3100, 72.8530, 'responding', 'a0000000-0000-0000-0000-000000000003'),
('b0000000-0000-0000-0000-000000000003', 'AMB-001', 'Charlie Ambulance', 19.2800, 72.8700, 'busy', NULL),
('b0000000-0000-0000-0000-000000000004', 'RV-003', 'Delta Relief', 19.2950, 72.8600, 'available', NULL),
('b0000000-0000-0000-0000-000000000005', 'AMB-002', 'Echo Ambulance', 19.2900, 72.8450, 'available', NULL);

-- Insert incidents (Mira-Bhayander coordinates)
INSERT INTO incidents (id, title, latitude, longitude, severity, description, incident_type, status) VALUES
('c0000000-0000-0000-0000-000000000001', 'Building Collapse - Near Maxus', 19.3100, 72.8440, 'critical', 'Old building near Maxus Mall collapsed. Multiple casualties reported.', 'structural', 'in_progress'),
('c0000000-0000-0000-0000-000000000002', 'Flood Water Rising - Uttan', 19.3200, 72.8050, 'high', 'High tide causing water logging in low-lying coastal areas of Uttan.', 'flood', 'reported'),
('c0000000-0000-0000-0000-000000000003', 'Road Blocked - WEH Mira Road', 19.2900, 72.8710, 'medium', 'Tree fell blocking the Western Express Highway.', 'blockage', 'reported'),
('c0000000-0000-0000-0000-000000000004', 'Medical Emergency - GCC Club', 19.2800, 72.8750, 'high', 'Multiple heatstrokes reported at relief camp.', 'medical', 'in_progress');

-- Insert congestion data (Mira-Bhayander coordinates)
INSERT INTO congestion (road_segment, latitude, longitude, vehicle_density, average_speed, status) VALUES
('WEH - Fountain Hotel', 19.2920, 72.8750, 8, 5.2, 'congested'),
('Mira Road Station Rd', 19.2820, 72.8550, 4, 18.5, 'moderate'),
('Bhayander Phatak', 19.3050, 72.8580, 2, 35.0, 'clear');

-- Insert road blockages (Mira-Bhayander coordinates)
INSERT INTO road_blockages (latitude, longitude, description, severity, is_active) VALUES
(19.2900, 72.8710, 'Large debris from collapsed structure blocking both lanes', 'impassable', TRUE),
(19.2850, 72.8600, 'Fallen tree partially blocking road', 'moderate', TRUE),
(19.3100, 72.8440, 'Flood water on road surface - 2ft deep', 'severe', TRUE);
