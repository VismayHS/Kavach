import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Shield, CheckCircle, AlertCircle } from 'lucide-react'
import './Auth.css'

export default function Verify() {
    const { verify } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const emailFromState = location.state?.email || ''

    const [email, setEmail] = useState(emailFromState)
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!email.trim() || !code.trim()) {
            setError('Please enter your email and verification code.')
            return
        }

        setLoading(true)
        try {
            await verify(email.trim(), code.trim())
            setSuccess(true)
            setTimeout(() => navigate('/auth/login'), 2000)
        } catch (err) {
            const msg = err.message || 'Verification failed.'
            if (msg.includes('expired')) {
                setError('Verification code has expired. Please request a new one.')
            } else if (msg.includes('mismatch') || msg.includes('Invalid')) {
                setError('Invalid verification code. Please check and try again.')
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

                <h1 className="auth-title">Verify Your Account</h1>
                <p className="auth-subtitle">
                    We've sent a verification code to your email. Enter it below to activate your account.
                </p>

                {success && (
                    <div className="auth-success">
                        <CheckCircle size={16} />
                        Account verified! Redirecting to login...
                    </div>
                )}

                {error && (
                    <div className="auth-error">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {!success && (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label" htmlFor="verify-email">Email Address</label>
                            <input
                                id="verify-email"
                                className="form-input"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="verify-code">Verification Code</label>
                            <input
                                id="verify-code"
                                className="form-input"
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                autoComplete="one-time-code"
                                maxLength={6}
                                style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Account'}
                            {!loading && <CheckCircle size={16} />}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <Link to="/auth/login">Back to Login</Link>
                </div>
            </div>
        </div>
    )
}
