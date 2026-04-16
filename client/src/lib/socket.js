import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'https://resqtrack-backend-cb04.onrender.com';

let socket = null;

/**
 * Initialize Socket.io connection
 */
export function initSocket() {
    if (socket && socket.connected) return socket;

    socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
    });

    socket.on('connect', () => {
        console.log('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
        console.warn('[Socket] Connection error:', err.message);
    });

    return socket;
}

/**
 * Get current socket instance
 */
export function getSocket() {
    if (!socket) return initSocket();
    return socket;
}

/**
 * Join a role-based room
 */
export function joinRole(role) {
    const s = getSocket();
    s.emit('join:role', role);
}

/**
 * Join a team-specific room
 */
export function joinTeam(teamId) {
    const s = getSocket();
    s.emit('join:team', teamId);
}

/**
 * Send location update
 */
export function sendLocationUpdate(teamId, lat, lng, speed, heading) {
    const s = getSocket();
    s.emit('team:location', {
        team_id: teamId,
        latitude: lat,
        longitude: lng,
        speed,
        heading,
    });
}

/**
 * Send offline sync batch
 */
export function sendSyncBatch(items) {
    const s = getSocket();
    s.emit('sync:batch', { items });
}

/**
 * Disconnect socket
 */
export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export default { initSocket, getSocket, joinRole, joinTeam, sendLocationUpdate, sendSyncBatch, disconnectSocket };
