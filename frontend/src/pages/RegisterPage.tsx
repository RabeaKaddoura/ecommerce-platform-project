import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '@/api/authApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleRegister = async () => {
        setLoading(true)
        setError('')
        try {
            if (!email || !password || !name) {
                setError('You must enter all fields')
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Register</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <Label>Name</Label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>
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
                    <Button onClick={handleRegister} disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className="underline">Login</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}