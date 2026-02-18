/**
 * useBehaviorDetection — Lightweight client-side behavioral anomaly detection
 * 
 * Tracks mouse/keyboard/scroll behavior and detects anomalies that may indicate distress:
 * - Rapid erratic mouse movements
 * - Sudden inactivity after high activity
 * - Repeated panic key presses
 * - Abnormal scrolling patterns
 * 
 * Uses statistical deviation (z-score) instead of ML to stay lightweight.
 * Web equivalent of Android's Isolation Forest approach.
 */
import { useState, useEffect, useRef, useCallback } from 'react'

// Configuration
const SAMPLE_WINDOW_SIZE = 30 // Number of samples to maintain for baseline
const ANALYSIS_INTERVAL_MS = 3000 // Analyze every 3 seconds (reduced from 2s)
const ANOMALY_THRESHOLD = 2.5 // Z-score threshold (2.5 = ~99% confidence)
const SUSTAINED_ANOMALY_DURATION_MS = 4000 // Anomaly must persist for this long
const COOLDOWN_MS = 30000 // Cooldown between detections
const MOUSE_THROTTLE_MS = 100 // Throttle mouse events (10 samples/sec max)
const KEY_THROTTLE_MS = 50 // Throttle keyboard events

// Feature weights (how much each contributes to anomaly score)
const WEIGHTS = {
    mouseSpeed: 0.3,
    mouseAccel: 0.25,
    scrollSpeed: 0.2,
    inactivitySwitch: 0.15,
    keyRepeat: 0.1,
}

export default function useBehaviorDetection({ onAnomalyDetected, enabled = false }) {
    const [isMonitoring, setIsMonitoring] = useState(false)
    const [anomalyScore, setAnomalyScore] = useState(0)
    const [lastAnomaly, setLastAnomaly] = useState(null)

    // Real-time activity tracking
    const mousePositions = useRef([]) // [{x, y, timestamp}]
    const scrollEvents = useRef([]) // [{delta, timestamp}]
    const keyPresses = useRef([]) // [{key, timestamp}]
    const lastActivityTime = useRef(Date.now())
    const wasActive = useRef(false)

    // Baseline statistics (rolling window)
    const baselineFeatures = useRef([]) // [{mouseSpeed, mouseAccel, scrollSpeed, ...}]
    
    // Anomaly tracking
    const anomalyStartTime = useRef(null)
    const lastDetectionTime = useRef(0)
    const analysisInterval = useRef(null)

    // Throttling
    const lastMouseEvent = useRef(0)
    const lastKeyEvent = useRef(0)

    const enabledRef = useRef(enabled)
    enabledRef.current = enabled

    // ── Event Handlers ──
    const handleMouseMove = useCallback((e) => {
        const now = Date.now()
        
        // Throttle: only process every 100ms
        if (now - lastMouseEvent.current < MOUSE_THROTTLE_MS) return
        lastMouseEvent.current = now
        
        mousePositions.current.push({ x: e.clientX, y: e.clientY, timestamp: now })
        
        // Keep only last 30 positions (reduced from 50)
        if (mousePositions.current.length > 30) {
            mousePositions.current.shift()
        }

        lastActivityTime.current = now
        wasActive.current = true
    }, [])

    const handleScroll = useCallback((e) => {
        const now = Date.now()
        const delta = Math.abs(e.deltaY || 0)
        scrollEvents.current.push({ delta, timestamp: now })

        // Keep only last 30 scroll events
        if (scrollEvents.current.length > 30) {
            scrollEvents.current.shift()
        }

        lastActivityTime.current = now
        wasActive.current = true
    }, [])

    const handleKeyDown = useCallback((e) => {
        const now = Date.now()
        
        // Throttle: only process every 50ms
        if (now - lastKeyEvent.current < KEY_THROTTLE_MS) return
        lastKeyEvent.current = now
        
        keyPresses.current.push({ key: e.key, timestamp: now })

        // Keep only last 20 key presses (reduced from 30)
        if (keyPresses.current.length > 20) {
            keyPresses.current.shift()
        }

        lastActivityTime.current = now
        wasActive.current = true
    }, [])

    // ── Feature Extraction ──
    const extractFeatures = useCallback(() => {
        const now = Date.now()
        const recentWindow = 2000 // Last 2 seconds

        // 1. Mouse movement speed
        const recentMouse = mousePositions.current.filter(p => now - p.timestamp < recentWindow)
        let mouseSpeed = 0
        let mouseAccel = 0

        if (recentMouse.length >= 2) {
            const distances = []
            for (let i = 1; i < recentMouse.length; i++) {
                const dx = recentMouse[i].x - recentMouse[i - 1].x
                const dy = recentMouse[i].y - recentMouse[i - 1].y
                const dt = (recentMouse[i].timestamp - recentMouse[i - 1].timestamp) / 1000
                const dist = Math.sqrt(dx * dx + dy * dy)
                const speed = dt > 0 ? dist / dt : 0
                distances.push(speed)
            }
            
            mouseSpeed = distances.reduce((a, b) => a + b, 0) / distances.length

            // Acceleration (variance in speed)
            if (distances.length >= 2) {
                const speedVariance = distances.reduce((sum, d) => {
                    return sum + Math.pow(d - mouseSpeed, 2)
                }, 0) / distances.length
                mouseAccel = Math.sqrt(speedVariance)
            }
        }

        // 2. Scroll speed
        const recentScrolls = scrollEvents.current.filter(s => now - s.timestamp < recentWindow)
        const scrollSpeed = recentScrolls.length > 0
            ? recentScrolls.reduce((sum, s) => sum + s.delta, 0) / recentScrolls.length
            : 0

        // 3. Sudden inactivity after high activity
        const timeSinceActivity = now - lastActivityTime.current
        const inactivitySwitch = wasActive.current && timeSinceActivity > 3000 ? 1 : 0
        if (timeSinceActivity < 3000) {
            wasActive.current = true
        } else {
            wasActive.current = false
        }

        // 4. Repeated key presses (panic typing)
        const recentKeys = keyPresses.current.filter(k => now - k.timestamp < recentWindow)
        const keyRepeatRate = recentKeys.length / 2 // Keys per second

        // Check for same key repeated rapidly
        let sameKeyRepeats = 0
        for (let i = 1; i < recentKeys.length; i++) {
            if (recentKeys[i].key === recentKeys[i - 1].key) {
                sameKeyRepeats++
            }
        }
        const keyRepeat = sameKeyRepeats > 3 ? keyRepeatRate : 0

        return { mouseSpeed, mouseAccel, scrollSpeed, inactivitySwitch, keyRepeat }
    }, [])

    // ── Statistical Anomaly Detection ──
    const calculateZScore = useCallback((value, history) => {
        if (history.length < 5) return 0 // Need minimum baseline

        const mean = history.reduce((a, b) => a + b, 0) / history.length
        const variance = history.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / history.length
        const stdDev = Math.sqrt(variance)

        if (stdDev === 0) return 0
        return Math.abs((value - mean) / stdDev)
    }, [])

    const analyzeForAnomalies = useCallback(() => {
        const features = extractFeatures()

        // Add to baseline window
        baselineFeatures.current.push(features)
        if (baselineFeatures.current.length > SAMPLE_WINDOW_SIZE) {
            baselineFeatures.current.shift()
        }

        // Not enough baseline data yet
        if (baselineFeatures.current.length < 10) {
            return
        }

        // Calculate z-scores for each feature
        const history = baselineFeatures.current
        const zScores = {
            mouseSpeed: calculateZScore(
                features.mouseSpeed,
                history.map(f => f.mouseSpeed)
            ),
            mouseAccel: calculateZScore(
                features.mouseAccel,
                history.map(f => f.mouseAccel)
            ),
            scrollSpeed: calculateZScore(
                features.scrollSpeed,
                history.map(f => f.scrollSpeed)
            ),
            inactivitySwitch: features.inactivitySwitch * 3, // Direct indicator, amplify
            keyRepeat: calculateZScore(
                features.keyRepeat,
                history.map(f => f.keyRepeat)
            ),
        }

        // Weighted composite anomaly score
        const compositeScore = Object.entries(WEIGHTS).reduce((score, [feature, weight]) => {
            return score + (zScores[feature] || 0) * weight
        }, 0)

        // Only update UI if score changed significantly (reduce re-renders)
        const roundedScore = Math.round(compositeScore * 100) / 100
        if (Math.abs(roundedScore - anomalyScore) > 0.05) {
            setAnomalyScore(roundedScore)
        }

        // Check if anomaly threshold exceeded
        if (compositeScore >= ANOMALY_THRESHOLD) {
            const now = Date.now()

            // Check cooldown
            if (now - lastDetectionTime.current < COOLDOWN_MS) {
                return
            }

            // Start tracking sustained anomaly
            if (!anomalyStartTime.current) {
                anomalyStartTime.current = now
            } else if (now - anomalyStartTime.current >= SUSTAINED_ANOMALY_DURATION_MS) {
                // Sustained anomaly detected!
                const anomaly = {
                    score: compositeScore,
                    features,
                    zScores,
                    timestamp: now,
                }
                setLastAnomaly(anomaly)
                onAnomalyDetected?.(compositeScore)
                
                lastDetectionTime.current = now
                anomalyStartTime.current = null
            }
        } else {
            // Reset if score drops below threshold
            anomalyStartTime.current = null
        }
    }, [extractFeatures, calculateZScore, onAnomalyDetected])

    // ── Start/Stop Monitoring ──
    const startMonitoring = useCallback(() => {
        if (isMonitoring) return

        window.addEventListener('mousemove', handleMouseMove, { passive: true })
        window.addEventListener('wheel', handleScroll, { passive: true })
        window.addEventListener('keydown', handleKeyDown, { passive: true })

        analysisInterval.current = setInterval(analyzeForAnomalies, ANALYSIS_INTERVAL_MS)

        setIsMonitoring(true)
    }, [isMonitoring, handleMouseMove, handleScroll, handleKeyDown, analyzeForAnomalies])

    const stopMonitoring = useCallback(() => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('wheel', handleScroll)
        window.removeEventListener('keydown', handleKeyDown)

        if (analysisInterval.current) {
            clearInterval(analysisInterval.current)
            analysisInterval.current = null
        }

        setIsMonitoring(false)
        setAnomalyScore(0)
    }, [handleMouseMove, handleScroll, handleKeyDown])

    // ── Auto-toggle based on enabled prop ──
    useEffect(() => {
        if (enabled && !isMonitoring) {
            startMonitoring()
        } else if (!enabled && isMonitoring) {
            stopMonitoring()
        }
    }, [enabled, isMonitoring, startMonitoring, stopMonitoring])

    // ── Tab visibility handling ──
    useEffect(() => {
        function handleVisibility() {
            if (document.hidden && isMonitoring) {
                stopMonitoring()
            } else if (!document.hidden && enabledRef.current && !isMonitoring) {
                startMonitoring()
            }
        }

        document.addEventListener('visibilitychange', handleVisibility)
        return () => document.removeEventListener('visibilitychange', handleVisibility)
    }, [isMonitoring, startMonitoring, stopMonitoring])

    // ── Cleanup on unmount ──
    useEffect(() => {
        return () => stopMonitoring()
    }, [stopMonitoring])

    return {
        isMonitoring,
        anomalyScore,
        lastAnomaly,
        startMonitoring,
        stopMonitoring,
    }
}
