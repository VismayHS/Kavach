/**
 * useGeolocation — Browser geolocation with graceful fallback
 * Requests permission, caches position, refreshes every 60s.
 * Falls back to {lat: 0, lng: 0} if denied or unavailable.
 */
import { useState, useEffect, useRef, useCallback } from 'react'

const REFRESH_INTERVAL_MS = 60000

export default function useGeolocation({ enabled = false }) {
    const [location, setLocation] = useState({ lat: 0, lng: 0 })
    const [locationStatus, setLocationStatus] = useState('idle') // idle | requesting | granted | denied | unavailable
    const intervalRef = useRef(null)

    const fetchPosition = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationStatus('unavailable')
            return
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                })
                setLocationStatus('granted')
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                    setLocationStatus('denied')
                } else {
                    setLocationStatus('unavailable')
                }
                // Keep fallback location
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
        )
    }, [])

    const requestPermission = useCallback(() => {
        setLocationStatus('requesting')
        fetchPosition()
    }, [fetchPosition])

    // Auto-request and refresh when enabled
    useEffect(() => {
        if (enabled) {
            requestPermission()
            intervalRef.current = setInterval(fetchPosition, REFRESH_INTERVAL_MS)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [enabled, requestPermission, fetchPosition])

    return { location, locationStatus, requestPermission }
}
