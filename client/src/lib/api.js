const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * API client with JWT authentication
 */
class ApiClient {
    constructor() {
        this.baseURL = API_BASE;
    }

    getToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('resqtrack_token');
        }
        return null;
    }

    setToken(token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('resqtrack_token', token);
        }
    }

    clearToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('resqtrack_token');
            localStorage.removeItem('resqtrack_user');
        }
    }

    getUser() {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('resqtrack_user');
            return user ? JSON.parse(user) : null;
        }
        return null;
    }

    setUser(user) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('resqtrack_user', JSON.stringify(user));
        }
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getToken();

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw { status: response.status, message: data.error || 'Request failed' };
            }

            return data;
        } catch (err) {
            if (err.status) throw err;
            // Network error — queue for offline sync
            console.warn('[API] Network error, request may be queued:', err.message);
            throw { status: 0, message: 'Network error', offline: true };
        }
    }

    // Auth
    async login(email, password) {
        const data = await this.request('/api/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.setToken(data.token);
        this.setUser(data.user);
        return data;
    }

    async register(email, password, full_name, role) {
        const data = await this.request('/api/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, full_name, role }),
        });
        this.setToken(data.token);
        this.setUser(data.user);
        return data;
    }

    logout() {
        this.clearToken();
    }

    // Teams
    getTeams() { return this.request('/api/teams'); }
    updateTeamLocation(team_id, latitude, longitude, status) {
        return this.request('/api/team/location', {
            method: 'POST',
            body: JSON.stringify({ team_id, latitude, longitude, status }),
        });
    }
    updateTeamStatus(id, status) {
        return this.request(`/api/teams/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    // Incidents
    getIncidents(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`/api/incidents${params ? '?' + params : ''}`);
    }
    getIncident(id) { return this.request(`/api/incidents/${id}`); }
    createIncident(data) {
        return this.request('/api/incidents', { method: 'POST', body: JSON.stringify(data) });
    }
    assignIncident(incident_id, team_id) {
        return this.request('/api/incidents/assign', {
            method: 'PUT',
            body: JSON.stringify({ incident_id, team_id }),
        });
    }
    updateIncidentStatus(id, status) {
        return this.request(`/api/incidents/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    // Congestion
    getCongestion() { return this.request('/api/congestion'); }
    getCongestionHeatmap() { return this.request('/api/congestion/heatmap'); }
    reportCongestion(data) {
        return this.request('/api/congestion/report', { method: 'POST', body: JSON.stringify(data) });
    }

    // Routes
    getOptimizedRoute(start_lat, start_lng, end_lat, end_lng) {
        return this.request(
            `/api/routes/optimize?start_lat=${start_lat}&start_lng=${start_lng}&end_lat=${end_lat}&end_lng=${end_lng}`
        );
    }
}

const api = new ApiClient();
export default api;
