import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Shield, UserPlus, AlertCircle } from 'lucide-react'
import './Auth.css'

export default function Signup() {
    const { signup } = useAuth()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!name.trim() || !email.trim() || !password) {
            setError('Please fill in all required fields.')
            return
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }

        setLoading(true)
        try {
            await signup(email.trim(), password, name.trim(), phone.trim() || null)
            navigate('/auth/verify', { state: { email: email.trim() } })
        } catch (err) {
            const msg = err.message || 'Signup failed.'
            if (msg.includes('exists')) {
                setError('An account with this email already exists.')
            } else if (msg.includes('password') || msg.includes('Password')) {
                setError('Password must include uppercase, lowercase, number, and special character.')
            } else {
                setError(msg)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <Link to="/" className="auth-brand">
                    <Shield size={20} className="auth-brand-icon" />
                    <span className="auth-brand-text">RAKSHAK</span>
                </Link>

                <h1 className="auth-title">Create Your Account</h1>
                <p className="auth-subtitle">Join RAKSHAK to set up your safety network.</p>

                {error && (
                    <div className="auth-error">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-name">Full Name *</label>
                        <input
                            id="signup-name"
                            className="form-input"
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-email">Email Address *</label>
                        <input
                            id="signup-email"
                            className="form-input"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-phone">Phone Number (optional)</label>
                        <input
                            id="signup-phone"
                            className="form-input"
                            type="tel"
                            placeholder="+91XXXXXXXXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-password">Password *</label>
                        <input
                            id="signup-password"
                            className="form-input"
                            type="password"
                            placeholder="Min. 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="signup-confirm">Confirm Password *</label>
                        <input
                            id="signup-confirm"
                            className="form-input"
                            type="password"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                        {!loading && <UserPlus size={16} />}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/auth/login">Sign in</Link>
                </div>
            </div>
        </div>
    )
}
