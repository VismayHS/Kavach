/**
 * useLocalDetectionStore — IndexedDB persistence for detection logs and state
 * 
 * Web equivalent of Android Room database.
 * Persists:
 * - Recent detections (last 7 days)
 * - Alert cooldown timestamps
 * - Protection enabled state
 * - Session statistics
 * 
 * Auto-expires old entries and provides restore capability on page reload.
 */
import { useState, useEffect, useCallback, useRef } from 'react'

const DB_NAME = 'RakshakDetectionDB'
const DB_VERSION = 1
const STORE_DETECTIONS = 'detections'
const STORE_STATE = 'state'
const RETENTION_DAYS = 7
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000

/**
 * Initialize IndexedDB
 */
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)

        request.onupgradeneeded = (event) => {
            const db = event.target.result

            // Detections object store
            if (!db.objectStoreNames.contains(STORE_DETECTIONS)) {
                const detectionStore = db.createObjectStore(STORE_DETECTIONS, {
                    keyPath: 'id',
                    autoIncrement: true,
                })
                detectionStore.createIndex('timestamp', 'timestamp', { unique: false })
                detectionStore.createIndex('type', 'type', { unique: false })
            }

            // State object store (key-value pairs)
            if (!db.objectStoreNames.contains(STORE_STATE)) {
                db.createObjectStore(STORE_STATE, { keyPath: 'key' })
            }
        }
    })
}

export default function useLocalDetectionStore() {
    const [isReady, setIsReady] = useState(false)
    const [storedDetections, setStoredDetections] = useState([])
    const [protectionState, setProtectionState] = useState(null)
    const [error, setError] = useState(null)

    const dbRef = useRef(null)

    // ── Initialize DB on mount ──
    useEffect(() => {
        let mounted = true

        async function init() {
            try {
                const db = await openDatabase()
                if (mounted) {
                    dbRef.current = db
                    await cleanupOldEntries()
                    await loadStoredData()
                    setIsReady(true)
                }
            } catch (err) {
                if (mounted) {
                    setError(`IndexedDB initialization failed: ${err.message}`)
                }
            }
        }

        init()
        return () => {
            mounted = false
            if (dbRef.current) {
                dbRef.current.close()
            }
        }
    }, [])

    // ── Cleanup old detections ──
    const cleanupOldEntries = useCallback(async () => {
        const db = dbRef.current
        if (!db) return

        const cutoffTime = Date.now() - RETENTION_MS
        const transaction = db.transaction([STORE_DETECTIONS], 'readwrite')
        const store = transaction.objectStore(STORE_DETECTIONS)
        const index = store.index('timestamp')
        const range = IDBKeyRange.upperBound(cutoffTime)

        return new Promise((resolve, reject) => {
            const request = index.openCursor(range)
            
            request.onsuccess = (event) => {
                const cursor = event.target.result
                if (cursor) {
                    cursor.delete()
                    cursor.continue()
                } else {
                    resolve()
                }
            }

            request.onerror = () => reject(request.error)
        })
    }, [])

    // ── Load stored data on init ──
    const loadStoredData = useCallback(async () => {
        const db = dbRef.current
        if (!db) return

        // Load detections
        const detections = await new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_DETECTIONS], 'readonly')
            const store = transaction.objectStore(STORE_DETECTIONS)
            const request = store.getAll()

            request.onsuccess = () => {
                const records = request.result || []
                // Sort by timestamp descending
                records.sort((a, b) => b.timestamp - a.timestamp)
                resolve(records)
            }
            request.onerror = () => reject(request.error)
        })
        setStoredDetections(detections)

        // Load protection state
        const state = await getStateValue('protectionEnabled')
        setProtectionState(state)
    }, [])

    // ── Add detection record ──
    const addDetection = useCallback(async (detection) => {
        const db = dbRef.current
        if (!db) return

        const record = {
            ...detection,
            timestamp: detection.timestamp || Date.now(),
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_DETECTIONS], 'readwrite')
            const store = transaction.objectStore(STORE_DETECTIONS)
            const request = store.add(record)

            request.onsuccess = () => {
                // Update local state
                setStoredDetections(prev => [record, ...prev].slice(0, 100))
                resolve(request.result)
            }
            request.onerror = () => reject(request.error)
        })
    }, [])

    // ── Get recent detections ──
    const getRecentDetections = useCallback(async (limit = 50) => {
        const db = dbRef.current
        if (!db) return []

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_DETECTIONS], 'readonly')
            const store = transaction.objectStore(STORE_DETECTIONS)
            const request = store.getAll()

            request.onsuccess = () => {
                const records = request.result || []
                records.sort((a, b) => b.timestamp - a.timestamp)
                resolve(records.slice(0, limit))
            }
            request.onerror = () => reject(request.error)
        })
    }, [])

    // ── Get detections by type ──
    const getDetectionsByType = useCallback(async (type) => {
        const db = dbRef.current
        if (!db) return []

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_DETECTIONS], 'readonly')
            const store = transaction.objectStore(STORE_DETECTIONS)
            const index = store.index('type')
            const request = index.getAll(type)

            request.onsuccess = () => resolve(request.result || [])
            request.onerror = () => reject(request.error)
        })
    }, [])

    // ── Clear all detections ──
    const clearDetections = useCallback(async () => {
        const db = dbRef.current
        if (!db) return

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_DETECTIONS], 'readwrite')
            const store = transaction.objectStore(STORE_DETECTIONS)
            const request = store.clear()

            request.onsuccess = () => {
                setStoredDetections([])
                resolve()
            }
            request.onerror = () => reject(request.error)
        })
    }, [])

    // ── Save state value (key-value) ──
    const saveStateValue = useCallback(async (key, value) => {
        const db = dbRef.current
        if (!db) return

        const record = { key, value, updatedAt: Date.now() }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_STATE], 'readwrite')
            const store = transaction.objectStore(STORE_STATE)
            const request = store.put(record)

            request.onsuccess = () => {
                if (key === 'protectionEnabled') {
                    setProtectionState(value)
                }
                resolve()
            }
            request.onerror = () => reject(request.error)
        })
    }, [])

    // ── Get state value ──
    const getStateValue = useCallback(async (key) => {
        const db = dbRef.current
        if (!db) return null

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_STATE], 'readonly')
            const store = transaction.objectStore(STORE_STATE)
            const request = store.get(key)

            request.onsuccess = () => {
                const record = request.result
                resolve(record ? record.value : null)
            }
            request.onerror = () => reject(request.error)
        })
    }, [])

    // ── Save cooldown timestamp ──
    const saveCooldown = useCallback(async (type, timestamp) => {
        return saveStateValue(`cooldown_${type}`, timestamp)
    }, [saveStateValue])

    // ── Get cooldown timestamp ──
    const getCooldown = useCallback(async (type) => {
        return getStateValue(`cooldown_${type}`)
    }, [getStateValue])

    // ── Get statistics ──
    const getStatistics = useCallback(async () => {
        const detections = await getRecentDetections()
        
        const stats = {
            total: detections.length,
            byType: {},
            confirmedCount: 0,
            cancelledCount: 0,
            last24Hours: 0,
        }

        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000

        detections.forEach(d => {
            // Count by type
            stats.byType[d.type] = (stats.byType[d.type] || 0) + 1

            // Count by status
            if (d.status === 'confirmed') stats.confirmedCount++
            if (d.status === 'cancelled') stats.cancelledCount++

            // Count last 24 hours
            if (d.timestamp >= oneDayAgo) stats.last24Hours++
        })

        return stats
    }, [getRecentDetections])

    return {
        isReady,
        error,
        storedDetections,
        protectionState,
        
        // Detection methods
        addDetection,
        getRecentDetections,
        getDetectionsByType,
        clearDetections,
        
        // State methods
        saveStateValue,
        getStateValue,
        
        // Cooldown methods
        saveCooldown,
        getCooldown,
        
        // Statistics
        getStatistics,
    }
}
