/**
 * useScreamDetection — Web Audio API energy + pitch analysis
 * Detects sustained high-energy, high-pitch audio (scream pattern).
 * Fully client-side, auto-pauses when tab hidden.
 */
import { useState, useEffect, useRef, useCallback } from 'react'

// Scream detection thresholds
const RMS_THRESHOLD = 0.15           // Normalized RMS energy (0–1)
const HIGH_FREQ_RATIO_THRESHOLD = 0.4 // Ratio of energy in 1–4 kHz band
const SUSTAIN_MS = 500               // Must sustain for this long
const ANALYSIS_INTERVAL_MS = 150     // How often to analyse (increased from 100ms for performance)

export default function useScreamDetection({ onScreamDetected, enabled = false }) {
    const [isListening, setIsListening] = useState(false)
    const [micLevel, setMicLevel] = useState(0)
    const [error, setError] = useState(null)

    const audioContextRef = useRef(null)
    const analyserRef = useRef(null)
    const streamRef = useRef(null)
    const intervalRef = useRef(null)
    const screamStartRef = useRef(null)
    const enabledRef = useRef(enabled)
    const wasListeningBeforeHide = useRef(false)

    enabledRef.current = enabled

    const startListening = useCallback(async () => {
        if (isListening) return

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const audioContext = new (window.AudioContext || window.webkitAudioContext)()
            const source = audioContext.createMediaStreamSource(stream)
            const analyser = audioContext.createAnalyser()
            analyser.fftSize = 1024 // Reduced from 2048 for better performance
            analyser.smoothingTimeConstant = 0.5 // Increased smoothing
            source.connect(analyser)

            audioContextRef.current = audioContext
            analyserRef.current = analyser
            streamRef.current = stream

            const bufferLength = analyser.frequencyBinCount
            const dataArray = new Float32Array(bufferLength)
            const freqArray = new Uint8Array(bufferLength)

            intervalRef.current = setInterval(() => {
                // Time-domain RMS
                analyser.getFloatTimeDomainData(dataArray)
                let sumSquares = 0
                for (let i = 0; i < bufferLength; i++) {
                    sumSquares += dataArray[i] * dataArray[i]
                }
                const rms = Math.sqrt(sumSquares / bufferLength)
                setMicLevel(Math.min(1, rms * 5)) // Amplify for UI display

                // Frequency-domain analysis for pitch
                analyser.getByteFrequencyData(freqArray)
                const sampleRate = audioContext.sampleRate
                const binSize = sampleRate / analyser.fftSize

                // Calculate energy in 1–4 kHz band vs total
                let totalEnergy = 0
                let highFreqEnergy = 0
                for (let i = 0; i < bufferLength; i++) {
                    const freq = i * binSize
                    const energy = freqArray[i]
                    totalEnergy += energy
                    if (freq >= 1000 && freq <= 4000) {
                        highFreqEnergy += energy
                    }
                }

                const highFreqRatio = totalEnergy > 0 ? highFreqEnergy / totalEnergy : 0
                const isScreamLike = rms >= RMS_THRESHOLD && highFreqRatio >= HIGH_FREQ_RATIO_THRESHOLD

                if (isScreamLike) {
                    if (!screamStartRef.current) {
                        screamStartRef.current = Date.now()
                    } else if (Date.now() - screamStartRef.current >= SUSTAIN_MS) {
                        const confidence = Math.min(1, (rms / 0.3) * (highFreqRatio / 0.6))
                        onScreamDetected?.(confidence)
                        screamStartRef.current = null // Reset after detection
                    }
                } else {
                    screamStartRef.current = null
                }
            }, ANALYSIS_INTERVAL_MS)

            setIsListening(true)
            setError(null)
        } catch (err) {
            setError(`Microphone access failed: ${err.message}`)
        }
    }, [isListening, onScreamDetected])

    const stopListening = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { })
            audioContextRef.current = null
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop())
            streamRef.current = null
        }
        analyserRef.current = null
        screamStartRef.current = null
        setIsListening(false)
        setMicLevel(0)
    }, [])

    // Auto-start/stop based on enabled prop
    useEffect(() => {
        if (enabled && !isListening) {
            startListening()
        } else if (!enabled && isListening) {
            stopListening()
        }
    }, [enabled, isListening, startListening, stopListening])

    // Tab visibility handling
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
        return () => stopListening()
    }, [stopListening])

    return { isListening, micLevel, error, startListening, stopListening }
}
