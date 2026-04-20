import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getMe } from '@/api/authApi'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import Layout from '@/components/shared/Layout'
import ProductsPage from '@/pages/ProductsPage'

//Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

//Admin route wrapper
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user?.isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

function App() {
  const { token, setAuth, logout } = useAuthStore()

  //On app load, if token exists fetch the user object
  useEffect(() => {
    if (token) {
      getMe()
        .then((user) => setAuth(user, token))
        .catch(() => logout()) //removes user state from global store
    }
  }, [])


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* All pages with navbar go inside this layout route */}
        <Route element={<Layout />}>
          <Route path="/" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><div>Cart coming soon</div></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App