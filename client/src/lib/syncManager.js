import { getPendingSyncItems, clearSyncedItems } from './offlineStore';
import { sendSyncBatch, getSocket } from './socket';

/**
 * Sync Manager
 * Monitors online/offline status and syncs data when connection is restored
 */
class SyncManager {
    constructor() {
        this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
        this.isSyncing = false;
        this.listeners = new Set();
    }

    /**
     * Start monitoring connectivity
     */
    start() {
        if (typeof window === 'undefined') return;

        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Check socket connection status
        const socket = getSocket();
        socket.on('connect', () => this.handleOnline());
        socket.on('disconnect', () => this.handleOffline());

        // Listen for sync completion
        socket.on('sync:complete', (data) => {
            console.log('[SyncManager] Sync completed:', data);
            clearSyncedItems();
            this.isSyncing = false;
            this.notify('sync_complete', data);
        });
    }

    handleOnline() {
        this.isOnline = true;
        console.log('[SyncManager] Online — starting sync...');
        this.notify('online');
        this.syncPendingData();
    }

    handleOffline() {
        this.isOnline = false;
        console.log('[SyncManager] Offline — queuing data locally');
        this.notify('offline');
    }

    /**
     * Flush pending data to server
     */
    async syncPendingData() {
        if (this.isSyncing || !this.isOnline) return;

        this.isSyncing = true;
        try {
            const items = await getPendingSyncItems();
            if (items.length > 0) {
                console.log(`[SyncManager] Syncing ${items.length} queued items...`);
                sendSyncBatch(items);
                this.notify('syncing', { count: items.length });
            } else {
                this.isSyncing = false;
            }
        } catch (err) {
            console.error('[SyncManager] Sync error:', err);
            this.isSyncing = false;
        }
    }

    /**
     * Subscribe to sync status changes
     */
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notify(event, data) {
        this.listeners.forEach(cb => cb(event, data));
    }

    getStatus() {
        return {
            isOnline: this.isOnline,
            isSyncing: this.isSyncing,
        };
    }
}

const syncManager = new SyncManager();
export default syncManager;
