import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../cart/CartContext'
import { useState, useEffect } from 'react'
import ProductSearchBar from './ProductSearchBar'
import { api } from '../api/client'
import { NotificationInfo } from '../api/types'

export function roleHome(role?: string) {
  if (role === 'Admin') return '/admin'
  if (role === 'BusinessOwner') return '/dashboard'
  if (role === 'Customer') return '/my-account'
  return '/'
}

// Role-based access control for menus and pages:
// - Guest: Home, Directory, Plans, Contact Us (+ Login / Register)
// - BusinessOwner: Dashboard only (his registered businesses)
// - Admin: Admin dashboard only
export default function Layout() {
  const { user, logout } = useAuth()
  const { count: cartCount } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState<NotificationInfo[]>([])
  const [unread, setUnread] = useState(0)

  const refreshNotifs = async () => {
    if (!user) return
    try {
      const [{ data: list }, { data: c }] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
      ])
      setNotifs(list)
      setUnread(c.count)
    } catch {}
  }

  useEffect(() => { refreshNotifs() }, [user])

  const markAllRead = async () => {
    try { await api.put('/notifications/read-all') } catch {}
    setUnread(0)
    setNotifs((ns) => ns.map((n) => ({ ...n, isRead: true })))
  }

  const openNotif = async (n: NotificationInfo) => {
    if (!n.isRead) {
      try {
        await api.put(`/notifications/${n.id}/read`)
        setUnread((u) => Math.max(0, u - 1))
        setNotifs((ns) => ns.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)))
      } catch {}
    }
    setNotifOpen(false)
    if (n.link) navigate(n.link)
  }

  const isGuest = !user
  const isOwner = user?.role === 'BusinessOwner'
  const isAdmin = user?.role === 'Admin'
  const isCustomer = user?.role === 'Customer'
  const isBrowser = isGuest || isCustomer

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
      isActive ? 'bg-primary-600 text-white shadow-sm shadow-primary-200' : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50/80'
    }`

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const bellIcon = (
    <>
      <svg className="w-[22px] h-[22px] text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm">{unread > 9 ? '9+' : unread}</span>
      )}
    </>
  )

  const toggleBell = () => {
    const next = !notifOpen
    setNotifOpen(next)
    if (next) refreshNotifs()
  }

  const bellPanel = (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
      <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[85vw] bg-white rounded-2xl border border-gray-100 shadow-glass overflow-hidden z-50 animate-slide-down">
        <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50/60">
          <p className="font-semibold text-gray-900 text-sm">Messages</p>
          {unread > 0 && <button onClick={markAllRead} className="text-xs font-medium text-primary-600 hover:underline">Mark all read</button>}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifs.length === 0 ? (
            <p className="text-sm text-gray-500 px-4 py-10 text-center">No messages yet.</p>
          ) : (
            notifs.map((n) => (
              <button key={n.id} onClick={() => openNotif(n)} className={`w-full text-left px-4 py-3 border-b last:border-b-0 flex gap-2 hover:bg-gray-50 transition-colors ${n.isRead ? 'bg-white' : 'bg-blue-50/70'}`}>
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.isRead ? 'bg-gray-200' : 'bg-primary-500'}`} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-gray-900">{n.title}</span>
                  <span className="block text-xs text-gray-600 mt-0.5">{n.message}</span>
                  <span className="block text-[11px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/80">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50 shadow-[0_1px_3px_0_rgb(0_0_0/0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={roleHome(user?.role)} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-200/50 group-hover:shadow-lg group-hover:shadow-primary-200/60 transition-shadow">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white bg-gradient-to-br from-primary-500 to-primary-700 px-2 py-0.5 rounded-lg text-sm hidden sm:block">EBP</span>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">Enterprise Business Portal</span>
            </Link>

            {isGuest && (
              <div className="hidden md:flex flex-1 max-w-md mx-6">
                <ProductSearchBar placeholder="Search products — burger, blouse, decor…" onNavigate={() => setMenuOpen(false)} />
              </div>
            )}

            <nav className="hidden md:flex items-center gap-1">
              {isBrowser && (
                <>
                  <NavLink to="/" className={linkCls} end>Home</NavLink>
                  <NavLink to="/directory" className={linkCls}>Directory</NavLink>
                  <NavLink to="/plans" className={linkCls}>Plans</NavLink>
                  <NavLink to="/contact" className={linkCls}>Contact Us</NavLink>
                </>
              )}
              {isCustomer && <NavLink to="/my-account" className={linkCls}>Dashboard</NavLink>}
              {isOwner && <NavLink to="/dashboard" className={linkCls}>Dashboard</NavLink>}
              {isAdmin && <NavLink to="/admin" className={linkCls}>Admin Dashboard</NavLink>}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              {isBrowser && (
                <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Cart">
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.6 3m0 0L7.3 16a2 2 0 002 1.6h7.4a2 2 0 002-1.6L21 6H6M9.5 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm8 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
                  )}
                </Link>
              )}
              {user ? (
                <>
                  <span className="text-sm font-medium text-gray-500 hidden lg:block">{user.name}</span>
                  <button onClick={handleLogout} className="ml-1 px-4 py-2 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all duration-200">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-700 rounded-xl hover:bg-primary-50/80 transition-all duration-200">Login</Link>
                  <Link to="/register" className="px-5 py-2 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-sm shadow-primary-200/50 hover:shadow-md transition-all duration-200">Register</Link>
                </>
              )}

              {isCustomer && (
                <div className="relative hidden md:block">
                  <button onClick={toggleBell} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Messages">{bellIcon}</button>
                  {notifOpen && bellPanel}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 md:hidden">
              {isCustomer && (
                <div className="relative">
                  <button onClick={toggleBell} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Messages">{bellIcon}</button>
                  {notifOpen && bellPanel}
                </div>
              )}
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t bg-white px-4 pb-4 pt-2 space-y-1">
            {isGuest && (
              <div className="py-2">
                <ProductSearchBar placeholder="Search products — burger, blouse, decor…" onNavigate={() => setMenuOpen(false)} />
              </div>
            )}
            {isBrowser && (
              <>
                <Link to="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Home</Link>
                <Link to="/directory" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Directory</Link>
                <Link to="/plans" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Plans</Link>
                <Link to="/contact" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Contact Us</Link>
                <Link to="/cart" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Cart{cartCount > 0 ? ` (${cartCount})` : ''}</Link>
                {isCustomer && <Link to="/my-account" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Dashboard</Link>}
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
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-primary-700 hover:bg-primary-50">Register</Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isBrowser && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-900/40">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="font-bold text-white">Enterprise Business Portal</span>
                </div>
                <p className="text-sm text-slate-400">Discover local businesses, products and services. Connect directly with business owners.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/directory" className="text-slate-400 hover:text-white transition-colors">Browse Directory</Link></li>
                  <li><Link to="/plans" className="text-slate-400 hover:text-white transition-colors">Plans &amp; Pricing</Link></li>
                  <li><Link to="/register" className="text-slate-400 hover:text-white transition-colors">List Your Business</Link></li>
                  <li><Link to="/login" className="text-slate-400 hover:text-white transition-colors">Login</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-3">Connect</h3>
                <p className="text-sm text-slate-400 mb-4">Join our WhatsApp community for local business updates and recommendations.</p>
                <a href="https://wa.me/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white text-sm font-medium rounded-xl hover:bg-green-400 shadow-lg shadow-green-900/20 transition-all hover:-translate-y-0.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp Group
                </a>
              </div>
            </div>
          )}
          <div className={`${isBrowser ? 'mt-10 pt-8' : ''} border-t border-slate-800 text-center text-sm text-slate-500`}>
            &copy; {new Date().getFullYear()} Enterprise Business Portal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
