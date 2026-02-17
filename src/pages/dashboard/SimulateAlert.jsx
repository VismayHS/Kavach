import { useState } from 'react'
import { simulateAlert } from '../../services/api'
import { AlertTriangle, CheckCircle, AlertCircle, Shield } from 'lucide-react'

export default function SimulateAlert() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')

    const handleSimulate = async () => {
        setError('')
        setResult(null)
        setLoading(true)

        // Generate mock GPS coords (Bangalore area)
        const mockLocation = {
            lat: 12.9716 + (Math.random() - 0.5) * 0.1,
            lng: 77.5946 + (Math.random() - 0.5) * 0.1,
        }

        try {
            const res = await simulateAlert({
                location: mockLocation,
                detectionType: 'voice_distress',
                confidence: 0.92,
            })

            setResult({
                alertId: res.data?.alertId || 'N/A',
                timestamp: res.data?.timestamp || new Date().toISOString(),
                deliveryMethod: res.data?.deliveryMethod || 'email',
                status: res.data?.status || 'delivered',
                location: `${mockLocation.lat.toFixed(4)}, ${mockLocation.lng.toFixed(4)}`,
                guardiansNotified: res.data?.guardiansNotified || 0,
            })
        } catch (err) {
            setError(err.response?.data?.message || 'Alert simulation failed. Is the backend configured?')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className="dash-page-title">Simulate Silent Alert</h1>
            <p className="dash-page-desc">
                Test the full alert pipeline — triggers distress detection, creates a record in MongoDB,
                and sends an email notification to your guardians via AWS SES.
            </p>

            {error && (
                <div className="auth-error" style={{ marginBottom: 16 }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <div className="dash-card simulate-card">
                <div style={{ marginBottom: 20 }}>
                    <Shield size={48} style={{ color: 'var(--accent-blue)', opacity: 0.3 }} />
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24, maxWidth: 400, marginInline: 'auto' }}>
                    This simulates a real distress detection event. A record will be created in the database
                    and guardians will be notified via email.
                </p>

                <button
                    className="btn btn-primary simulate-btn"
                    onClick={handleSimulate}
                    disabled={loading}
                >
                    {loading ? (
                        <>Simulating...</>
                    ) : (
                        <><AlertTriangle size={20} /> Trigger Silent Alert</>
                    )}
                </button>

                {result && (
                    <div className="simulate-result">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <CheckCircle size={18} style={{ color: 'var(--accent-emerald)' }} />
                            <strong style={{ color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>
                                Silent alert triggered successfully
                            </strong>
                        </div>
                        <div className="simulate-result__item">
                            <span className="simulate-result__label">Alert ID</span>
                            <span className="simulate-result__value" style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{result.alertId}</span>
                        </div>
                        <div className="simulate-result__item">
                            <span className="simulate-result__label">Timestamp</span>
                            <span className="simulate-result__value">{new Date(result.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="simulate-result__item">
                            <span className="simulate-result__label">Location</span>
                            <span className="simulate-result__value">{result.location}</span>
                        </div>
                        <div className="simulate-result__item">
                            <span className="simulate-result__label">Delivery Method</span>
                            <span className="simulate-result__value" style={{ textTransform: 'capitalize' }}>{result.deliveryMethod}</span>
                        </div>
                        <div className="simulate-result__item">
                            <span className="simulate-result__label">Status</span>
                            <span className={`dash-badge dash-badge--${result.status === 'delivered' ? 'success' : 'pending'}`}>
                                {result.status.toUpperCase()}
                            </span>
                        </div>
                        <div className="simulate-result__item">
                            <span className="simulate-result__label">Guardians Notified</span>
                            <span className="simulate-result__value">{result.guardiansNotified}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
