import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, LogOut, User, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuthStore() //Loads user info from global store
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <nav className="border-b bg-background sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="text-xl font-bold tracking-tight">
                    ShopHub
                </Link>

                {/* Middle links */}
                <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                    <Link to="/products" className="hover:text-foreground transition-colors">
                        Products
                    </Link>
                    <Link to="/orders" className="hover:text-foreground transition-colors">
                        Orders
                    </Link>
                    {user?.isAdmin && ( //Admin panel
                        <Link to="/admin/products" className="hover:text-foreground transition-colors flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            Admin
                        </Link>
                    )}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {isAuthenticated ? ( //If user is authenticated they will be routed to cart.
                        <>
                            <span className="hidden md:block text-sm text-muted-foreground">
                                Hi, {user?.name}
                            </span>
                            <Button variant="ghost" size="icon" asChild>
                                <Link to="/cart">
                                    <ShoppingCart className="w-5 h-5" />
                                </Link>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleLogout}>
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </>
                    ) : ( //Otherwise, they will be routed to the login page.
                        <>
                            <Button variant="ghost" asChild>
                                <Link to="/login">Login</Link>
                            </Button>
                            <Button asChild>
                                <Link to="/register">Register</Link>
                            </Button>
                        </>
                    )}
                </div>

            </div>
        </nav>
    )
}