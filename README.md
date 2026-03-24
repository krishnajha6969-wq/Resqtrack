# ResQTrack — Smart Disaster Response Coordination Platform

> Real-time tracking, congestion-aware routing, and offline-first coordination for rescue teams operating in disaster zones.

## 🏗️ Architecture

```
resqtrack/
├── client/          # Next.js frontend (React, TailwindCSS, Leaflet)
│   ├── src/
│   │   ├── app/           # Pages (Landing, Login, Dashboard, Incidents, Rescue, Analytics)
│   │   ├── components/    # Reusable UI components (MapView, Cards, Charts, Navbar)
│   │   └── lib/           # API client, Socket.io, IndexedDB, SyncManager
│   └── public/            # Static assets & Service Worker
├── server/          # Express.js backend
│   └── src/
│       ├── config/        # Database connection
│       ├── middleware/     # JWT authentication & RBAC
│       ├── routes/        # REST APIs (auth, teams, incidents, congestion, routes)
│       └── websocket/     # Socket.io real-time handler
└── database/        # PostgreSQL schema & seed data
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (optional — frontend works with demo data)

### Frontend (Next.js)

```bash
cd client
npm install
npm run dev
# → http://localhost:3000
```

### Backend (Express.js)

```bash
cd server
cp .env.example .env    # Edit with your PostgreSQL credentials
npm install
npm run dev
# → http://localhost:5000
```

### Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE resqtrack;"

# Run schema
psql -U postgres -d resqtrack -f database/schema.sql

# Load demo data
psql -U postgres -d resqtrack -f database/seed.sql
```

## 🔑 Demo Access

The login page includes **Quick Demo Access** buttons that bypass authentication for testing:
- **Command Center** → Dashboard, Incidents, Analytics
- **Rescue Team** → Field Operations interface

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Authenticate & get JWT |
| GET | `/api/teams` | List all teams |
| POST | `/api/team/location` | Update team GPS |
| GET | `/api/incidents` | List incidents |
| POST | `/api/incidents` | Create incident |
| PUT | `/api/incidents/assign` | Assign team |
| GET | `/api/congestion` | Get congestion zones |
| POST | `/api/congestion/report` | Report congestion |
| GET | `/api/routes/optimize` | Get optimized route |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, React, TailwindCSS |
| Maps | Leaflet + OpenStreetMap (CARTO dark tiles) |
| Charts | Chart.js |
| Backend | Express.js, Node.js |
| Database | PostgreSQL |
| Real-time | Socket.io (WebSockets) |
| Offline | IndexedDB, Service Workers |
| Auth | JWT + bcrypt |

## 🔮 Future Scope

Architecture supports integration with **Starlink satellite internet** for command vehicles acting as communication gateways in network-dead disaster zones.
