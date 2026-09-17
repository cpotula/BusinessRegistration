import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useState } from 'react'

export function roleHome(role?: string) {
  if (role === 'Admin') return '/admin'
  if (role === 'BusinessOwner') return '/dashboard'
  return '/'
}

// Role-based access control for menus and pages:
// - Guest: Home, Directory, Plans, Contact Us (+ Login / Register)
// - BusinessOwner: Dashboard only (his registered businesses)
// - Admin: Admin dashboard only
export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const isGuest = !user
  const isOwner = user?.role === 'BusinessOwner'
  const isAdmin = user?.role === 'Admin'

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive ? 'bg-primary-700 text-white' : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50'
    }`

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={roleHome(user?.role)} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white bg-gradient-to-br from-primary-500 to-primary-700 px-2 py-0.5 rounded-lg text-sm hidden sm:block">EBP</span>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">Enterprise Business Portal</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {isGuest && (
                <>
                  <NavLink to="/" className={linkCls} end>Home</NavLink>
                  <NavLink to="/directory" className={linkCls}>Directory</NavLink>
                  <NavLink to="/plans" className={linkCls}>Plans</NavLink>
                  <NavLink to="/contact" className={linkCls}>Contact Us</NavLink>
                </>
              )}
              {isOwner && <NavLink to="/dashboard" className={linkCls}>Dashboard</NavLink>}
              {isAdmin && <NavLink to="/admin" className={linkCls}>Admin Dashboard</NavLink>}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <span className="text-sm text-gray-500">{user.name}</span>
                  <button onClick={handleLogout} className="ml-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-700 transition-colors">Login</Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">Register Business</Link>
                </>
              )}
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t bg-white px-4 pb-4 pt-2 space-y-1">
            {isGuest && (
              <>
                <Link to="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Home</Link>
                <Link to="/directory" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Directory</Link>
                <Link to="/plans" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Plans</Link>
                <Link to="/contact" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Contact Us</Link>
              </>
            )}
            {isOwner && <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Dashboard</Link>}
            {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Admin Dashboard</Link>}
            <hr className="my-2" />
            {user ? (
              <>
                <span className="block px-3 py-1 text-sm text-gray-400">{user.name}</span>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-primary-700 hover:bg-primary-50">Register Business</Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {isGuest && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="font-bold text-gray-900">Enterprise Business Portal</span>
                </div>
                <p className="text-sm text-gray-500">Discover local businesses, products and services. Connect directly with business owners.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/directory" className="text-gray-500 hover:text-primary-600">Browse Directory</Link></li>
                  <li><Link to="/plans" className="text-gray-500 hover:text-primary-600">Plans &amp; Pricing</Link></li>
                  <li><Link to="/register" className="text-gray-500 hover:text-primary-600">List Your Business</Link></li>
                  <li><Link to="/login" className="text-gray-500 hover:text-primary-600">Login</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Connect</h3>
                <p className="text-sm text-gray-500 mb-3">Join our WhatsApp community for local business updates and recommendations.</p>
                <a href="https://wa.me/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp Group
                </a>
              </div>
            </div>
          )}
          {isGuest && (
            <div className="mt-8 pt-6 border-t text-center text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Enterprise Business Portal. All rights reserved.
            </div>
          )}
          {!isGuest && (
            <div className="text-center text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Enterprise Business Portal. All rights reserved.
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}
