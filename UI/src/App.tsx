import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { roleHome } from './components/Layout'
import Layout from './components/Layout'
import Home from './pages/Home'
import Directory from './pages/Directory'
import BusinessDetailPage from './pages/BusinessDetail'
import Plans from './pages/Plans'
import Login from './pages/Login'
import Register from './pages/Register'
import OwnerDashboard from './pages/OwnerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ContactUs from './pages/ContactUs'
import ProductSearch from './pages/ProductSearch'
import ProductDetailPage from './pages/ProductDetail'

function Protected({ role, children }: { role: string; children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={roleHome(user.role)} replace />
  return <>{children}</>
}

// Public content pages are for guests only - signed-in users are sent
// straight to their own workspace (owner dashboard / admin dashboard).
function PublicPage({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user?.role === 'Admin') return <Navigate to="/admin" replace />
  if (user?.role === 'BusinessOwner') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

// Business pages: guests browse freely, owners may open their own listing
// (ownership is enforced inside the page), admins stay in the admin area.
function BusinessPage({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user?.role === 'Admin') return <Navigate to="/admin" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<PublicPage><Home /></PublicPage>} />
            <Route path="/directory" element={<PublicPage><Directory /></PublicPage>} />
            {/* Short, WhatsApp-friendly deep link: /b/{slug} */}
            <Route path="/b/:slug" element={<BusinessPage><BusinessDetailPage /></BusinessPage>} />
            {/* Legacy numeric route kept working */}
            <Route path="/business/:id" element={<BusinessPage><BusinessDetailPage /></BusinessPage>} />
            <Route path="/plans" element={<PublicPage><Plans /></PublicPage>} />
            <Route path="/contact" element={<PublicPage><ContactUs /></PublicPage>} />
            {/* Product search results and product details (guest experience) */}
            <Route path="/search" element={<PublicPage><ProductSearch /></PublicPage>} />
            <Route path="/products/:id" element={<PublicPage><ProductDetailPage /></PublicPage>} />
            <Route path="/login" element={<PublicPage><Login /></PublicPage>} />
            <Route path="/register" element={<PublicPage><Register /></PublicPage>} />
            <Route path="/dashboard" element={<Protected role="BusinessOwner"><OwnerDashboard /></Protected>} />
            <Route path="/admin" element={<Protected role="Admin"><AdminDashboard /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
