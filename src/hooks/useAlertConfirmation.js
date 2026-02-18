/**
 * useAlertConfirmation — False-alert reduction engine
 *
 * Three confirmation strategies (any one triggers a confirmed alert):
 *   1. Dual detection: 2 detections of any type within 10 seconds
 *   2. Combined signal: voice + scream within 10 seconds → immediate
 *   3. Silent cancel window: single detection starts 5s countdown; if not cancelled, fires
 *
 * Also enforces a 30-second cooldown between sent alerts per detection type.
 */
import { useState, useRef, useCallback, useEffect } from 'react'

const DUAL_DETECTION_WINDOW_MS = 10000
const CANCEL_WINDOW_MS = 5000
const COOLDOWN_MS = 30000

export default function useAlertConfirmation({ onAlertConfirmed }) {
    const [pendingAlert, setPendingAlert] = useState(null) // { type, confidence, timestamp, countdown }
    const [confirmationLog, setConfirmationLog] = useState([])

    const recentDetections = useRef([]) // [{ type, confidence, timestamp }]
    const cooldowns = useRef({}) // { [type]: lastAlertTimestamp }
    const cancelTimerRef = useRef(null)
    const countdownIntervalRef = useRef(null)

    const addToLog = useCallback((entry) => {
        setConfirmationLog((prev) => [entry, ...prev].slice(0, 50))
    }, [])

    const isOnCooldown = useCallback((type) => {
        const last = cooldowns.current[type] || 0
        return Date.now() - last < COOLDOWN_MS
    }, [])

    const fireAlert = useCallback((type, confidence) => {
        cooldowns.current[type] = Date.now()
        setPendingAlert(null)

        if (cancelTimerRef.current) {
            clearTimeout(cancelTimerRef.current)
            cancelTimerRef.current = null
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
            countdownIntervalRef.current = null
        }

        const entry = {
            type,
            confidence,
            timestamp: Date.now(),
            status: 'confirmed',
        }
        addToLog(entry)
        onAlertConfirmed?.(type, confidence)
    }, [addToLog, onAlertConfirmed])

    const cancelPending = useCallback(() => {
        if (cancelTimerRef.current) {
            clearTimeout(cancelTimerRef.current)
            cancelTimerRef.current = null
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
            countdownIntervalRef.current = null
        }

        if (pendingAlert) {
            addToLog({
                type: pendingAlert.type,
                confidence: pendingAlert.confidence,
                timestamp: Date.now(),
                status: 'cancelled',
            })
        }
        setPendingAlert(null)
    }, [pendingAlert, addToLog])

    // Main entry point: call this when any detector fires
    const reportDetection = useCallback((type, confidence) => {
        const now = Date.now()

        // Check cooldown
        if (isOnCooldown(type)) {
            addToLog({ type, confidence, timestamp: now, status: 'cooldown' })
            return
        }

        addToLog({ type, confidence, timestamp: now, status: 'pending' })

        // Add to recent detections window
        recentDetections.current.push({ type, confidence, timestamp: now })
        // Prune old detections
        recentDetections.current = recentDetections.current.filter(
            (d) => now - d.timestamp < DUAL_DETECTION_WINDOW_MS
        )

        const recent = recentDetections.current

        // Strategy 2: Combined signal (voice + scream) → immediate
        const hasVoice = recent.some((d) => d.type === 'voice_distress')
        const hasScream = recent.some((d) => d.type === 'scream_distress')
        if (hasVoice && hasScream) {
            recentDetections.current = []
            fireAlert('combined_distress', Math.max(...recent.map((d) => d.confidence)))
            return
        }

        // Strategy 1: Dual detection (2 of any type) → immediate
        if (recent.length >= 2) {
            const maxConf = Math.max(...recent.map((d) => d.confidence))
            recentDetections.current = []
            fireAlert(type, maxConf)
            return
        }

        // Strategy 3: Silent cancel window — start 5s countdown
        // Cancel any existing timer first
        if (cancelTimerRef.current) {
            clearTimeout(cancelTimerRef.current)
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
        }

        const expiresAt = now + CANCEL_WINDOW_MS
        setPendingAlert({ type, confidence, timestamp: now, countdown: CANCEL_WINDOW_MS / 1000 })

        // Update countdown every second
        countdownIntervalRef.current = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
            setPendingAlert((prev) => prev ? { ...prev, countdown: remaining } : null)
        }, 1000)

        cancelTimerRef.current = setTimeout(() => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current)
                countdownIntervalRef.current = null
            }
            cancelTimerRef.current = null
            // Fire if still not cancelled
            fireAlert(type, confidence)
        }, CANCEL_WINDOW_MS)
    }, [isOnCooldown, addToLog, fireAlert])

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current)
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
        }
    }, [])

    return { pendingAlert, confirmationLog, reportDetection, cancelPending }
}
