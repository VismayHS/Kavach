import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Shield, Users, AlertTriangle, ArrowRight } from 'lucide-react'
import { getGuardians, getAlertHistory } from '../../services/api'

export default function Overview() {
    const { user } = useAuth()
    const [guardianCount, setGuardianCount] = useState(0)
    const [alertCount, setAlertCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const [gRes, aRes] = await Promise.allSettled([
                    getGuardians(),
                    getAlertHistory(),
                ])
                if (gRes.status === 'fulfilled') setGuardianCount(gRes.value.data?.guardians?.length || 0)
                if (aRes.status === 'fulfilled') setAlertCount(aRes.value.data?.alerts?.length || 0)
            } catch {
                // Silently handle — stats will show 0
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    return (
        <div>
            <h1 className="dash-page-title">Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}</h1>
            <p className="dash-page-desc">Your RAKSHAK safety dashboard — manage guardians, monitor alerts, and test the system.</p>

            <div className="dash-stats">
                <div className="dash-stat">
                    <div className="dash-stat__value">{loading ? '—' : guardianCount}</div>
                    <div className="dash-stat__label">Guardians configured</div>
                </div>
                <div className="dash-stat">
                    <div className="dash-stat__value">{loading ? '—' : alertCount}</div>
                    <div className="dash-stat__label">Total alerts</div>
                </div>
                <div className="dash-stat">
                    <div className="dash-stat__value" style={{ color: 'var(--accent-emerald)' }}>Active</div>
                    <div className="dash-stat__label">System status</div>
                </div>
            </div>

            <div className="dash-card">
                <div className="dash-card__title">
                    <Shield size={18} /> Quick Actions
                </div>
                <div className="dash-actions">
                    <Link to="/dashboard/guardians" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                        <Users size={15} /> Manage Guardians <ArrowRight size={14} />
                    </Link>
                    <Link to="/dashboard/simulate" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                        <AlertTriangle size={15} /> Simulate Alert <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            <div className="dash-card">
                <div className="dash-card__title">
                    <Shield size={18} /> Privacy Reminder
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    AI-based distress detection runs <strong>entirely on your Android device</strong>.
                    This dashboard handles alert management, guardian contacts, and monitoring only.
                    No continuous audio or video is stored or uploaded.
                </p>
            </div>
        </div>
    )
}
