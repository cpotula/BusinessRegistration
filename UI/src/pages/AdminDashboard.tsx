import { useEffect, useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import DashboardShell, { NavGroup, StatCard, ShellIcon, IconName } from '../components/DashboardShell'
import {
  AdminDashboard as StatsType, Announcement, Category, Enquiry,
  AdminBusinessListItem, AdminProductListItem, ExpiringBusiness, PendingPayment,
} from '../api/types'

type Tab = 'overview' | 'users' | 'businesses' | 'products' | 'categories' | 'subscriptions' | 'moderation' | 'announcements' | 'enquiries'

const btn = 'inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50'
const btnAmber = 'inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50'
const input = 'border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all'
const th = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400'
const actionLink = 'inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700'
const okBtn = 'inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700'
const dangerBtn = 'inline-flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600'
const ghostBtn = 'inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700'
const greens = 'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100'
const ambers = 'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100'
const grays = 'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200'
const reds = 'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-100'

/* ---------------- Overview: what needs my attention today? ---------------- */

function Overview({ onReview, onReviewProducts }: { onReview?: () => void; onReviewProducts?: () => void }) {
  const [stats, setStats] = useState<StatsType | null>(null)
  const [expiring, setExpiring] = useState<ExpiringBusiness[]>([])
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [runningCheck, setRunningCheck] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/expiring?days=30'),
      api.get('/admin/pending-payments'),
    ]).then(([d, e, p]) => { setStats(d.data); setExpiring(e.data); setPendingPayments(p.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const runExpiryCheck = async () => {
    setRunningCheck(true)
    try { await api.post('/admin/process-expirations'); load() }
    finally { setRunningCheck(false) }
  }

  const markPaid = async (id: number) => {
    await api.post(`/subscriptions/${id}/payment`, { paymentMethod: 'Manual', notes: 'Confirmed by admin' })
    load()
  }

  if (loading) return <p className="text-sm text-gray-500">Loading stats...</p>
  if (!stats) return <p className="text-sm text-red-500">Failed to load dashboard stats.</p>

  const cards: { label: string; value: string; icon: IconName; tint?: 'green' | 'red' | 'amber' }[] = [
    { label: 'Users', value: String(stats.totalUsers), icon: 'user' },
    { label: 'Businesses', value: String(stats.totalBusinesses), icon: 'store' },
    { label: 'Active Listings', value: String(stats.activeBusinesses), icon: 'check', tint: 'green' },
    { label: 'Pending Approvals', value: String(stats.pendingBusinesses), icon: 'alert', tint: stats.pendingBusinesses > 0 ? 'amber' : undefined },
    { label: 'Pending Products', value: String(stats.pendingProducts), icon: 'package', tint: stats.pendingProducts > 0 ? 'amber' : undefined },
    { label: 'Active Subs', value: String(stats.activeSubscriptions), icon: 'card' },
    { label: 'Expiring ≤30 days', value: String(stats.expiringSoon), icon: 'clock', tint: stats.expiringSoon > 0 ? 'red' : undefined },
    { label: 'Expired Listings', value: String(stats.expiredListings), icon: 'alert', tint: stats.expiredListings > 0 ? 'red' : undefined },
    { label: 'Pending Reviews', value: String(stats.pendingTestimonials), icon: 'star', tint: stats.pendingTestimonials > 0 ? 'amber' : undefined },
    { label: 'Unread Enquiries', value: String(stats.unreadEnquiries), icon: 'chat', tint: stats.unreadEnquiries > 0 ? 'amber' : undefined },
    { label: 'Revenue (30d)', value: `₹${stats.monthlyRevenue.toLocaleString()}`, icon: 'coins' },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {cards.map(c => (
          <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} tint={c.tint} />
        ))}
      </div>

      {/* Needs attention */}
      <h3 className="font-semibold text-gray-900 mb-3">Needs your attention</h3>

      {stats.pendingBusinesses > 0 && (
        <div className="card overflow-hidden mb-4">
          <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <ShellIcon name="alert" className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{stats.pendingBusinesses} new business{stats.pendingBusinesses === 1 ? '' : 'es'} pending approval</p>
                <p className="text-xs text-gray-500 mt-0.5">Newly registered businesses stay hidden from the website until you approve them.</p>
              </div>
            </div>
            {onReview && <button onClick={onReview} className={btnAmber}>Review &amp; Approve</button>}
          </div>
        </div>
      )}

      {stats.pendingProducts > 0 && (
        <div className="card overflow-hidden mb-4">
          <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <ShellIcon name="package" className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{stats.pendingProducts} product{stats.pendingProducts === 1 ? '' : 's'} pending approval</p>
                <p className="text-xs text-gray-500 mt-0.5">New products stay hidden from the website until you approve them.</p>
              </div>
            </div>
            {onReviewProducts && <button onClick={onReviewProducts} className={btnAmber}>Review &amp; Approve</button>}
          </div>
        </div>
      )}

      {pendingPayments.length > 0 && (
        <div className="card overflow-hidden mb-4">
          <p className="px-5 py-3 bg-amber-50/60 border-b border-amber-100 text-amber-800 text-sm font-semibold flex items-center gap-2">
            <ShellIcon name="coins" className="w-4 h-4" />{pendingPayments.length} renewal request{pendingPayments.length > 1 ? 's' : ''} awaiting payment confirmation
          </p>
          <div className="divide-y divide-gray-100">
            {pendingPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3 flex-wrap gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.businessName} — {p.planName} (₹{p.amount.toLocaleString()})</p>
                  <p className="text-xs text-gray-400">{p.ownerEmail} · valid till {new Date(p.endDate).toLocaleDateString()}</p>
                </div>
                <button onClick={() => markPaid(p.id)} className={btn}>Mark Paid &amp; Activate</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {expiring.length > 0 && (
        <div className="card overflow-hidden mb-4">
          <p className="px-5 py-3 bg-orange-50/70 border-b border-orange-100 text-orange-700 text-sm font-semibold flex items-center gap-2">
            <ShellIcon name="clock" className="w-4 h-4" />Expiring within 30 days
          </p>
          <div className="divide-y divide-gray-100">
            {expiring.map(e => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3 flex-wrap gap-2">
                <div>
                  <span className="text-sm font-medium text-gray-900">{e.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{e.categoryName}{e.city ? ` · ${e.city}` : ''} · {e.ownerEmail}</span>
                </div>
                <span className={e.daysLeft <= 7 ? reds : ambers}>
                  {e.daysLeft} day{e.daysLeft === 1 ? '' : 's'} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingPayments.length === 0 && expiring.length === 0 && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-2xl px-5 py-4 mb-4 flex items-center gap-2">
          <ShellIcon name="check" className="w-4 h-4" /> Nothing urgent — subscriptions and payments are healthy.
        </p>
      )}

      <button onClick={runExpiryCheck} disabled={runningCheck} className={btn}>
        {runningCheck ? 'Running...' : 'Run Subscription Expiry Check Now'}
      </button>
      <p className="text-xs text-gray-400 mt-2">Expired subscriptions are also disabled automatically every hour.</p>
    </div>
  )
}

/* ---------------- Users ---------------- */

interface UserRow { id: number; name: string; email: string; phone: string | null; role: string; isActive: boolean }

function UsersSec() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = () => { setLoading(true); api.get('/admin/users').then(r => setUsers(r.data)).finally(() => setLoading(false)) }
  useEffect(() => { fetchUsers() }, [])

  const toggleActive = async (u: UserRow) => {
    await api.put(`/admin/users/${u.id}/active`, { isActive: !u.isActive })
    fetchUsers()
  }

  const changeRole = async (id: number, role: string) => {
    await api.put(`/admin/users/${id}/role`, { role })
    fetchUsers()
  }

  if (loading) return <p className="text-sm text-gray-500">Loading users...</p>

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 p-2">
      <table className="w-full text-sm text-left">
        <thead className="text-gray-400 border-b border-gray-100"><tr><th className={th}>Name</th><th className={th}>Email</th><th className={th}>Role</th><th className={th}>Status</th><th className={th}>Actions</th></tr></thead>
        <tbody className="divide-y divide-gray-100">
          {users.map(u => (
            <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
              <td className="px-4 py-3 text-gray-500">{u.email}</td>
              <td className="px-4 py-3">
                <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} className={`${input} py-1`}>
                  <option value="BusinessOwner">Business Owner</option>
                  <option value="Admin">Admin</option>
                  <option value="Guest">Guest</option>
                </select>
              </td>
              <td className="px-4 py-3">
                <span className={u.isActive ? greens : reds}>
                  <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`} />{u.isActive ? 'Active' : 'Disabled'}
                </span>
              </td>
              <td className="px-4 py-3"><button onClick={() => toggleActive(u)} className={actionLink}>{u.isActive ? 'Disable' : 'Enable'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------------- Businesses ---------------- */

function BizSec() {
  const [businesses, setBusinesses] = useState<AdminBusinessListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const flash = (type: 'ok' | 'err', msg: string) => {
    setNotice({ type, msg })
    setTimeout(() => setNotice(null), 5000)
  }

  const errMsg = (e: unknown) => {
    const err = e as { response?: { status?: number; data?: { message?: string } }; request?: unknown }
    const status = err.response?.status
    const serverMessage = err.response?.data?.message
    if (serverMessage) return serverMessage
    if (status === 401) return 'Your login has expired. Log out, then log back in as admin (admin@businessportal.local) and try again.'
    if (status === 403) return 'Only an admin can approve. Log in with the admin account (admin@businessportal.local), then try again.'
    if (status === 404) return 'This business is no longer pending — it was already approved (or removed). The list has been refreshed.'
    if (!err.response && err.request) return 'Cannot reach the server. Make sure the app is running (localhost:5100 and localhost:5173), then try again.'
    return `The action failed on the server (error ${status ?? 'unknown'}). Refresh the page and try again.`
  }

  const fetchBiz = () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (status) p.set('status', status)
    if (q) p.set('q', q)
    api.get(`/admin/businesses?${p}`).then(r => setBusinesses(r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { fetchBiz() }, [status])
  useEffect(() => {
    const t = setTimeout(fetchBiz, 300)
    return () => clearTimeout(t)
  }, [q])

  const toggleStatus = async (b: AdminBusinessListItem) => {
    // Activating requires a confirmed (paid) subscription, so a business can
    // never go live before the admin has recorded the subscription payment.
    if (!b.isActive && b.subscriptionPaymentStatus !== 'Paid') {
      flash('err', `Cannot activate "${b.name}" — its subscription has not been paid yet. Record the payment under Subscriptions, then activate.`)
      return
    }
    // API expects a raw JSON boolean here
    try {
      await api.put(`/admin/businesses/${b.id}/status`, b.isActive ? false : true, { headers: { 'Content-Type': 'application/json' } })
      fetchBiz()
      flash('ok', b.isActive ? `"${b.name}" deactivated (hidden from website).` : `"${b.name}" activated.`)
    } catch (e) { flash('err', errMsg(e)) }
  }

  const approve = async (b: AdminBusinessListItem) => {
    // Approve = activate + publish so it appears on the public website.
    // Blocked server-side too unless the subscription payment was recorded.
    if (b.subscriptionPaymentStatus !== 'Paid') {
      flash('err', `Cannot approve "${b.name}" yet — the subscription payment has not been confirmed. Record it under Subscriptions, then approve.`)
      return
    }
    try {
      await api.put(`/admin/businesses/${b.id}/approve`, true, { headers: { 'Content-Type': 'application/json' } })
      fetchBiz()
      flash('ok', `Approved "${b.name}" — it is now shown on the website.`)
    } catch (e) { flash('err', errMsg(e)) }
  }

  const reject = async (b: AdminBusinessListItem) => {
    // Reject = keep deactivated + unpublished so it stays hidden from the website.
    try {
      await api.put(`/admin/businesses/${b.id}/status`, false, { headers: { 'Content-Type': 'application/json' } })
      fetchBiz()
      flash('ok', `Rejected "${b.name}" — it stays hidden from the website.`)
    } catch (e) { flash('err', errMsg(e)) }
  }

  const togglePublish = async (b: AdminBusinessListItem) => {
    try {
      await api.put(`/businesses/${b.id}/publish`, { isPublished: !b.isPublished })
      fetchBiz()
      flash('ok', `"${b.name}" ${b.isPublished ? 'unpublished' : 'published'}.`)
    } catch (e) { flash('err', errMsg(e)) }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, city or owner email…" className={`${input} flex-1 min-w-[220px]`} />
        <select value={status} onChange={e => setStatus(e.target.value)} className={input}>
          <option value="">All statuses</option>
          <option value="pending">Pending approval</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive / expired</option>
          <option value="expiring">Expiring ≤30d</option>
          <option value="expired">Expired</option>
          <option value="draft">Drafts (unpublished)</option>
        </select>
      </div>
      {notice && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${notice.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {notice.msg}
        </div>
      )}
      {loading ? <p className="text-sm text-gray-500">Loading businesses...</p> : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 p-2">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-100"><tr><th className={th}>Name</th><th className={th}>Category</th><th className={th}>Owner</th><th className={th}>Expires</th><th className={th}>State</th><th className={th}>Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {businesses.map(b => {
                const expired = b.subscriptionExpiresOn ? new Date(b.subscriptionExpiresOn) < new Date() : false
                return (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/admin/business/${b.id}`} className="font-medium text-gray-900 hover:text-primary-700 hover:underline transition-colors">
                        {b.name}
                      </Link>
                      <div className="flex gap-1.5 mt-1">
                        {!b.isActive && !b.isPublished && <span className={ambers}>Pending</span>}
                        {b.isActive && b.isPublished && <span className={greens}>Approved</span>}
                        {b.isActive && !b.isPublished && <span className={grays}>Draft</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{b.categoryName}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{b.ownerEmail}</td>
                    <td className="px-4 py-3">
                      {b.subscriptionExpiresOn ? (
                        <span className={expired ? 'text-red-500 font-medium' : 'text-gray-700'}>{new Date(b.subscriptionExpiresOn).toLocaleDateString()}</span>
                      ) : <span className="text-gray-400">No subscription</span>}
                      {b.subscriptionPlanName && <div className="text-xs text-gray-500 mt-0.5">{b.subscriptionPlanName}</div>}
                      {b.subscriptionPaymentStatus && b.subscriptionPaymentStatus !== 'Paid' && (
                        <span className={ambers}>Payment pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><span className={b.isActive && !expired ? greens : reds}>{expired ? 'Expired' : b.isActive ? 'Active' : 'Disabled'}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap space-x-3">
                      {!b.isActive && !b.isPublished ? (
                        <>
                          <button onClick={() => approve(b)} className={okBtn}>Approve</button>
                          <button onClick={() => reject(b)} className={dangerBtn}>Reject</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => toggleStatus(b)} className={actionLink}>{b.isActive ? 'Deactivate' : 'Activate'}</button>
                          <button onClick={() => togglePublish(b)} className={ghostBtn}>{b.isPublished ? 'Unpublish' : 'Publish'}</button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
              {businesses.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-sm text-gray-400 text-center">No businesses match.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ---------------- Products ---------------- */

function ProdSec() {
  const [products, setProducts] = useState<AdminProductListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('pending')
  const [q, setQ] = useState('')
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const flash = (type: 'ok' | 'err', msg: string) => {
    setNotice({ type, msg })
    setTimeout(() => setNotice(null), 5000)
  }

  const errMsg = (e: unknown) => {
    const err = e as { response?: { status?: number }; request?: unknown }
    const s = err.response?.status
    if (s === 401) return 'Your login has expired. Log back in as admin and try again.'
    if (s === 403) return 'Only an admin can approve products. Log in with the admin account.'
    if (s === 404) return 'This product is no longer pending. The list has been refreshed.'
    if (!err.response && err.request) return 'Cannot reach the server. Make sure the app is running, then try again.'
    return `The action failed on the server (error ${s ?? 'unknown'}). Refresh the page and try again.`
  }

  const fetchProducts = () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (status) p.set('status', status)
    if (q) p.set('q', q)
    api.get(`/admin/products?${p}`).then(r => setProducts(r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { fetchProducts() }, [status])

  const approve = async (p: AdminProductListItem) => {
    try {
      await api.put(`/admin/products/${p.id}/approve`, true, { headers: { 'Content-Type': 'application/json' } })
      fetchProducts()
      flash('ok', `Approved "${p.name}" — it is now shown on the website.`)
    } catch (e) { flash('err', errMsg(e)) }
  }

  const reject = async (p: AdminProductListItem) => {
    try {
      await api.put(`/admin/products/${p.id}/approve`, false, { headers: { 'Content-Type': 'application/json' } })
      fetchProducts()
      flash('ok', `Rejected "${p.name}" — it stays hidden from the website.`)
    } catch (e) { flash('err', errMsg(e)) }
  }

  const visible = products.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.businessName.toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search product or business…" className={`${input} flex-1 min-w-[220px]`} />
        <select value={status} onChange={e => setStatus(e.target.value)} className={input}>
          <option value="">All products</option>
          <option value="pending">Pending approval</option>
          <option value="approved">Approved</option>
        </select>
      </div>
      {notice && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${notice.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {notice.msg}
        </div>
      )}
      <div className="mb-3 text-sm text-gray-600">
        {status === 'pending' && <span className="text-amber-700 font-medium">{visible.length} product{visible.length === 1 ? '' : 's'} waiting for approval — hidden from the website until you approve.</span>}
      </div>
      {loading ? <p className="text-sm text-gray-500">Loading products...</p> : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 p-2">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-100"><tr><th className={th}>Product</th><th className={th}>Business</th><th className={th}>Owner</th><th className={th}>Price</th><th className={th}>Status</th><th className={th}>Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {visible.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No products found.</td></tr>}
              {visible.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-100" /> : <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 text-xs">img</div>}
                      <span className="font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.businessName}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{p.ownerEmail}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{p.price != null ? `₹${p.price}` : '—'}</td>
                  <td className="px-4 py-3">
                    {p.isApproved
                      ? <span className={greens}>Approved</span>
                      : <span className={ambers}>Pending</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap space-x-3">
                    {p.isApproved ? (
                      <button onClick={() => reject(p)} className={dangerBtn}>Reject</button>
                    ) : (
                      <>
                        <button onClick={() => approve(p)} className={okBtn}>Approve</button>
                        <button onClick={() => reject(p)} className={dangerBtn}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ---------------- Categories ---------------- */

function CategoriesSec() {
  const [cats, setCats] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [err, setErr] = useState('')

  const load = () => api.get('/categories').then(r => setCats(r.data))
  useEffect(() => { load() }, [])

  const create = async (e: FormEvent) => {
    e.preventDefault(); setErr('')
    try { await api.post('/categories', { name }); setName(''); load() }
    catch (ex: any) { setErr(ex.response?.data?.message ?? 'Failed to create category.') }
  }

  const saveEdit = async (id: number) => {
    setErr('')
    try { await api.put(`/categories/${id}`, { name: editName }); setEditId(null); load() }
    catch (ex: any) { setErr(ex.response?.data?.message ?? 'Failed to update category.') }
  }

  const remove = async (c: Category) => {
    if (!confirm(`Delete category "${c.name}"?`)) return
    setErr('')
    try { await api.delete(`/categories/${c.id}`); load() }
    catch (ex: any) { setErr(ex.response?.data?.message ?? 'Cannot delete this category.') }
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={create} className="flex gap-2 mb-6">
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="New category name" className={`${input} flex-1`} />
        <button type="submit" className={btn}>Add Category</button>
      </form>
      {err && <p className="text-red-600 text-sm mb-3">{err}</p>}
      <div className="space-y-2">
        {cats.map(c => (
          <div key={c.id} className="card-static px-4 py-3 flex items-center justify-between">
            {editId === c.id ? (
              <>
                <input value={editName} onChange={e => setEditName(e.target.value)} className={`${input} flex-1 mr-2`} />
                <button onClick={() => saveEdit(c.id)} className={actionLink + ' mr-3'}>Save</button>
                <button onClick={() => setEditId(null)} className="text-sm text-gray-400 hover:underline">Cancel</button>
              </>
            ) : (
              <>
                <span className="text-sm font-medium text-gray-900">{c.name} <span className="text-xs text-gray-400 ml-1">/{c.slug}</span></span>
                <span className="flex gap-4">
                  <button onClick={() => { setEditId(c.id); setEditName(c.name) }} className={actionLink}>Rename</button>
                  <button onClick={() => remove(c)} className={dangerBtn}>Delete</button>
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Subscriptions ---------------- */

interface SubRow {
  id: number; businessId: number; businessName: string; planName: string; amount: number
  paymentMethod: string | null; paymentStatus: string; startDate: string; endDate: string; transactionRef: string | null
}

function SubSec() {
  const [subs, setSubs] = useState<SubRow[]>([])
  const [businesses, setBusinesses] = useState<{ id: number; name: string }[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ businessId: '', planName: '', amount: '', startDate: '', endDate: '', transactionRef: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      api.get(`/subscriptions${filter ? `?status=${filter}` : ''}`),
      api.get('/admin/businesses'),
    ]).then(([s, b]) => { setSubs(s.data); setBusinesses(b.data) }).finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [filter])

  const markPaid = async (id: number) => {
    await api.post(`/subscriptions/${id}/payment`, { paymentMethod: 'Manual', notes: 'Confirmed by admin' })
    fetchData()
  }

  const del = async (id: number) => {
    if (!confirm('Delete this subscription record?')) return
    await api.delete(`/subscriptions/${id}`)
    fetchData()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setSubmitting(true)
    try {
      await api.post('/subscriptions', {
        businessId: Number(form.businessId), planName: form.planName, amount: Number(form.amount),
        startDate: form.startDate, endDate: form.endDate, transactionRef: form.transactionRef, notes: form.notes || null,
      })
      setShowForm(false)
      setForm({ businessId: '', planName: '', amount: '', startDate: '', endDate: '', transactionRef: '', notes: '' })
      fetchData()
    } finally { setSubmitting(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <select value={filter} onChange={e => setFilter(e.target.value)} className={input}>
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Expired">Expired</option>
          <option value="Refunded">Refunded</option>
        </select>
        <button onClick={() => setShowForm(!showForm)} className={btn}>{showForm ? 'Close' : '+ Record Subscription'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Business *</label>
              <select required value={form.businessId} onChange={e => setForm({ ...form, businessId: e.target.value })} className={`${input} w-full`}>
                <option value="">Select business</option>
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Plan Name *</label><input required value={form.planName} onChange={e => setForm({ ...form, planName: e.target.value })} className={`${input} w-full`} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Amount *</label><input type="number" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className={`${input} w-full`} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Start Date *</label><input type="date" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className={`${input} w-full`} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">End Date *</label><input type="date" required value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className={`${input} w-full`} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Transaction Ref</label><input value={form.transactionRef} onChange={e => setForm({ ...form, transactionRef: e.target.value })} className={`${input} w-full`} /></div>
          </div>
          <button type="submit" disabled={submitting} className={`mt-4 ${btn}`}>{submitting ? 'Saving...' : 'Save (activates listing)'}</button>
        </form>
      )}

      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 p-2">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-400 border-b border-gray-100"><tr><th className={th}>Business</th><th className={th}>Plan</th><th className={th}>Amount</th><th className={th}>Period</th><th className={th}>Status</th><th className={th}>Actions</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="px-4 py-4 text-sm text-gray-500">Loading...</td></tr> : subs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-4 text-sm text-gray-500">No subscriptions found.</td></tr>
            ) : subs.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{s.businessName}</td>
                <td className="px-4 py-3">{s.planName}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">₹{s.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{new Date(s.startDate).toLocaleDateString()} → {new Date(s.endDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={
                    s.paymentStatus === 'Paid' ? greens :
                    s.paymentStatus === 'Pending' ? ambers :
                    s.paymentStatus === 'Refunded' ? grays : grays}>
                    {s.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap space-x-3">
                  {s.paymentStatus !== 'Paid' && <button onClick={() => markPaid(s.id)} className={okBtn}>Mark Paid</button>}
                  <button onClick={() => del(s.id)} className={dangerBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------------- Moderation ---------------- */

interface TestimonialRow { id: number; businessName: string; customerName: string; rating: number; reviewText: string | null; isApproved: boolean }
interface ProductReviewRow { id: number; productName: string; businessName: string; customerName: string; rating: number; reviewText: string | null; isApproved: boolean }

function ModSec() {
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([])
  const [prodReviews, setProdReviews] = useState<ProductReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingOnly, setPendingOnly] = useState(true)

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      api.get(`/admin/testimonials${pendingOnly ? '?pendingOnly=true' : ''}`).then(r => setTestimonials(r.data)),
      api.get('/admin/product-reviews').then(r => setProdReviews(r.data)),
    ]).finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [pendingOnly])

  const toggleApprove = async (t: TestimonialRow) => {
    await api.put(`/admin/testimonials/${t.id}/approve`, t.isApproved ? false : true, { headers: { 'Content-Type': 'application/json' } })
    fetchData()
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this review?')) return
    await api.delete(`/admin/testimonials/${id}`)
    fetchData()
  }

  const removeProduct = async (id: number) => {
    if (!confirm('Delete this product review?')) return
    await api.delete(`/admin/product-reviews/${id}`)
    fetchData()
  }

  if (loading) return <p className="text-sm text-gray-500">Loading reviews...</p>

  return (
    <div className="space-y-10">
      <div>
        <label className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <input type="checkbox" checked={pendingOnly} onChange={e => setPendingOnly(e.target.checked)} />
          Show only pending
        </label>
        <h3 className="text-sm font-bold text-gray-900 mb-3">Business reviews ({testimonials.length})</h3>
        <div className="space-y-4">
          {testimonials.length === 0 && <p className="text-sm text-gray-500">Nothing to review.</p>}
          {testimonials.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.customerName}</p>
                  <p className="text-xs text-gray-500">{t.businessName} · <span className="text-amber-500">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</span></p>
                  {t.reviewText && <p className="text-sm text-gray-700 mt-2">{t.reviewText}</p>}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${t.isApproved ? greens : ambers}`}>
                  {t.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>
              <div className="flex gap-3 mt-3">
                <button onClick={() => toggleApprove(t)} className={actionLink}>{t.isApproved ? 'Revoke approval' : 'Approve'}</button>
                <button onClick={() => remove(t.id)} className={dangerBtn}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">Product reviews ({prodReviews.length})</h3>
        <p className="text-xs text-gray-400 mb-3">Reviews from verified buyers post automatically and can only be removed if inappropriate.</p>
        <div className="space-y-4">
          {prodReviews.length === 0 && <p className="text-sm text-gray-500">Nothing to review.</p>}
          {prodReviews.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.customerName} <span className="text-xs font-normal text-gray-400">on {r.productName}</span></p>
                  <p className="text-xs text-gray-500">{r.businessName} · <span className="text-amber-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span></p>
                  {r.reviewText && <p className="text-sm text-gray-700 mt-2">{r.reviewText}</p>}
                </div>
                <span className={greens}>Posted</span>
              </div>
              <div className="flex gap-3 mt-3">
                <button onClick={() => removeProduct(r.id)} className="text-sm font-medium text-red-500 hover:text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------------- Announcements ---------------- */

function AnnSec() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', message: '', audience: 'All' })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = () => { setLoading(true); api.get('/admin/announcements').then(r => setAnnouncements(r.data)).finally(() => setLoading(false)) }
  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setSubmitting(true)
    try { await api.post('/admin/announcements', form); setForm({ title: '', message: '', audience: 'All' }); fetchData() }
    finally { setSubmitting(false) }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this announcement?')) return
    await api.delete(`/admin/announcements/${id}`)
    fetchData()
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Broadcast announcement</h3>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Title</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={`${input} w-full`} /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Message</label><textarea required rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className={`${input} w-full resize-none`} /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Audience</label>
            <select value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} className={`${input} w-full`}>
              <option value="All">Everyone</option>
              <option value="BusinessOwners">Business owners</option>
              <option value="Visitors">Visitors</option>
            </select>
          </div>
        </div>
        <button type="submit" disabled={submitting} className={`mt-4 ${btn}`}>{submitting ? 'Publishing...' : 'Publish Announcement'}</button>
      </form>

      <div className="space-y-4">
        {loading ? <p className="text-sm text-gray-500">Loading announcements...</p> : announcements.length === 0 ? (
          <p className="text-sm text-gray-500">No announcements yet.</p>
        ) : announcements.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">{a.title}</p>
              <p className="text-xs text-gray-400 mb-1">Audience: {a.audience ?? 'All'} · {new Date(a.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-gray-700">{a.message}</p>
            </div>
            <button onClick={() => remove(a.id)} className="text-sm font-medium text-red-500 hover:text-red-600 shrink-0">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Enquiries ---------------- */

function EnquiriesSec() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const fetchData = () => {
    setLoading(true)
    const url = filter === 'unread' ? '/enquiries?unreadOnly=true' : '/enquiries'
    api.get(url).then(r => setEnquiries(r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [filter])

  const markRead = async (id: number) => { await api.put(`/enquiries/${id}/read`); fetchData() }
  const unreadCount = enquiries.filter(e => !e.isRead).length

  if (loading) return <p className="text-sm text-gray-500">Loading enquiries...</p>

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setFilter('all')} className={`px-3.5 py-1.5 text-sm font-medium rounded-xl transition-all ${filter === 'all' ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/25' : 'text-gray-500 hover:bg-slate-100'}`}>All ({enquiries.length})</button>
        <button onClick={() => setFilter('unread')} className={`px-3.5 py-1.5 text-sm font-medium rounded-xl transition-all ${filter === 'unread' ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/25' : 'text-gray-500 hover:bg-slate-100'}`}>Unread ({unreadCount})</button>
      </div>

      {enquiries.length === 0 ? <p className="text-sm text-gray-500">No enquiries found.</p> : (
        <div className="space-y-3">
          {enquiries.map(e => (
            <div key={e.id} className={`border rounded-2xl p-4 transition-colors ${e.isRead ? 'bg-white border-gray-100' : 'bg-primary-50/50 border-primary-100'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900">{e.name}</span>
                    <span className="text-xs text-gray-400">{e.email}</span>
                    {e.phone && <span className="text-xs text-gray-400">· {e.phone}</span>}
                    {!e.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-primary-600 mt-0.5">{e.businessName}</p>
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{e.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(e.createdAt).toLocaleString()}</p>
                </div>
                {!e.isRead && <button onClick={() => markRead(e.id)} className={actionLink + ' whitespace-nowrap shrink-0'}>Mark read</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------------- Shell ---------------- */

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview')
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    if (!user || user.role !== 'Admin') navigate('/')
  }, [user, navigate])

  const navGroups: NavGroup[] = [
    {
      label: 'Operations',
      items: [
        { key: 'overview', label: 'Overview', icon: 'grid' },
        { key: 'businesses', label: 'Businesses', icon: 'store' },
        { key: 'products', label: 'Products', icon: 'package' },
        { key: 'subscriptions', label: 'Subscriptions', icon: 'card' },
      ],
    },
    {
      label: 'Manage',
      items: [
        { key: 'categories', label: 'Categories', icon: 'tag' },
        { key: 'users', label: 'Users', icon: 'user' },
        { key: 'moderation', label: 'Moderation', icon: 'shield' },
      ],
    },
    {
      label: 'Engage',
      items: [
        { key: 'enquiries', label: 'Enquiries', icon: 'chat' },
        { key: 'announcements', label: 'Announcements', icon: 'megaphone' },
      ],
    },
  ]

  return (
    <DashboardShell
      brand="Admin"
      brandTagline="Operations centre"
      active={tab}
      onSelect={(k) => setTab(k as Tab)}
      navGroups={navGroups}
      title={
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 leading-tight tracking-tight">Administration</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform overview and moderation</p>
        </div>
      }
      user={{ name: user?.name, email: user?.email, role: 'Administrator' }}
      onLogout={logout}
    >
      {tab === 'overview' && <Overview onReview={() => setTab('businesses')} onReviewProducts={() => setTab('products')} />}
      {tab === 'users' && <UsersSec />}
      {tab === 'businesses' && <BizSec />}
      {tab === 'products' && <ProdSec />}
      {tab === 'categories' && <CategoriesSec />}
      {tab === 'subscriptions' && <SubSec />}
      {tab === 'moderation' && <ModSec />}
      {tab === 'enquiries' && <EnquiriesSec />}
      {tab === 'announcements' && <AnnSec />}
    </DashboardShell>
  )
}
