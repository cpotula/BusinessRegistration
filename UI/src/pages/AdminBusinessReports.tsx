import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { StatCard, DonutChart, BarChart } from './OwnerDashboard'
import SalesByPeriodCard from '../components/SalesByPeriodCard'
import {
  AdminBusinessListItem, OrderInfo, Product, SoldByPeriod, SoldSummary,
} from '../api/types'

export default function AdminBusinessReports() {
  const { id } = useParams()
  const businessId = Number(id)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [biz, setBiz] = useState<AdminBusinessListItem | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<OrderInfo[]>([])
  const [sold, setSold] = useState<SoldSummary | null>(null)
  const [periodData, setPeriodData] = useState<SoldByPeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!user || user.role !== 'Admin') { navigate('/admin'); return }
    if (!Number.isFinite(businessId)) { setErr('Invalid business id.'); setLoading(false); return }
    setLoading(true)
    setErr('')
    Promise.all([
      api.get('/admin/businesses').then(r => {
        const list = r.data as AdminBusinessListItem[]
        setBiz(list.find(b => b.id === businessId) ?? null)
      }),
      api.get(`/products?businessId=${businessId}`).then(r => setProducts(r.data)),
      api.get(`/orders/admin/business/${businessId}`).then(r => setOrders(r.data)),
      api.get(`/orders/sold?businessId=${businessId}`).then(r => setSold(r.data)),
      api.get(`/orders/sold-by-period?businessId=${businessId}`).then(r => setPeriodData(r.data)),
    ]).catch(() => setErr('Could not load this business. Log in as admin and try again.')).finally(() => setLoading(false))
  }, [businessId, user, navigate])

  const inStock = products.filter(p => p.stockQuantity > 0)
  const outOfStock = products.filter(p => p.stockQuantity <= 0)
  const value = products.reduce((s, p) => s + (p.price ?? 0) * Math.max(0, p.stockQuantity), 0)
  const pending = orders.filter(o => o.status === 'Pending').length
  const confirmed = orders.filter(o => o.status !== 'Pending').length
  const orderTotal = Math.max(orders.length, 1)
  const topByValue = [...products]
    .sort((a, b) => (b.price ?? 0) * b.stockQuantity - (a.price ?? 0) * a.stockQuantity)
    .slice(0, 5)
    .map(p => ({ label: p.name, value: (p.price ?? 0) * p.stockQuantity }))

  const expired = biz?.subscriptionExpiresOn ? new Date(biz.subscriptionExpiresOn) < new Date() : false

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back to Administration
      </Link>

      <div className="card p-6 mb-6">
        {!biz ? (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Business #{businessId}</h1>
              <p className="text-sm text-gray-500 mt-1">Inventory and confirmed-sales reports</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-2xl shadow-md shadow-primary-200/50 shrink-0">
                {biz.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight truncate">{biz.name}</h1>
                <p className="text-sm text-gray-500 mt-0.5 truncate">
                  {biz.categoryName}{biz.city ? ` · ${biz.city}` : ''} · {biz.ownerEmail}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {biz.subscriptionExpiresOn
                    ? `${expired ? 'Subscription expired on' : 'Subscription valid till'} ${new Date(biz.subscriptionExpiresOn).toLocaleDateString()}`
                    : 'No subscription record'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${biz.isActive && biz.isPublished ? 'bg-green-50 text-green-700' : biz.isActive ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-600'}`}>
                {biz.isActive && biz.isPublished ? 'Approved & published' : biz.isActive ? 'Active (draft)' : 'Hidden'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100 text-xs font-semibold">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Live overview
              </span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="card p-10 flex items-center justify-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading inventory &amp; reports…</span>
        </div>
      ) : err ? (
        <div className="card p-10 text-sm text-red-500">{err}</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total products" value={String(products.length)} icon="📦" />
            <StatCard label="In stock" value={String(inStock.length)} tint="green" icon="✅" />
            <StatCard label="Out of stock" value={String(outOfStock.length)} tint="red" icon="⚠️" />
            <StatCard label="Stock value" value={`₹${value.toLocaleString('en-IN')}`} icon="💰" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Sold today" value={String(sold?.soldToday ?? 0)} icon="🛒" />
            <StatCard label="Sold this month" value={String(sold?.soldThisMonth ?? 0)} tint="green" icon="📈" />
            <StatCard label="Sales this month" value={`₹${(sold?.revenueThisMonth ?? 0).toLocaleString('en-IN')}`} icon="💵" />
            <StatCard label="Sales this year" value={`₹${(sold?.revenueThisYear ?? 0).toLocaleString('en-IN')}`} icon="🏆" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-200/50">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Stock overview</h3>
                  <p className="text-xs text-gray-400">Live inventory split</p>
                </div>
              </div>
              <DonutChart inStock={inStock.length} outOfStock={outOfStock.length} />
              <div className="flex justify-center gap-5 mt-4 text-sm">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> In stock ({inStock.length})
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-100">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Out of stock ({outOfStock.length})
                </span>
              </div>
            </div>

            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-200/50">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Top 5 by stock value</h3>
                  <p className="text-xs text-gray-400">Price × quantity on hand</p>
                </div>
              </div>
              <BarChart items={topByValue} />
            </div>

            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-200/50">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m-6 0a2 2 0 002 2h4a2 2 0 002-2m-6 0V3a2 2 0 002-2h4a2 2 0 002 2M9 5v2m4-2v2" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Order requests</h3>
                  <p className="text-xs text-gray-400">Placed against this business</p>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="inline-flex items-center gap-1.5 font-medium text-gray-600"><span className="w-2 h-2 rounded-full bg-amber-500" /> Pending</span>
                    <span className="font-extrabold text-gray-900">{pending}</span>
                  </div>
                  <div className="bg-gray-100 h-3.5 rounded-full overflow-hidden">
                    <div className="h-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500" style={{ width: `${(pending / orderTotal) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="inline-flex items-center gap-1.5 font-medium text-gray-600"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Confirmed</span>
                    <span className="font-extrabold text-gray-900">{confirmed}</span>
                  </div>
                  <div className="bg-gray-100 h-3.5 rounded-full overflow-hidden">
                    <div className="h-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500" style={{ width: `${(confirmed / orderTotal) * 100}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-sm text-gray-500">Total orders received</span>
                  <span className="text-lg font-extrabold text-gray-900">{orders.length}</span>
                </div>
              </div>
            </div>
          </div>

          <SalesByPeriodCard data={periodData} />

          <div className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="font-bold text-gray-900">Products ({products.length})</h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Inventory
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600"><tr>
                  <th className="px-4 py-2.5 font-medium">Product</th>
                  <th className="px-4 py-2.5 font-medium">Price</th>
                  <th className="px-4 py-2.5 font-medium">Stock</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Approval</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-200">
                  {products.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No products in this business yet.</td></tr>}
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          {p.images[0] ? <img src={p.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover" /> : <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">img</div>}
                          <span className="font-medium text-gray-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">{p.price != null ? `₹${p.price}` : '—'}</td>
                      <td className="px-4 py-2.5 font-bold text-gray-900">{p.stockQuantity}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${p.stockQuantity > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                          {p.stockQuantity > 0 ? 'In stock' : 'Out of stock'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {p.isApproved
                          ? <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-50 text-green-600">Approved</span>
                          : <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600">Pending</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}