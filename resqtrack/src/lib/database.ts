import { v4 as uuidv4 } from 'uuid';

// ============ TYPES ============

export interface Team {
  id: string;
  vehicle_id: string;
  team_name: string;
  type: 'ambulance' | 'fire' | 'police' | 'relief';
  location: { lat: number; lng: number };
  speed: number;
  status: 'active' | 'idle' | 'en-route' | 'on-scene';
  assigned_incident: string | null;
  last_updated: string;
}

export interface Incident {
  id: string;
  location: { lat: number; lng: number };
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  type: 'injured' | 'infrastructure' | 'fire' | 'flood' | 'rescue' | 'medical';
  assigned_team: string | null;
  status: 'reported' | 'assigned' | 'in-progress' | 'resolved';
  reporter: string;
  timestamp: string;
  address: string;
}

export interface Congestion {
  id: string;
  road_segment: string;
  location: { lat: number; lng: number };
  vehicle_count: number;
  average_speed: number;
  status: 'clear' | 'moderate' | 'congested' | 'blocked';
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'command' | 'rescue';
  team_id: string | null;
}

export interface RoadBlock {
  id: string;
  location: { lat: number; lng: number };
  description: string;
  reported_by: string;
  timestamp: string;
  status: 'active' | 'cleared';
}

// ============ SEED DATA ============
// Disaster zone center: Chennai, India (flood disaster scenario)
const CENTER = { lat: 13.0827, lng: 80.2707 };

const seedTeams: Team[] = [
  { id: uuidv4(), vehicle_id: 'AMB-001', team_name: 'Alpha Medics', type: 'ambulance', location: { lat: 13.0878, lng: 80.2785 }, speed: 35, status: 'en-route', assigned_incident: null, last_updated: new Date().toISOString() },
  { id: uuidv4(), vehicle_id: 'AMB-002', team_name: 'Bravo Medics', type: 'ambulance', location: { lat: 13.0650, lng: 80.2500 }, speed: 0, status: 'on-scene', assigned_incident: null, last_updated: new Date().toISOString() },
  { id: uuidv4(), vehicle_id: 'FIRE-001', team_name: 'Fire Squad 1', type: 'fire', location: { lat: 13.0920, lng: 80.2900 }, speed: 45, status: 'active', assigned_incident: null, last_updated: new Date().toISOString() },
  { id: uuidv4(), vehicle_id: 'FIRE-002', team_name: 'Fire Squad 2', type: 'fire', location: { lat: 13.0700, lng: 80.2600 }, speed: 20, status: 'en-route', assigned_incident: null, last_updated: new Date().toISOString() },
  { id: uuidv4(), vehicle_id: 'POL-001', team_name: 'Patrol Unit Alpha', type: 'police', location: { lat: 13.0800, lng: 80.2800 }, speed: 50, status: 'active', assigned_incident: null, last_updated: new Date().toISOString() },
  { id: uuidv4(), vehicle_id: 'POL-002', team_name: 'Patrol Unit Beta', type: 'police', location: { lat: 13.0950, lng: 80.2650 }, speed: 0, status: 'idle', assigned_incident: null, last_updated: new Date().toISOString() },
  { id: uuidv4(), vehicle_id: 'REL-001', team_name: 'Relief Convoy 1', type: 'relief', location: { lat: 13.0600, lng: 80.2400 }, speed: 30, status: 'en-route', assigned_incident: null, last_updated: new Date().toISOString() },
  { id: uuidv4(), vehicle_id: 'REL-002', team_name: 'Relief Convoy 2', type: 'relief', location: { lat: 13.1000, lng: 80.2950 }, speed: 15, status: 'active', assigned_incident: null, last_updated: new Date().toISOString() },
  { id: uuidv4(), vehicle_id: 'AMB-003', team_name: 'Charlie Medics', type: 'ambulance', location: { lat: 13.0750, lng: 80.2300 }, speed: 40, status: 'en-route', assigned_incident: null, last_updated: new Date().toISOString() },
  { id: uuidv4(), vehicle_id: 'FIRE-003', team_name: 'Fire Squad 3', type: 'fire', location: { lat: 13.0550, lng: 80.2750 }, speed: 0, status: 'on-scene', assigned_incident: null, last_updated: new Date().toISOString() },
];

const seedIncidents: Incident[] = [
  { id: uuidv4(), location: { lat: 13.0850, lng: 80.2750 }, severity: 'critical', description: 'Building collapse with trapped survivors', type: 'rescue', assigned_team: null, status: 'reported', reporter: 'Field Observer', timestamp: new Date(Date.now() - 1800000).toISOString(), address: 'Anna Salai, T. Nagar' },
  { id: uuidv4(), location: { lat: 13.0700, lng: 80.2550 }, severity: 'high', description: 'Flood water rising rapidly, families stranded', type: 'flood', assigned_team: null, status: 'in-progress', reporter: 'AMB-001', timestamp: new Date(Date.now() - 3600000).toISOString(), address: 'Adyar River Area' },
  { id: uuidv4(), location: { lat: 13.0920, lng: 80.2850 }, severity: 'critical', description: 'Gas leak and fire at industrial unit', type: 'fire', assigned_team: null, status: 'assigned', reporter: 'FIRE-001', timestamp: new Date(Date.now() - 900000).toISOString(), address: 'Guindy Industrial Estate' },
  { id: uuidv4(), location: { lat: 13.0600, lng: 80.2450 }, severity: 'medium', description: 'Road washed away, vehicles stranded', type: 'infrastructure', assigned_team: null, status: 'reported', reporter: 'POL-001', timestamp: new Date(Date.now() - 7200000).toISOString(), address: 'Velachery Main Road' },
  { id: uuidv4(), location: { lat: 13.0780, lng: 80.2680 }, severity: 'high', description: 'Multiple injuries reported at shelter', type: 'medical', assigned_team: null, status: 'reported', reporter: 'Relief Worker', timestamp: new Date(Date.now() - 2700000).toISOString(), address: 'Community Hall, Mylapore' },
  { id: uuidv4(), location: { lat: 13.0950, lng: 80.2400 }, severity: 'low', description: 'Power lines down, area needs cordoning', type: 'infrastructure', assigned_team: null, status: 'resolved', reporter: 'POL-002', timestamp: new Date(Date.now() - 14400000).toISOString(), address: 'Kodambakkam High Road' },
  { id: uuidv4(), location: { lat: 13.0500, lng: 80.2600 }, severity: 'critical', description: 'Hospital basement flooded, patients need evacuation', type: 'rescue', assigned_team: null, status: 'in-progress', reporter: 'AMB-002', timestamp: new Date(Date.now() - 600000).toISOString(), address: 'Government General Hospital' },
];

const seedCongestion: Congestion[] = [
  { id: uuidv4(), road_segment: 'Anna Salai - Mount Road', location: { lat: 13.0830, lng: 80.2730 }, vehicle_count: 5, average_speed: 8, status: 'congested', timestamp: new Date().toISOString() },
  { id: uuidv4(), road_segment: 'Adyar Bridge', location: { lat: 13.0680, lng: 80.2570 }, vehicle_count: 3, average_speed: 12, status: 'moderate', timestamp: new Date().toISOString() },
  { id: uuidv4(), road_segment: 'Velachery Bypass', location: { lat: 13.0580, lng: 80.2420 }, vehicle_count: 7, average_speed: 3, status: 'blocked', timestamp: new Date().toISOString() },
  { id: uuidv4(), road_segment: 'GST Road', location: { lat: 13.0750, lng: 80.2300 }, vehicle_count: 2, average_speed: 25, status: 'clear', timestamp: new Date().toISOString() },
  { id: uuidv4(), road_segment: 'ECR Connector', location: { lat: 13.0550, lng: 80.2800 }, vehicle_count: 4, average_speed: 10, status: 'moderate', timestamp: new Date().toISOString() },
];

const seedRoadBlocks: RoadBlock[] = [
  { id: uuidv4(), location: { lat: 13.0710, lng: 80.2530 }, description: 'Bridge submerged under flood water', reported_by: 'FIRE-001', timestamp: new Date(Date.now() - 5400000).toISOString(), status: 'active' },
  { id: uuidv4(), location: { lat: 13.0600, lng: 80.2380 }, description: 'Fallen tree blocking entire road', reported_by: 'POL-001', timestamp: new Date(Date.now() - 10800000).toISOString(), status: 'active' },
  { id: uuidv4(), location: { lat: 13.0900, lng: 80.2900 }, description: 'Sinkhole on main highway', reported_by: 'REL-001', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'active' },
];

const seedUsers: User[] = [
  { id: uuidv4(), email: 'command@resqtrack.com', password: 'admin123', name: 'Commander Singh', role: 'command', team_id: null },
  { id: uuidv4(), email: 'rescue@resqtrack.com', password: 'rescue123', name: 'Captain Priya', role: 'rescue', team_id: null },
];

// ============ IN-MEMORY DATABASE ============

class InMemoryDatabase {
  teams: Team[];
  incidents: Incident[];
  congestion: Congestion[];
  users: User[];
  roadBlocks: RoadBlock[];

  constructor() {
    this.teams = [...seedTeams];
    this.incidents = [...seedIncidents];
    this.congestion = [...seedCongestion];
    this.users = [...seedUsers];
    this.roadBlocks = [...seedRoadBlocks];

    // Assign some incidents to teams
    if (this.incidents[1] && this.teams[1]) {
      this.incidents[1].assigned_team = this.teams[1].id;
      this.teams[1].assigned_incident = this.incidents[1].id;
    }
    if (this.incidents[2] && this.teams[2]) {
      this.incidents[2].assigned_team = this.teams[2].id;
      this.teams[2].assigned_incident = this.incidents[2].id;
    }
    if (this.incidents[6] && this.teams[0]) {
      this.incidents[6].assigned_team = this.teams[0].id;
      this.teams[0].assigned_incident = this.incidents[6].id;
    }
  }
}

// Singleton
let db: InMemoryDatabase | null = null;

export function getDatabase(): InMemoryDatabase {
  if (!db) {
    db = new InMemoryDatabase();
  }
  return db;
}

export { CENTER };
