/**
 * LiveProtection — Browser-based real-time distress detection page.
 * Integrates voice, scream, gesture, and behavioral detection with alert triggering.
 * All detection runs client-side. Nothing recorded unless distress confirmed.
 */
import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import {
    ShieldCheck, ShieldOff, Mic, Camera, Eye, EyeOff,
    CheckCircle, XCircle, Clock, AlertTriangle, Loader, MapPin, Volume2, Activity
} from 'lucide-react'
import { simulateAlert } from '../../services/api'
import useVoiceDetection from '../../hooks/useVoiceDetection'
import useScreamDetection from '../../hooks/useScreamDetection'
import useGestureDetection from '../../hooks/useGestureDetection'
import useBehaviorDetection from '../../hooks/useBehaviorDetection'
import useAlertConfirmation from '../../hooks/useAlertConfirmation'
import useGeolocation from '../../hooks/useGeolocation'
import useLocalDetectionStore from '../../hooks/useLocalDetectionStore'
import './LiveProtection.css'

const DETECTION_TYPE_LABELS = {
    voice_distress: 'Voice Keyword',
    scream_distress: 'Scream Detected',
    gesture_distress: 'Hand Gesture',
    behavior_distress: 'Behavioral Anomaly',
    combined_distress: 'Combined Signal',
}

export default function LiveProtection() {
    const [protectionEnabled, setProtectionEnabled] = useState(false)
    const [tabVisible, setTabVisible] = useState(!document.hidden)
    const [alertsSent, setAlertsSent] = useState(0)
    const [lastAlertError, setLastAlertError] = useState(null)
    const [retryingAlert, setRetryingAlert] = useState(false)

    const videoRef = useRef(null)
    const streamRef = useRef(null)

    // ── Local Persistence ──
    const store = useLocalDetectionStore()

    // Restore protection state on mount
    useEffect(() => {
        if (store.isReady && store.protectionState !== null) {
            setProtectionEnabled(store.protectionState)
        }
    }, [store.isReady, store.protectionState])

    // Save protection state changes
    useEffect(() => {
        if (store.isReady) {
            store.saveStateValue('protectionEnabled', protectionEnabled)
        }
    }, [protectionEnabled, store])

    // ── Geolocation ──
    const { location, locationStatus } = useGeolocation({ enabled: protectionEnabled })

    // ── Alert Confirmation Engine with persistence ──
    const handleAlertConfirmed = useCallback(async (type, confidence) => {
        setLastAlertError(null)
        setRetryingAlert(false)

        const alertPayload = {
            location,
            detectionType: type,
            confidence: Math.round(confidence * 100) / 100,
        }

        // Retry logic (3 attempts with exponential backoff)
        let attempts = 0
        const maxAttempts = 3

        while (attempts < maxAttempts) {
            try {
                await simulateAlert(alertPayload)
                
                // Success!
                setAlertsSent((n) => n + 1)
                
                // Log to IndexedDB
                if (store.isReady) {
                    await store.addDetection({
                        type,
                        confidence,
                        status: 'confirmed',
                        timestamp: Date.now(),
                    })
                }
                
                return // Exit on success
            } catch (err) {
                attempts++
                const errorMsg = err.response?.data?.message || err.message || 'Alert delivery failed'
                
                if (attempts >= maxAttempts) {
                    // Final failure
                    setLastAlertError(`${errorMsg} (${attempts} attempts)`)
                    
                    // Log failure
                    if (store.isReady) {
                        await store.addDetection({
                            type,
                            confidence,
                            status: 'failed',
                            error: errorMsg,
                            timestamp: Date.now(),
                        })
                    }
                } else {
                    // Retry with backoff
                    setRetryingAlert(true)
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000))
                }
            }
        }
    }, [location, store])

    const { pendingAlert, confirmationLog, reportDetection, cancelPending } =
        useAlertConfirmation({ onAlertConfirmed: handleAlertConfirmed })

    // Log detections to IndexedDB
    useEffect(() => {
        if (store.isReady && confirmationLog.length > 0) {
            const latest = confirmationLog[0]
            // Avoid duplicate logging
            if (!latest._logged) {
                store.addDetection(latest).catch(() => { })
                latest._logged = true
            }
        }
    }, [confirmationLog, store])

    // ── Voice Detection ──
    const onVoiceDistress = useCallback((word, confidence) => {
        reportDetection('voice_distress', confidence)
    }, [reportDetection])

    const { isModelLoaded: voiceModelLoaded, detectionMethod: voiceMethod, error: voiceError } =
        useVoiceDetection({ onDistressDetected: onVoiceDistress, enabled: protectionEnabled })

    // ── Scream Detection ──
    const onScreamDetected = useCallback((confidence) => {
        reportDetection('scream_distress', confidence)
    }, [reportDetection])

    const { micLevel, error: screamError } =
        useScreamDetection({ onScreamDetected, enabled: protectionEnabled })

    // ── Gesture Detection ──
    const onGestureDetected = useCallback(() => {
        reportDetection('gesture_distress', 0.95)
    }, [reportDetection])

    const { isModelLoaded: gestureModelLoaded, handLandmarks, error: gestureError } =
        useGestureDetection({ onGestureDetected, enabled: protectionEnabled, videoRef })

    // ── Behavioral Anomaly Detection ──
    const onBehaviorAnomaly = useCallback((score) => {
        reportDetection('behavior_distress', Math.min(1, score / 3))
    }, [reportDetection])

    const { anomalyScore } = useBehaviorDetection({
        onAnomalyDetected: onBehaviorAnomaly,
        enabled: protectionEnabled,
    })

    // All models ready?
    const allModelsReady = voiceModelLoaded && gestureModelLoaded && store.isReady

    // ── Camera Stream ──
    useEffect(() => {
        let active = true

        async function startCamera() {
            if (protectionEnabled && videoRef.current) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { width: 640, height: 480, facingMode: 'user' },
                    })
                    if (active && videoRef.current) {
                        videoRef.current.srcObject = stream
                        streamRef.current = stream
                    }
                } catch (_) { /* Camera error handled by gesture hook */ }
            }
        }

        function stopCamera() {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop())
                streamRef.current = null
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null
            }
        }

        if (protectionEnabled) {
            startCamera()
        } else {
            stopCamera()
        }

        return () => {
            active = false
            stopCamera()
        }
    }, [protectionEnabled])

    // ── Tab Visibility ──
    useEffect(() => {
        const handler = () => setTabVisible(!document.hidden)
        document.addEventListener('visibilitychange', handler)
        return () => document.removeEventListener('visibilitychange', handler)
    }, [])

    // ── Status helper ──
    const anyError = voiceError || screamError || gestureError

    const statusIcon = useMemo(() => (loaded) =>
        loaded
            ? <CheckCircle size={14} className="lp-status-icon lp-status-icon--ready" />
            : <Loader size={14} className="lp-status-icon lp-status-icon--loading" />
    , [])

    const locationLabel = useMemo(() =>
        locationStatus === 'granted' ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
            : locationStatus === 'denied' ? 'Location denied'
                : locationStatus === 'requesting' ? 'Requesting…'
                    : 'Not available'
    , [locationStatus, location])

    const voiceMethodLabel = useMemo(() => 
        voiceMethod === 'tensorflow' ? 'TensorFlow.js'
            : voiceMethod === 'webspeech' ? 'Web Speech API'
                : 'Loading...'
    , [voiceMethod])

    // ── Camera Stream ──
    useEffect(() => {
        let active = true

        async function startCamera() {
            if (protectionEnabled && videoRef.current) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { width: 640, height: 480, facingMode: 'user' },
                    })
                    if (active && videoRef.current) {
                        videoRef.current.srcObject = stream
                        streamRef.current = stream
                    }
                } catch (_) { /* Camera error handled by gesture hook */ }
            }
        }

        function stopCamera() {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop())
                streamRef.current = null
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null
            }
        }

        if (protectionEnabled) {
            startCamera()
        } else {
            stopCamera()
        }

        return () => {
            active = false
            stopCamera()
        }
    }, [protectionEnabled])

    return (
        <div className="lp">
            <h1 className="dash-page-title">Live Protection</h1>
            <p className="dash-page-desc">
                Real-time distress detection using your laptop camera and microphone.
                All detection runs locally in your browser.
            </p>

            {/* Privacy Notice */}
            <div className="lp-privacy">
                <Eye size={16} />
                <span>All detection runs locally. Nothing is recorded or uploaded unless distress is confirmed.</span>
            </div>

            {/* Foreground Warning */}
            {protectionEnabled && !tabVisible && (
                <div className="lp-foreground-warning">
                    <EyeOff size={16} />
                    <span>Protection paused — tab not in focus. Return to resume.</span>
                </div>
            )}

            {protectionEnabled && tabVisible && (
                <div className="lp-foreground-notice">
                    <Eye size={16} />
                    <span>Protection active only while this tab is in the foreground.</span>
                </div>
            )}

            {/* Model Loading Panel */}
            <div className="dash-card lp-models">
                <div className="dash-card__title">
                    <ShieldCheck size={18} /> System Readiness
                </div>
                <div className="lp-models__grid">
                    <div className="lp-model-item">
                        {statusIcon(voiceModelLoaded)}
                        <span>Voice Detection</span>
                        {voiceModelLoaded && (
                            <span className="lp-model-detail">{voiceMethodLabel}</span>
                        )}
                    </div>
                    <div className="lp-model-item">
                        {statusIcon(true)} {/* Scream uses Web Audio, no model load needed */}
                        <span>Scream Detection</span>
                        <span className="lp-model-detail">Web Audio API</span>
                    </div>
                    <div className="lp-model-item">
                        {statusIcon(gestureModelLoaded)}
                        <span>Gesture Detection</span>
                        {gestureModelLoaded && (
                            <span className="lp-model-detail">MediaPipe Hands</span>
                        )}
                    </div>
                    <div className="lp-model-item">
                        {statusIcon(store.isReady)}
                        <span>Behavioral AI</span>
                        {store.isReady && (
                            <span className="lp-model-detail">Pattern Analysis</span>
                        )}
                    </div>
                </div>
                {allModelsReady ? (
                    <div className="lp-ready-badge">
                        <CheckCircle size={16} /> Protection Ready
                    </div>
                ) : (
                    <div className="lp-loading-badge">
                        <Loader size={16} className="lp-status-icon--loading" /> Loading AI models…
                    </div>
                )}
            </div>

            {/* Protection Toggle */}
            <div className="dash-card lp-toggle-card">
                <button
                    className={`lp-toggle ${protectionEnabled ? 'lp-toggle--active' : ''}`}
                    onClick={() => setProtectionEnabled((v) => !v)}
                    disabled={!allModelsReady}
                >
                    {protectionEnabled
                        ? <><ShieldCheck size={22} /> Protection Enabled</>
                        : <><ShieldOff size={22} /> Enable Protection</>
                    }
                </button>
                {!allModelsReady && (
                    <p className="lp-toggle-hint">Waiting for AI models to load…</p>
                )}
            </div>

            {/* Error Display */}
            {anyError && (
                <div className="lp-error">
                    <AlertTriangle size={16} />
                    <span>{anyError}</span>
                </div>
            )}

            {/* Sensor Feeds */}
            {protectionEnabled && (
                <div className="lp-sensors">
                    {/* Camera Preview */}
                    <div className="dash-card lp-camera-card">
                        <div className="dash-card__title">
                            <Camera size={16} /> Camera Feed
                        </div>
                        <div className="lp-video-container">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="lp-video"
                            />
                            {handLandmarks && (
                                <div className="lp-gesture-indicator">
                                    ✋ Hand detected
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mic Level */}
                    <div className="dash-card lp-mic-card">
                        <div className="dash-card__title">
                            <Mic size={16} /> Audio & Behavior Monitoring
                        </div>
                        
                        {/* Mic level bar */}
                        <div className="lp-mic-section">
                            <div className="lp-mic-label-top">
                                <Volume2 size={14} />
                                <span>Microphone</span>
                            </div>
                            <div className="lp-mic-bar-container">
                                <div
                                    className="lp-mic-bar"
                                    style={{ width: `${Math.round(micLevel * 100)}%` }}
                                />
                            </div>
                            <div className="lp-mic-value">
                                {Math.round(micLevel * 100)}%
                            </div>
                        </div>

                        {/* Behavioral anomaly score */}
                        {protectionEnabled && (
                            <div className="lp-behavior-section">
                                <div className="lp-mic-label-top">
                                    <Activity size={14} />
                                    <span>Behavior Pattern</span>
                                </div>
                                <div className="lp-mic-bar-container">
                                    <div
                                        className={`lp-mic-bar ${anomalyScore > 2 ? 'lp-mic-bar--alert' : ''}`}
                                        style={{ width: `${Math.min(100, Math.round((anomalyScore / 3) * 100))}%` }}
                                    />
                                </div>
                                <div className="lp-mic-value">
                                    {anomalyScore > 0.5 ? `${anomalyScore.toFixed(1)} σ` : 'Normal'}
                                </div>
                            </div>
                        )}

                        {/* Location status */}
                        <div className="lp-location">
                            <MapPin size={14} />
                            <span>{locationLabel}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Pending Alert (Cancel Window) */}
            {pendingAlert && (
                <div className="dash-card lp-pending-alert">
                    <div className="lp-pending-alert__header">
                        <Clock size={18} />
                        <span>
                            Distress detected — alerting in <strong>{pendingAlert.countdown}s</strong>
                        </span>
                    </div>
                    <p className="lp-pending-alert__type">
                        {DETECTION_TYPE_LABELS[pendingAlert.type] || pendingAlert.type}
                        {' '}— confidence {(pendingAlert.confidence * 100).toFixed(0)}%
                    </p>
                    <button className="btn btn-secondary lp-cancel-btn" onClick={cancelPending}>
                        <XCircle size={16} /> Cancel Alert
                    </button>
                </div>
            )}

            {/* Last Alert Error */}
            {lastAlertError && (
                <div className="lp-error" style={{ marginTop: 12 }}>
                    <AlertTriangle size={16} />
                    <span>{lastAlertError}</span>
                </div>
            )}

            {/* Retry Indicator */}
            {retryingAlert && (
                <div className="lp-retrying" style={{ marginTop: 12 }}>
                    <Loader size={16} className="lp-status-icon--loading" />
                    <span>Retrying alert delivery...</span>
                </div>
            )}

            {/* Alerts Sent Counter */}
            {alertsSent > 0 && (
                <div className="lp-alerts-sent">
                    <CheckCircle size={14} />
                    <span>{alertsSent} alert{alertsSent !== 1 ? 's' : ''} sent to guardians</span>
                </div>
            )}

            {/* Detection Log */}
            <div className="dash-card lp-log-card">
                <div className="dash-card__title">
                    <Clock size={16} /> Detection Log
                </div>
                {confirmationLog.length === 0 ? (
                    <div className="dash-empty">
                        <div className="dash-empty__icon"><ShieldCheck size={32} /></div>
                        <div className="dash-empty__text">
                            {protectionEnabled
                                ? 'Monitoring active — no detections yet.'
                                : 'Enable protection to start monitoring.'}
                        </div>
                    </div>
                ) : (
                    <div className="lp-log-list">
                        {confirmationLog.map((entry, i) => (
                            <div key={i} className="lp-log-entry">
                                <span className="lp-log-time">
                                    {new Date(entry.timestamp).toLocaleTimeString()}
                                </span>
                                <span className="lp-log-type">
                                    {DETECTION_TYPE_LABELS[entry.type] || entry.type}
                                </span>
                                <span className="lp-log-confidence">
                                    {(entry.confidence * 100).toFixed(0)}%
                                </span>
                                <span className={`dash-badge dash-badge--${entry.status === 'confirmed' ? 'success'
                                    : entry.status === 'cancelled' ? 'error'
                                        : entry.status === 'cooldown' ? 'pending'
                                            : 'pending'
                                    }`}>
                                    {entry.status.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
