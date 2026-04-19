import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { login, getMe } from '@/api/authApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setLoading(true)
        setError('')
        try {
            if (!email || !password) {
                setError('You must enter all fields')
                return
            }
            const token = await login({ email, password })
            localStorage.setItem('token', token) //set before getMe so interceptor picks it up
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Login</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button onClick={handleLogin} disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/register" className="underline">Register</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}