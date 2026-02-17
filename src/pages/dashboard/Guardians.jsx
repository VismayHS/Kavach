import { useState, useEffect } from 'react'
import { getGuardians, addGuardian, updateGuardian, deleteGuardian } from '../../services/api'
import { Users, Plus, Edit3, Trash2, AlertCircle, CheckCircle, X, UserPlus } from 'lucide-react'

const EMPTY_GUARDIAN = { name: '', email: '', phone: '', relationship: '' }

export default function Guardians() {
    const [guardians, setGuardians] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState({ ...EMPTY_GUARDIAN })
    const [saving, setSaving] = useState(false)

    const fetchGuardians = async () => {
        try {
            const res = await getGuardians()
            setGuardians(res.data?.guardians || [])
        } catch {
            setError('Failed to load guardians.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchGuardians() }, [])

    const openAdd = () => {
        if (guardians.length >= 3) {
            setError('Maximum 3 guardians allowed.')
            return
        }
        setForm({ ...EMPTY_GUARDIAN })
        setEditingId(null)
        setModalOpen(true)
        setError('')
    }

    const openEdit = (g) => {
        setForm({ name: g.name, email: g.email, phone: g.phone, relationship: g.relationship })
        setEditingId(g._id || g.id)
        setModalOpen(true)
        setError('')
    }

    const handleDelete = async (id) => {
        if (!confirm('Remove this guardian?')) return
        try {
            await deleteGuardian(id)
            setGuardians((prev) => prev.filter((g) => (g._id || g.id) !== id))
            setSuccess('Guardian removed.')
            setTimeout(() => setSuccess(''), 3000)
        } catch {
            setError('Failed to delete guardian.')
        }
    }

    const handleSave = async () => {
        setError('')
        if (!form.name.trim() || !form.email.trim()) {
            setError('Name and email are required.')
            return
        }
        setSaving(true)
        try {
            if (editingId) {
                await updateGuardian(editingId, form)
            } else {
                await addGuardian(form)
            }
            setModalOpen(false)
            setSuccess(editingId ? 'Guardian updated.' : 'Guardian added.')
            setTimeout(() => setSuccess(''), 3000)
            await fetchGuardians()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save guardian.')
        } finally {
            setSaving(false)
        }
    }

    const handleFormChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    if (loading) return <div className="dash-loading">Loading guardians...</div>

    return (
        <div>
            <h1 className="dash-page-title">Emergency Guardians</h1>
            <p className="dash-page-desc">
                Add up to 3 trusted contacts who will be notified during a distress alert.
            </p>

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

            <div style={{ marginBottom: 20 }}>
                <button className="btn btn-primary" onClick={openAdd} style={{ fontSize: '0.85rem' }} disabled={guardians.length >= 3}>
                    <Plus size={16} /> Add Guardian ({guardians.length}/3)
                </button>
            </div>

            {guardians.length === 0 ? (
                <div className="dash-empty">
                    <div className="dash-empty__icon"><Users size={40} /></div>
                    <p className="dash-empty__text">No guardians added yet.<br />Add your first trusted contact above.</p>
                </div>
            ) : (
                <div className="guardian-grid">
                    {guardians.map((g) => (
                        <div key={g._id || g.id} className="guardian-card">
                            <div className="guardian-card__name">{g.name}</div>
                            <div className="guardian-card__detail">{g.email}</div>
                            {g.phone && <div className="guardian-card__detail">{g.phone}</div>}
                            {g.relationship && (
                                <div className="guardian-card__detail" style={{ color: 'var(--accent-indigo)', fontWeight: 500 }}>
                                    {g.relationship}
                                </div>
                            )}
                            <div className="guardian-card__actions">
                                <button className="btn btn-secondary guardian-card__btn" onClick={() => openEdit(g)}>
                                    <Edit3 size={12} /> Edit
                                </button>
                                <button
                                    className="btn btn-secondary guardian-card__btn"
                                    style={{ color: 'var(--accent-rose)' }}
                                    onClick={() => handleDelete(g._id || g.id)}
                                >
                                    <Trash2 size={12} /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit Modal */}
            {modalOpen && (
                <div className="dash-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 className="dash-modal__title" style={{ marginBottom: 0 }}>
                                <UserPlus size={18} /> {editingId ? 'Edit Guardian' : 'Add Guardian'}
                            </h3>
                            <button className="btn btn-secondary" style={{ padding: 6 }} onClick={() => setModalOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        {error && (
                            <div className="auth-error" style={{ marginBottom: 12 }}>
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Full Name *</label>
                            <input className="form-input" name="name" value={form.name} onChange={handleFormChange} placeholder="Guardian's name" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address *</label>
                            <input className="form-input" name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="guardian@email.com" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input className="form-input" name="phone" type="tel" value={form.phone} onChange={handleFormChange} placeholder="+91XXXXXXXXXX" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Relationship</label>
                            <input className="form-input" name="relationship" value={form.relationship} onChange={handleFormChange} placeholder="e.g. Parent, Friend, Sibling" />
                        </div>

                        <div className="dash-modal__actions">
                            <button className="btn btn-secondary" onClick={() => setModalOpen(false)} style={{ fontSize: '0.85rem' }}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ fontSize: '0.85rem' }}>
                                {saving ? 'Saving...' : (editingId ? 'Update' : 'Add Guardian')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
