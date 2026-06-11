import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { login, getMe } from '@/api/authApi'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setLoading(true)
        setError('')
        try {
            if (!email || !password) {
                setError('Please enter your email and password')
                return
            }
            const token = await login({ email, password })
            localStorage.setItem('token', token)
            const user = await getMe()
            setAuth(user, token)
            navigate('/')
        } catch (err: any) {
            const detail = err.response?.data?.detail
            setError(typeof detail === 'string' ? detail : 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleLogin()
    }

    return (
        <div className="auth-page">
            <div className="auth-panel">
                {/* Brand */}
                <div className="auth-brand">
                    <p className="hero-eyebrow">Welcome back</p>
                    <h1 className="auth-title">Sign In</h1>
                    <p className="auth-subtitle">Enter your credentials to continue</p>
                </div>

                {/* Form */}
                <div className="auth-form">
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
                                autoComplete="current-password"
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
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </div>

                <p className="auth-switch">
                    Don't have an account?{' '}
                    <Link to="/register" className="auth-link">Create one</Link>
                </p>
            </div>


        </div>
    )
}