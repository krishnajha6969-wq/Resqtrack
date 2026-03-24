/**
 * WebSocket handler for real-time communication
 * Uses Socket.io rooms for targeted broadcasting
 */
function setupWebSocket(io) {
    io.on('connection', (socket) => {
        console.log(`[WS] Client connected: ${socket.id}`);

        // Join role-based room
        socket.on('join:role', (role) => {
            if (role === 'command_center') {
                socket.join('command_center');
                console.log(`[WS] ${socket.id} joined command_center room`);
            }
        });

        // Join team-specific room
        socket.on('join:team', (teamId) => {
            socket.join(`team_${teamId}`);
            console.log(`[WS] ${socket.id} joined team_${teamId} room`);
        });

        // Handle real-time location updates from rescue teams
        socket.on('team:location', (data) => {
            // Broadcast to command center
            socket.to('command_center').emit('team:location', {
                team_id: data.team_id,
                latitude: data.latitude,
                longitude: data.longitude,
                speed: data.speed || 0,
                heading: data.heading || 0,
                timestamp: new Date().toISOString(),
            });
        });

        // Handle incident reports from field
        socket.on('incident:report', (data) => {
            io.to('command_center').emit('incident:new', {
                ...data,
                timestamp: new Date().toISOString(),
            });
        });

        // Handle road blockage reports
        socket.on('blockage:report', (data) => {
            io.emit('blockage:new', {
                ...data,
                timestamp: new Date().toISOString(),
            });
        });

        // Handle congestion updates
        socket.on('congestion:update', (data) => {
            io.emit('congestion:update', {
                ...data,
                timestamp: new Date().toISOString(),
            });
        });

        // Handle status changes
        socket.on('team:status', (data) => {
            io.to('command_center').emit('team:status', data);
        });

        // Handle mission updates
        socket.on('mission:update', (data) => {
            io.to('command_center').emit('mission:update', data);
            if (data.team_id) {
                io.to(`team_${data.team_id}`).emit('mission:update', data);
            }
        });

        // Handle offline data sync
        socket.on('sync:batch', (data) => {
            console.log(`[WS] Received sync batch from ${socket.id}: ${data.items?.length || 0} items`);
            // Process each queued item
            if (data.items && Array.isArray(data.items)) {
                data.items.forEach(item => {
                    switch (item.type) {
                        case 'location':
                            socket.to('command_center').emit('team:location', item.data);
                            break;
                        case 'incident':
                            io.to('command_center').emit('incident:new', item.data);
                            break;
                        case 'blockage':
                            io.emit('blockage:new', item.data);
                            break;
                    }
                });
            }
            socket.emit('sync:complete', { success: true, count: data.items?.length || 0 });
        });

        socket.on('disconnect', () => {
            console.log(`[WS] Client disconnected: ${socket.id}`);
        });
    });
}

module.exports = { setupWebSocket };
