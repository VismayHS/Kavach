/**
 * useVoiceDetection — TensorFlow.js Speech Commands keyword spotting
 * Listens for distress keywords ("help", "stop") via browser microphone.
 * Fully client-side, auto-pauses when tab is hidden.
 */
import { useState, useEffect, useRef, useCallback } from 'react'

// Lazy-load TF.js + speech-commands to avoid blocking initial render
let _speechCommands = null
async function loadSpeechCommands() {
    if (!_speechCommands) {
        await import('@tensorflow/tfjs')
        _speechCommands = await import('@tensorflow-models/speech-commands')
    }
    return _speechCommands
}

const DISTRESS_KEYWORDS = ['help', 'stop']
const CONFIDENCE_THRESHOLD = 0.75

export default function useVoiceDetection({ onDistressDetected, enabled = false }) {
    const [isListening, setIsListening] = useState(false)
    const [isModelLoaded, setIsModelLoaded] = useState(false)
    const [lastDetection, setLastDetection] = useState(null)
    const [error, setError] = useState(null)

    const recognizerRef = useRef(null)
    const enabledRef = useRef(enabled)
    const wasListeningBeforeHide = useRef(false)

    enabledRef.current = enabled

    // Load model on mount
    useEffect(() => {
        let cancelled = false

        async function loadModel() {
            try {
                const speechCommands = await loadSpeechCommands()
                const recognizer = speechCommands.create('BROWSER_FFT')
                await recognizer.ensureModelLoaded()
                if (!cancelled) {
                    recognizerRef.current = recognizer
                    setIsModelLoaded(true)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(`Voice model failed to load: ${err.message}`)
                }
            }
        }

        loadModel()
        return () => { cancelled = true }
    }, [])

    // Start listening
    const startListening = useCallback(async () => {
        const recognizer = recognizerRef.current
        if (!recognizer || isListening) return

        try {
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
            setIsListening(true)
            setError(null)
        } catch (err) {
            setError(`Microphone access failed: ${err.message}`)
        }
    }, [isListening, onDistressDetected])

    // Stop listening
    const stopListening = useCallback(async () => {
        const recognizer = recognizerRef.current
        if (!recognizer || !recognizer.isListening()) return
        try {
            await recognizer.stopListening()
        } catch (_) { /* ignore */ }
        setIsListening(false)
    }, [])

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
            const recognizer = recognizerRef.current
            if (recognizer && recognizer.isListening()) {
                recognizer.stopListening().catch(() => { })
            }
        }
    }, [])

    return { isListening, isModelLoaded, lastDetection, error, startListening, stopListening }
}
