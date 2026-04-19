import { Outlet } from 'react-router-dom'
import Navbar from './NavBar'

export default function Layout() { //This is a dynamic wrapper based on routes which includes the NavBar. 
    return (                         //For example, if path is /products, the products page gets injected in place of Outlet. This reduces repetition, opposing having to include NavBar in every page that uses it.
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    )
}