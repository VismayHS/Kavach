/**
 * useGestureDetection — MediaPipe Hands open-palm gesture detection
 * Detects raised open palm held for 2 seconds via webcam.
 * Throttled to 10 FPS, auto-pauses when tab hidden.
 */
import { useState, useEffect, useRef, useCallback } from 'react'

const TARGET_FPS = 10
const FRAME_INTERVAL = 1000 / TARGET_FPS
const GESTURE_HOLD_MS = 2000 // Must hold gesture for 2 seconds

// Check if all fingers are extended based on landmarks
function isOpenPalm(landmarks) {
    if (!landmarks || landmarks.length < 21) return false

    // Finger tip and pip (proximal interphalangeal) landmark indices
    // If tip.y < pip.y, finger is extended (in screen coords, y increases downward)
    const fingerChecks = [
        { tip: 8, pip: 6 },   // Index
        { tip: 12, pip: 10 }, // Middle
        { tip: 16, pip: 14 }, // Ring
        { tip: 20, pip: 18 }, // Pinky
    ]

    // Thumb: tip.x vs ip.x (different axis for thumb)
    const thumbTip = landmarks[4]
    const thumbIp = landmarks[3]
    const wrist = landmarks[0]
    const isRightHand = landmarks[17].x < wrist.x
    const thumbExtended = isRightHand
        ? thumbTip.x < thumbIp.x
        : thumbTip.x > thumbIp.x

    if (!thumbExtended) return false

    for (const { tip, pip } of fingerChecks) {
        if (landmarks[tip].y >= landmarks[pip].y) return false
    }

    return true
}

export default function useGestureDetection({ onGestureDetected, enabled = false, videoRef }) {
    const [isDetecting, setIsDetecting] = useState(false)
    const [isModelLoaded, setIsModelLoaded] = useState(false)
    const [lastGesture, setLastGesture] = useState(null)
    const [handLandmarks, setHandLandmarks] = useState(null)
    const [error, setError] = useState(null)

    const handsRef = useRef(null)
    const animFrameRef = useRef(null)
    const lastFrameTime = useRef(0)
    const gestureStartRef = useRef(null)
    const enabledRef = useRef(enabled)
    const wasDetectingBeforeHide = useRef(false)
    const isDetectingRef = useRef(false)

    enabledRef.current = enabled

    // Load MediaPipe Hands model
    useEffect(() => {
        let cancelled = false

        async function loadModel() {
            try {
                const { Hands } = await import('@mediapipe/hands')
                const hands = new Hands({
                    locateFile: (file) =>
                        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
                })

                hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 0, // Lite model for performance
                    minDetectionConfidence: 0.6,
                    minTrackingConfidence: 0.5,
                })

                hands.onResults((results) => {
                    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                        const landmarks = results.multiHandLandmarks[0]
                        setHandLandmarks(landmarks)

                        if (isOpenPalm(landmarks)) {
                            if (!gestureStartRef.current) {
                                gestureStartRef.current = Date.now()
                            } else if (Date.now() - gestureStartRef.current >= GESTURE_HOLD_MS) {
                                const gesture = {
                                    type: 'open_palm',
                                    timestamp: Date.now(),
                                }
                                setLastGesture(gesture)
                                onGestureDetected?.('open_palm')
                                gestureStartRef.current = null // Reset after detection
                            }
                        } else {
                            gestureStartRef.current = null
                        }
                    } else {
                        setHandLandmarks(null)
                        gestureStartRef.current = null
                    }
                })

                if (!cancelled) {
                    handsRef.current = hands
                    setIsModelLoaded(true)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(`Gesture model failed to load: ${err.message}`)
                }
            }
        }

        loadModel()
        return () => { cancelled = true }
    }, [onGestureDetected])

    // Frame processing loop (throttled to 10 FPS)
    const processFrame = useCallback(async (timestamp) => {
        if (!isDetectingRef.current) return

        if (timestamp - lastFrameTime.current >= FRAME_INTERVAL) {
            lastFrameTime.current = timestamp
            const video = videoRef?.current
            const hands = handsRef.current

            if (video && hands && video.readyState >= 2) {
                try {
                    await hands.send({ image: video })
                } catch (_) { /* frame processing error, skip */ }
            }
        }

        animFrameRef.current = requestAnimationFrame(processFrame)
    }, [videoRef])

    const startDetection = useCallback(() => {
        if (isDetectingRef.current || !isModelLoaded) return
        isDetectingRef.current = true
        setIsDetecting(true)
        animFrameRef.current = requestAnimationFrame(processFrame)
    }, [isModelLoaded, processFrame])

    const stopDetection = useCallback(() => {
        isDetectingRef.current = false
        setIsDetecting(false)
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current)
            animFrameRef.current = null
        }
        gestureStartRef.current = null
        setHandLandmarks(null)
    }, [])

    // Auto-start/stop based on enabled prop
    useEffect(() => {
        if (enabled && isModelLoaded && !isDetecting) {
            startDetection()
        } else if (!enabled && isDetecting) {
            stopDetection()
        }
    }, [enabled, isModelLoaded, isDetecting, startDetection, stopDetection])

    // Tab visibility handling
    useEffect(() => {
        function handleVisibility() {
            if (document.hidden) {
                if (isDetectingRef.current) {
                    wasDetectingBeforeHide.current = true
                    stopDetection()
                }
            } else {
                if (wasDetectingBeforeHide.current && enabledRef.current) {
                    wasDetectingBeforeHide.current = false
                    startDetection()
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibility)
        return () => document.removeEventListener('visibilitychange', handleVisibility)
    }, [startDetection, stopDetection])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isDetectingRef.current = false
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current)
            }
        }
    }, [])

    return { isDetecting, isModelLoaded, lastGesture, handLandmarks, error, startDetection, stopDetection }
}
