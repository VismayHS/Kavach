import { useState, useEffect } from 'react'
import { getAlertHistory } from '../../services/api'
import { History, AlertCircle, Inbox } from 'lucide-react'

export default function AlertHistory() {
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetch() {
            try {
                const res = await getAlertHistory()
                setAlerts(res.data?.alerts || [])
            } catch {
                setError('Failed to load alert history. Is the backend configured?')
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    if (loading) return <div className="dash-loading">Loading alert history...</div>

    return (
        <div>
            <h1 className="dash-page-title">Alert History</h1>
            <p className="dash-page-desc">
                View all past distress alerts — timestamps, locations, delivery methods, and statuses from MongoDB Atlas.
            </p>

            {error && (
                <div className="auth-error" style={{ marginBottom: 16 }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {alerts.length === 0 ? (
                <div className="dash-empty">
                    <div className="dash-empty__icon"><Inbox size={48} /></div>
                    <p className="dash-empty__text">
                        No alerts recorded yet.<br />
                        Use the <strong>Simulate Alert</strong> feature to generate a test alert.
                    </p>
                </div>
            ) : (
                <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Location</th>
                                <th>Detection</th>
                                <th>Delivery</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map((alert, i) => (
                                <tr key={alert._id || i}>
                                    <td>{new Date(alert.timestamp).toLocaleString()}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                        {alert.location?.lat?.toFixed(4)}, {alert.location?.lng?.toFixed(4)}
                                    </td>
                                    <td style={{ textTransform: 'capitalize' }}>
                                        {(alert.detectionType || 'unknown').replace(/_/g, ' ')}
                                    </td>
                                    <td style={{ textTransform: 'capitalize' }}>
                                        {alert.deliveryMethod || 'email'}
                                    </td>
                                    <td>
                                        <span className={`dash-badge dash-badge--${alert.status === 'delivered' ? 'success' :
                                                alert.status === 'failed' ? 'error' : 'pending'
                                            }`}>
                                            {(alert.status || 'unknown').toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
