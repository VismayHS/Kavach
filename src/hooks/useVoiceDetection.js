/**
 * useVoiceDetection — Dual-layer voice keyword detection
 * 
 * Layer 1 (preferred): TensorFlow.js Speech Commands (18-word vocabulary)
 * Layer 2 (fallback): Web Speech API keyword spotting
 * 
 * Listens for distress keywords: "help", "stop"
 * Fully client-side, auto-pauses when tab is hidden.
 */
import { useState, useEffect, useRef, useCallback } from 'react'

// ── Layer 1: TensorFlow.js Speech Commands ──
let _speechCommands = null
async function loadSpeechCommands() {
    if (!_speechCommands) {
        await import('@tensorflow/tfjs')
        _speechCommands = await import('@tensorflow-models/speech-commands')
    }
    return _speechCommands
}

const DISTRESS_KEYWORDS = ['help', 'stop']
const CONFIDENCE_THRESHOLD = 0.7
const MODEL_LOAD_TIMEOUT_MS = 15000

export default function useVoiceDetection({ onDistressDetected, enabled = false }) {
    const [isListening, setIsListening] = useState(false)
    const [isModelLoaded, setIsModelLoaded] = useState(false)
    const [detectionMethod, setDetectionMethod] = useState(null) // 'tensorflow' | 'webspeech'
    const [lastDetection, setLastDetection] = useState(null)
    const [error, setError] = useState(null)

    const recognizerRef = useRef(null) // TensorFlow recognizer
    const speechRecognitionRef = useRef(null) // Web Speech API recognizer
    const enabledRef = useRef(enabled)
    const wasListeningBeforeHide = useRef(false)
    const retryCountRef = useRef(0)

    enabledRef.current = enabled

    // ── Load TensorFlow.js model with timeout and fallback ──
    useEffect(() => {
        let cancelled = false
        let timeoutId = null

        async function loadModel() {
            try {
                // Timeout protection
                const loadPromise = (async () => {
                    const speechCommands = await loadSpeechCommands()
                    const recognizer = speechCommands.create('BROWSER_FFT')
                    await recognizer.ensureModelLoaded()
                    return recognizer
                })()

                timeoutId = setTimeout(() => {
                    throw new Error('Model loading timeout exceeded')
                }, MODEL_LOAD_TIMEOUT_MS)

                const recognizer = await loadPromise
                clearTimeout(timeoutId)

                if (!cancelled) {
                    recognizerRef.current = recognizer
                    setDetectionMethod('tensorflow')
                    setIsModelLoaded(true)
                    setError(null)
                }
            } catch (err) {
                clearTimeout(timeoutId)
                
                if (!cancelled) {
                    console.warn('TensorFlow.js voice model failed, falling back to Web Speech API:', err.message)
                    
                    // Fall back to Web Speech API
                    if (initWebSpeechAPI()) {
                        setDetectionMethod('webspeech')
                        setIsModelLoaded(true)
                        setError(null)
                    } else {
                        setError(`Voice detection unavailable: ${err.message}`)
                        retryCountRef.current++
                        
                        // Retry once after 3 seconds
                        if (retryCountRef.current < 2) {
                            setTimeout(() => {
                                if (!cancelled) loadModel()
                            }, 3000)
                        }
                    }
                }
            }
        }

        // Helper: Initialize Web Speech API
        function initWebSpeechAPI() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            if (!SpeechRecognition) return false

            try {
                const recognition = new SpeechRecognition()
                recognition.continuous = true
                recognition.interimResults = false
                recognition.lang = 'en-US'
                recognition.maxAlternatives = 3

                recognition.onresult = (event) => {
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const result = event.results[i]
                        if (!result.isFinal) continue

                        const transcript = result[0].transcript.toLowerCase().trim()
                        const confidence = result[0].confidence

                        // Check if any distress keyword is present
                        for (const keyword of DISTRESS_KEYWORDS) {
                            if (transcript.includes(keyword) && confidence >= CONFIDENCE_THRESHOLD) {
                                const detection = {
                                    word: keyword,
                                    confidence,
                                    timestamp: Date.now(),
                                    method: 'webspeech',
                                }
                                setLastDetection(detection)
                                onDistressDetected?.(keyword, confidence)
                                break
                            }
                        }
                    }
                }

                recognition.onerror = (event) => {
                    if (event.error === 'no-speech' || event.error === 'audio-capture') {
                        // Ignore transient errors
                        return
                    }
                    console.error('Web Speech API error:', event.error)
                }

                recognition.onend = () => {
                    // Auto-restart if still enabled
                    if (enabledRef.current && speechRecognitionRef.current) {
                        try {
                            recognition.start()
                        } catch (_) { /* already started */ }
                    }
                }

                speechRecognitionRef.current = recognition
                return true
            } catch (err) {
                console.error('Web Speech API initialization failed:', err)
                return false
            }
        }

        loadModel()
        return () => {
            cancelled = true
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [])

    // ── Start listening (handles both TensorFlow and Web Speech API) ──
    const startListening = useCallback(async () => {
        if (isListening || !isModelLoaded) return

        try {
            if (detectionMethod === 'tensorflow') {
                const recognizer = recognizerRef.current
                if (!recognizer) return

                const wordLabels = recognizer.wordLabels()

                await recognizer.listen(
                    (result) => {
                        const scores = result.scores
                        let maxScore = 0
                        let maxIndex = 0
                        for (let i = 0; i < scores.length; i++) {
                            if (scores[i] > maxScore) {
                                maxScore = scores[i]
                                maxIndex = i
                            }
                        }

                        const detectedWord = wordLabels[maxIndex]

                        if (DISTRESS_KEYWORDS.includes(detectedWord) && maxScore >= CONFIDENCE_THRESHOLD) {
                            const detection = {
                                word: detectedWord,
                                confidence: maxScore,
                                timestamp: Date.now(),
                                method: 'tensorflow',
                            }
                            setLastDetection(detection)
                            onDistressDetected?.(detectedWord, maxScore)
                        }
                    },
                    {
                        probabilityThreshold: CONFIDENCE_THRESHOLD,
                        invokeCallbackOnNoiseAndUnknown: false,
                        overlapFactor: 0.5,
                    }
                )
            } else if (detectionMethod === 'webspeech') {
                const recognition = speechRecognitionRef.current
                if (!recognition) return

                // Start recognition
                recognition.start()
            }

            setIsListening(true)
            setError(null)
        } catch (err) {
            // Handle "already started" errors gracefully
            if (err.message && err.message.includes('already')) {
                setIsListening(true)
            } else {
                setError(`Microphone access failed: ${err.message}`)
            }
        }
    }, [isListening, isModelLoaded, detectionMethod, onDistressDetected])

    // ── Stop listening (handles both methods) ──
    const stopListening = useCallback(async () => {
        if (!isListening) return

        try {
            if (detectionMethod === 'tensorflow') {
                const recognizer = recognizerRef.current
                if (recognizer && recognizer.isListening && recognizer.isListening()) {
                    await recognizer.stopListening()
                }
            } else if (detectionMethod === 'webspeech') {
                const recognition = speechRecognitionRef.current
                if (recognition) {
                    recognition.stop()
                }
            }
        } catch (_) { /* ignore stop errors */ }

        setIsListening(false)
    }, [isListening, detectionMethod])

    // Auto-start/stop based on enabled prop
    useEffect(() => {
        if (enabled && isModelLoaded && !isListening) {
            startListening()
        } else if (!enabled && isListening) {
            stopListening()
        }
    }, [enabled, isModelLoaded, isListening, startListening, stopListening])

    // Tab visibility handling — pause when hidden, resume when visible
    useEffect(() => {
        function handleVisibility() {
            if (document.hidden) {
                if (isListening) {
                    wasListeningBeforeHide.current = true
                    stopListening()
                }
            } else {
                if (wasListeningBeforeHide.current && enabledRef.current) {
                    wasListeningBeforeHide.current = false
                    startListening()
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibility)
        return () => document.removeEventListener('visibilitychange', handleVisibility)
    }, [isListening, startListening, stopListening])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (detectionMethod === 'tensorflow') {
                const recognizer = recognizerRef.current
                if (recognizer && recognizer.isListening && recognizer.isListening()) {
                    recognizer.stopListening().catch(() => { })
                }
            } else if (detectionMethod === 'webspeech') {
                const recognition = speechRecognitionRef.current
                if (recognition) {
                    recognition.stop()
                }
            }
        }
    }, [detectionMethod])

    return {
        isListening,
        isModelLoaded,
        detectionMethod,
        lastDetection,
        error,
        startListening,
        stopListening,
    }
}
