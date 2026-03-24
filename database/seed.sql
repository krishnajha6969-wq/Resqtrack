-- ResQTrack Seed Data
-- For development and demo purposes

-- Insert admin user (password: admin123)
INSERT INTO users (id, email, password_hash, full_name, role) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@resqtrack.io', '$2b$10$XvJ2Q5VJ7VQ5VJ7VQ5VJ7u', 'Command Admin', 'command_center'),
('a0000000-0000-0000-0000-000000000002', 'rescue1@resqtrack.io', '$2b$10$XvJ2Q5VJ7VQ5VJ7VQ5VJ7u', 'Alpha Team Lead', 'rescue_team'),
('a0000000-0000-0000-0000-000000000003', 'rescue2@resqtrack.io', '$2b$10$XvJ2Q5VJ7VQ5VJ7VQ5VJ7u', 'Bravo Team Lead', 'rescue_team');

-- Insert teams
INSERT INTO teams (id, vehicle_id, team_name, latitude, longitude, status, user_id) VALUES
('b0000000-0000-0000-0000-000000000001', 'RV-001', 'Alpha Rescue', 28.6139, 77.2090, 'available', 'a0000000-0000-0000-0000-000000000002'),
('b0000000-0000-0000-0000-000000000002', 'RV-002', 'Bravo Medical', 28.6200, 77.2150, 'responding', 'a0000000-0000-0000-0000-000000000003'),
('b0000000-0000-0000-0000-000000000003', 'AMB-001', 'Charlie Ambulance', 28.6100, 77.2300, 'busy', NULL),
('b0000000-0000-0000-0000-000000000004', 'RV-003', 'Delta Relief', 28.6300, 77.2000, 'available', NULL),
('b0000000-0000-0000-0000-000000000005', 'AMB-002', 'Echo Ambulance', 28.6050, 77.1950, 'available', NULL);

-- Insert incidents
INSERT INTO incidents (id, title, latitude, longitude, severity, description, incident_type, status) VALUES
('c0000000-0000-0000-0000-000000000001', 'Building Collapse - Sector 5', 28.6150, 77.2100, 'critical', 'Multi-story building collapsed after earthquake. Multiple casualties reported.', 'structural', 'in_progress'),
('c0000000-0000-0000-0000-000000000002', 'Flood Water Rising - River Bank', 28.6250, 77.2200, 'high', 'Water level rising rapidly near residential area. Evacuation needed.', 'flood', 'reported'),
('c0000000-0000-0000-0000-000000000003', 'Road Blocked - Highway 44', 28.6080, 77.2250, 'medium', 'Large debris blocking main highway. Rescue vehicles cannot pass.', 'blockage', 'reported'),
('c0000000-0000-0000-0000-000000000004', 'Medical Emergency - Relief Camp', 28.6320, 77.2050, 'high', 'Multiple people with injuries at relief camp. Need medical teams urgently.', 'medical', 'in_progress');

-- Insert congestion data
INSERT INTO congestion (road_segment, latitude, longitude, vehicle_density, average_speed, status) VALUES
('Highway 44 - Section A', 28.6100, 77.2150, 8, 5.2, 'congested'),
('Ring Road - Junction B', 28.6200, 77.2100, 4, 18.5, 'moderate'),
('Main Street - Sector 12', 28.6300, 77.2250, 2, 35.0, 'clear');

-- Insert road blockages
INSERT INTO road_blockages (latitude, longitude, description, severity, is_active) VALUES
(28.6080, 77.2250, 'Large debris from collapsed structure blocking both lanes', 'impassable', TRUE),
(28.6170, 77.2180, 'Fallen tree partially blocking road', 'moderate', TRUE),
(28.6290, 77.2090, 'Flood water on road surface - 2ft deep', 'severe', TRUE);
