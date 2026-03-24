-- ResQTrack Database Schema
-- PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('rescue_team', 'command_center', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TEAMS TABLE
-- ============================================
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id VARCHAR(50) UNIQUE NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'responding', 'offline')),
    assigned_incident_id UUID,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INCIDENTS TABLE
-- ============================================
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    incident_type VARCHAR(100) DEFAULT 'general',
    assigned_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'resolved', 'closed')),
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key for teams -> incidents
ALTER TABLE teams
    ADD CONSTRAINT fk_teams_incident
    FOREIGN KEY (assigned_incident_id) REFERENCES incidents(id) ON DELETE SET NULL;

-- ============================================
-- CONGESTION TABLE
-- ============================================
CREATE TABLE congestion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    road_segment VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    vehicle_density INTEGER DEFAULT 0,
    average_speed DOUBLE PRECISION DEFAULT 0,
    status VARCHAR(50) DEFAULT 'clear' CHECK (status IN ('clear', 'moderate', 'congested')),
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MISSIONS TABLE
-- ============================================
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    route_data JSONB,
    status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'en_route', 'on_scene', 'completed', 'aborted')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROAD BLOCKAGES TABLE
-- ============================================
CREATE TABLE road_blockages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description TEXT,
    severity VARCHAR(50) DEFAULT 'moderate' CHECK (severity IN ('minor', 'moderate', 'severe', 'impassable')),
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_teams_location ON teams(latitude, longitude);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_location ON incidents(latitude, longitude);
CREATE INDEX idx_congestion_status ON congestion(status);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_road_blockages_active ON road_blockages(is_active);
