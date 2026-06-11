import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '@/api/authApi'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleRegister = async () => {
        setLoading(true)
        setError('')
        try {
            if (!name || !email || !password) {
                setError('Please fill in all fields')
                return
            }
            await register({ name, email, password })
            navigate('/login')
        } catch (err: any) {
            const detail = err.response?.data?.detail
            setError(typeof detail === 'string' ? detail : 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleRegister()
    }

    return (
        <div className="auth-page">
            <div className="auth-panel">
                {/* Brand */}
                <div className="auth-brand">
                    <p className="hero-eyebrow">Get started</p>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join us and start shopping</p>
                </div>

                {/* Form */}
                <div className="auth-form">
                    <div className="auth-field">
                        <label className="auth-label">Full Name</label>
                        <input
                            className="auth-input"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoComplete="name"
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Email</label>
                        <input
                            className="auth-input"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Password</label>
                        <div className="auth-input-wrap">
                            <input
                                className="auth-input"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoComplete="new-password"
                            />
                            <button
                                className="auth-eye"
                                type="button"
                                onClick={() => setShowPassword(s => !s)}
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button
                        className="btn-primary btn-full auth-submit"
                        onClick={handleRegister}
                        disabled={loading}
                    >
                        {loading ? 'Creating account…' : 'Create Account'}
                    </button>
                </div>

                <p className="auth-switch">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Sign in</Link>
                </p>
            </div>


        </div>
    )
}