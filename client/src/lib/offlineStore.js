/**
 * Offline data store using IndexedDB
 * Provides sync queue for when network is unavailable
 */

const DB_NAME = 'resqtrack_offline';
const DB_VERSION = 1;

/**
 * Open IndexedDB
 */
function openDB() {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') return reject('No window');

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Sync queue for pending operations
            if (!db.objectStoreNames.contains('syncQueue')) {
                const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
                syncStore.createIndex('type', 'type', { unique: false });
                syncStore.createIndex('timestamp', 'timestamp', { unique: false });
            }

            // Cached teams data
            if (!db.objectStoreNames.contains('teams')) {
                db.createObjectStore('teams', { keyPath: 'id' });
            }

            // Cached incidents data
            if (!db.objectStoreNames.contains('incidents')) {
                db.createObjectStore('incidents', { keyPath: 'id' });
            }

            // Cached congestion data
            if (!db.objectStoreNames.contains('congestion')) {
                db.createObjectStore('congestion', { keyPath: 'id' });
            }

            // Map tile cache
            if (!db.objectStoreNames.contains('mapTiles')) {
                db.createObjectStore('mapTiles', { keyPath: 'url' });
            }
        };
    });
}

/**
 * Add item to sync queue
 */
export async function addToSyncQueue(type, data) {
    const db = await openDB();
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');

    await store.add({
        type,
        data,
        timestamp: new Date().toISOString(),
        synced: false,
    });
}

/**
 * Get all pending sync items
 */
export async function getPendingSyncItems() {
    const db = await openDB();
    const tx = db.transaction('syncQueue', 'readonly');
    const store = tx.objectStore('syncQueue');

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result.filter(item => !item.synced));
        request.onerror = () => reject(request.error);
    });
}

/**
 * Clear synced items
 */
export async function clearSyncedItems() {
    const db = await openDB();
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');

    return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Cache data locally
 */
export async function cacheData(storeName, data) {
    try {
        const db = await openDB();
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);

        if (Array.isArray(data)) {
            for (const item of data) {
                await store.put(item);
            }
        } else {
            await store.put(data);
        }
    } catch (err) {
        console.warn('[OfflineStore] Cache error:', err);
    }
}

/**
 * Get cached data
 */
export async function getCachedData(storeName) {
    try {
        const db = await openDB();
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.warn('[OfflineStore] Read error:', err);
        return [];
    }
}

export default { addToSyncQueue, getPendingSyncItems, clearSyncedItems, cacheData, getCachedData };
