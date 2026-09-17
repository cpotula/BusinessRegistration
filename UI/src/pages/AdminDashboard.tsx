import { useEffect, useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import {
  AdminDashboard as StatsType, Announcement, Category, Enquiry,
  AdminBusinessListItem, ExpiringBusiness, PendingPayment,
} from '../api/types'

type Tab = 'overview' | 'users' | 'businesses' | 'categories' | 'subscriptions' | 'moderation' | 'announcements' | 'enquiries'

const btn = 'px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl disabled:opacity-50'
const input = 'border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent'

/* ---------------- Overview: what needs my attention today? ---------------- */

function Overview() {
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

  const cards = [
    { label: 'Users', value: stats.totalUsers },
    { label: 'Businesses', value: stats.totalBusinesses },
    { label: 'Active Listings', value: stats.activeBusinesses },
    { label: 'Active Subscriptions', value: stats.activeSubscriptions },
    { label: 'Expiring ≤30 days', value: stats.expiringSoon },
    { label: 'Expired Listings', value: stats.expiredListings },
    { label: 'Pending Reviews', value: stats.pendingTestimonials },
    { label: 'Unread Enquiries', value: stats.unreadEnquiries },
    { label: 'Revenue (30d)', value: `₹${stats.monthlyRevenue.toLocaleString()}` },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${
              ['Expiring ≤30 days', 'Expired Listings'].includes(c.label!) && Number(c.value) > 0 ? 'text-red-500' : 'text-gray-900'
            }`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Needs attention */}
      <h3 className="font-semibold text-gray-900 mb-3">Needs your attention</h3>

      {pendingPayments.length > 0 && (
        <div className="bg-white rounded-2xl border border-yellow-200 mb-4 overflow-hidden">
          <p className="px-5 py-3 bg-yellow-50 text-yellow-800 text-sm font-semibold">💰 {pendingPayments.length} renewal request{pendingPayments.length > 1 ? 's' : ''} awaiting payment confirmation</p>
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
        <div className="bg-white rounded-2xl border mb-4 overflow-hidden">
          <p className="px-5 py-3 bg-orange-50 text-orange-700 text-sm font-semibold">⏳ Expiring within 30 days</p>
          <div className="divide-y divide-gray-100">
            {expiring.map(e => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3 flex-wrap gap-2">
                <div>
                  <span className="text-sm font-medium text-gray-900">{e.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{e.categoryName}{e.city ? ` · ${e.city}` : ''} · {e.ownerEmail}</span>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${e.daysLeft <= 7 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                  {e.daysLeft} day{e.daysLeft === 1 ? '' : 's'} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingPayments.length === 0 && expiring.length === 0 && (
        <p className="text-sm text-green-600 bg-green-50 rounded-2xl px-5 py-4 mb-4">✅ Nothing urgent — subscriptions and payments are healthy.</p>
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Actions</th></tr></thead>
        <tbody className="divide-y divide-gray-200">
          {users.map(u => (
            <tr key={u.id}>
              <td className="px-4 py-3">{u.name}</td>
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3">
                <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} className={`${input} py-1`}>
                  <option value="BusinessOwner">Business Owner</option>
                  <option value="Admin">Admin</option>
                  <option value="Guest">Guest</option>
                </select>
              </td>
              <td className="px-4 py-3"><span className={u.isActive ? 'text-green-600' : 'text-red-500'}>{u.isActive ? 'Active' : 'Disabled'}</span></td>
              <td className="px-4 py-3"><button onClick={() => toggleActive(u)} className="text-sm font-medium text-primary-600 hover:text-primary-700">{u.isActive ? 'Disable' : 'Enable'}</button></td>
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
    // API expects a raw JSON boolean here
    await api.put(`/admin/businesses/${b.id}/status`, b.isActive ? false : true)
    fetchBiz()
  }

  const togglePublish = async (b: AdminBusinessListItem) => {
    await api.put(`/businesses/${b.id}/publish`, { isPublished: !b.isPublished })
    fetchBiz()
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, city or owner email…" className={`${input} flex-1 min-w-[220px]`} />
        <select value={status} onChange={e => setStatus(e.target.value)} className={input}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive / expired</option>
          <option value="expiring">Expiring ≤30d</option>
          <option value="expired">Expired</option>
          <option value="draft">Drafts (unpublished)</option>
        </select>
      </div>
      {loading ? <p className="text-sm text-gray-500">Loading businesses...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Owner</th><th className="px-4 py-3 font-medium">Expires</th><th className="px-4 py-3 font-medium">State</th><th className="px-4 py-3 font-medium">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {businesses.map(b => {
                const expired = b.subscriptionExpiresOn ? new Date(b.subscriptionExpiresOn) < new Date() : false
                return (
                  <tr key={b.id}>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{b.name}</span>
                      {!b.isPublished && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Draft</span>}
                    </td>
                    <td className="px-4 py-3">{b.categoryName}</td>
                    <td className="px-4 py-3 text-xs">{b.ownerEmail}</td>
                    <td className="px-4 py-3">
                      {b.subscriptionExpiresOn ? (
                        <span className={expired ? 'text-red-500 font-medium' : ''}>{new Date(b.subscriptionExpiresOn).toLocaleDateString()}</span>
                      ) : <span className="text-gray-400">No subscription</span>}
                    </td>
                    <td className="px-4 py-3"><span className={b.isActive && !expired ? 'text-green-600' : 'text-red-500'}>{expired ? 'Expired' : b.isActive ? 'Active' : 'Disabled'}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button onClick={() => toggleStatus(b)} className="text-sm font-medium text-primary-600 hover:text-primary-700 mr-3">{b.isActive ? 'Deactivate' : 'Activate'}</button>
                      <button onClick={() => togglePublish(b)} className="text-sm font-medium text-gray-500 hover:text-gray-700">{b.isPublished ? 'Unpublish' : 'Publish'}</button>
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
          <div key={c.id} className="bg-white border rounded-xl px-4 py-3 flex items-center justify-between">
            {editId === c.id ? (
              <>
                <input value={editName} onChange={e => setEditName(e.target.value)} className={`${input} flex-1 mr-2`} />
                <button onClick={() => saveEdit(c.id)} className="text-sm font-medium text-primary-600 hover:underline mr-3">Save</button>
                <button onClick={() => setEditId(null)} className="text-sm text-gray-400 hover:underline">Cancel</button>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-900">{c.name} <span className="text-xs text-gray-400 ml-1">/{c.slug}</span></span>
                <span className="flex gap-3">
                  <button onClick={() => { setEditId(c.id); setEditName(c.name) }} className="text-sm font-medium text-primary-600 hover:underline">Rename</button>
                  <button onClick={() => remove(c)} className="text-sm font-medium text-red-500 hover:underline">Delete</button>
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3 font-medium">Business</th><th className="px-4 py-3 font-medium">Plan</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Period</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Actions</th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? <tr><td colSpan={6} className="px-4 py-4 text-sm text-gray-500">Loading...</td></tr> : subs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-4 text-sm text-gray-500">No subscriptions found.</td></tr>
            ) : subs.map(s => (
              <tr key={s.id}>
                <td className="px-4 py-3">{s.businessName}</td>
                <td className="px-4 py-3">{s.planName}</td>
                <td className="px-4 py-3">₹{s.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs">{new Date(s.startDate).toLocaleDateString()} → {new Date(s.endDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    s.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                    s.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    s.paymentStatus === 'Refunded' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {s.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {s.paymentStatus !== 'Paid' && <button onClick={() => markPaid(s.id)} className="text-sm font-medium text-green-600 hover:underline mr-3">Mark Paid</button>}
                  <button onClick={() => del(s.id)} className="text-sm font-medium text-red-500 hover:underline">Delete</button>
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

function ModSec() {
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingOnly, setPendingOnly] = useState(true)

  const fetchData = () => {
    setLoading(true)
    api.get(`/admin/testimonials${pendingOnly ? '?pendingOnly=true' : ''}`).then(r => setTestimonials(r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [pendingOnly])

  const toggleApprove = async (t: TestimonialRow) => {
    // API expects a raw JSON boolean here
    await api.put(`/admin/testimonials/${t.id}/approve`, t.isApproved ? false : true)
    fetchData()
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this review?')) return
    await api.delete(`/admin/testimonials/${id}`)
    fetchData()
  }

  if (loading) return <p className="text-sm text-gray-500">Loading reviews...</p>

  return (
    <div>
      <label className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <input type="checkbox" checked={pendingOnly} onChange={e => setPendingOnly(e.target.checked)} />
        Show only pending
      </label>
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
              <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${t.isApproved ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                {t.isApproved ? 'Approved' : 'Pending'}
              </span>
            </div>
            <div className="flex gap-3 mt-3">
              <button onClick={() => toggleApprove(t)} className="text-sm font-medium text-primary-600 hover:text-primary-700">{t.isApproved ? 'Revoke approval' : 'Approve'}</button>
              <button onClick={() => remove(t.id)} className="text-sm font-medium text-red-500 hover:text-red-600">Delete</button>
            </div>
          </div>
        ))}
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
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-colors ${filter === 'all' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}>All ({enquiries.length})</button>
        <button onClick={() => setFilter('unread')} className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-colors ${filter === 'unread' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}>Unread ({unreadCount})</button>
      </div>

      {enquiries.length === 0 ? <p className="text-sm text-gray-500">No enquiries found.</p> : (
        <div className="space-y-3">
          {enquiries.map(e => (
            <div key={e.id} className={`border rounded-2xl p-4 transition-colors ${e.isRead ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900">{e.name}</span>
                    <span className="text-xs text-gray-400">{e.email}</span>
                    {e.phone && <span className="text-xs text-gray-400">· {e.phone}</span>}
                    {!e.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-primary-600 mt-0.5">{e.businessName}</p>
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{e.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(e.createdAt).toLocaleString()}</p>
                </div>
                {!e.isRead && <button onClick={() => markRead(e.id)} className="text-xs font-medium text-primary-600 hover:text-primary-700 whitespace-nowrap shrink-0">Mark read</button>}
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
  const { user } = useAuth()

  useEffect(() => {
    if (!user || user.role !== 'Admin') navigate('/')
  }, [user, navigate])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'businesses', label: 'Businesses' },
    { key: 'subscriptions', label: 'Subscriptions' },
    { key: 'categories', label: 'Categories' },
    { key: 'users', label: 'Users' },
    { key: 'moderation', label: 'Moderation' },
    { key: 'enquiries', label: 'Enquiries' },
    { key: 'announcements', label: 'Announcements' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Administration</h1>
      <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${tab === t.key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
        {tab === 'overview' && <Overview />}
        {tab === 'users' && <UsersSec />}
        {tab === 'businesses' && <BizSec />}
        {tab === 'categories' && <CategoriesSec />}
        {tab === 'subscriptions' && <SubSec />}
        {tab === 'moderation' && <ModSec />}
        {tab === 'enquiries' && <EnquiriesSec />}
        {tab === 'announcements' && <AnnSec />}
      </div>
    </div>
  )
}
