import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getProfile, updateProfile } from '../../services/api'
import { User, Save, Edit3, AlertCircle, CheckCircle } from 'lucide-react'

export default function Profile() {
    const { user } = useAuth()
    const [form, setForm] = useState({
        name: '',
        email: user?.email || '',
        phone: '',
        homeLocation: '',
    })
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        async function fetch() {
            try {
                const res = await getProfile()
                if (res.data?.profile) {
                    setForm((prev) => ({ ...prev, ...res.data.profile }))
                }
            } catch {
                // Profile may not exist yet — that's okay, use defaults
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSave = async () => {
        setError('')
        setSuccess('')
        if (!form.name.trim()) {
            setError('Name is required.')
            return
        }
        setSaving(true)
        try {
            await updateProfile({
                name: form.name.trim(),
                phone: form.phone.trim(),
                homeLocation: form.homeLocation.trim(),
            })
            setSuccess('Profile updated successfully.')
            setEditing(false)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save profile.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="dash-loading">Loading profile...</div>

    return (
        <div>
            <h1 className="dash-page-title">Your Profile</h1>
            <p className="dash-page-desc">Manage your personal information and safety preferences.</p>

            {error && (
                <div className="auth-error" style={{ marginBottom: 16 }}>
                    <AlertCircle size={16} /> {error}
                </div>
            )}
            {success && (
                <div className="auth-success" style={{ marginBottom: 16 }}>
                    <CheckCircle size={16} /> {success}
                </div>
            )}

            <div className="dash-card">
                <div className="dash-card__title">
                    <User size={18} /> Personal Information
                    {!editing && (
                        <button
                            className="btn btn-secondary"
                            style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: '0.78rem' }}
                            onClick={() => setEditing(true)}
                        >
                            <Edit3 size={14} /> Edit
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Full Name</label>
                        <input
                            className="form-input"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            disabled={!editing}
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Email Address</label>
                        <input
                            className="form-input"
                            value={form.email}
                            disabled
                            style={{ opacity: 0.5 }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Phone Number</label>
                        <input
                            className="form-input"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            disabled={!editing}
                            placeholder="+91XXXXXXXXXX"
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Home Location</label>
                        <input
                            className="form-input"
                            name="homeLocation"
                            value={form.homeLocation}
                            onChange={handleChange}
                            disabled={!editing}
                            placeholder="City, State"
                        />
                    </div>
                </div>

                {editing && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ fontSize: '0.85rem' }}>
                            {saving ? 'Saving...' : 'Save Changes'}
                            {!saving && <Save size={15} />}
                        </button>
                        <button className="btn btn-secondary" onClick={() => setEditing(false)} style={{ fontSize: '0.85rem' }}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
