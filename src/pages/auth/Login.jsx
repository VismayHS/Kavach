import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Shield, LogIn, AlertCircle } from 'lucide-react'
import './Auth.css'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields.')
            return
        }
        setLoading(true)
        try {
            await login(email.trim(), password)
            navigate('/dashboard', { replace: true })
        } catch (err) {
            const msg = err.message || 'Login failed. Please try again.'
            if (msg.includes('not confirmed')) {
                setError('Account not verified. Please check your email for the verification code.')
            } else if (msg.includes('Incorrect')) {
                setError('Invalid email or password.')
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

                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to access your safety dashboard.</p>

                {error && (
                    <div className="auth-error">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-email">Email Address</label>
                        <input
                            id="login-email"
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
                        <label className="form-label" htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            className="form-input"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                        {!loading && <LogIn size={16} />}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/auth/signup">Create one</Link>
                </div>
            </div>
        </div>
    )
}
