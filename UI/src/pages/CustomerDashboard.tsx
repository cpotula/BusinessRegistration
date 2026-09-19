import { useState, useEffect, FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { api } from '../api/client'
import { ProductSearchItem } from '../api/types'
import ProductCard from '../components/ProductCard'
import MyOrders from './MyOrders'
import { searchProducts, pctBadgeClass } from '../utils/productSearch'

type Tab = 'products' | 'profile' | 'orders'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'products', label: 'Products', icon: '🛍️' },
  { key: 'profile', label: 'Edit Profile', icon: '👤' },
  { key: 'orders', label: 'My Orders', icon: '📦' },
]

export default function CustomerDashboard() {
  const { user, updateProfile } = useAuth()
  const [tab, setTab] = useState<Tab>('products')

  const [products, setProducts] = useState<ProductSearchItem[]>([])
  const [productsTotal, setProductsTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (tab === 'products' && products.length === 0) {
      api.get('/products/search', { params: { pageSize: 50 } })
        .then(({ data }) => { setProducts(data.items); setProductsTotal(data.total) })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [tab, products.length])

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setProfileMsg('')
    try {
      await updateProfile(name, phone)
      setProfileMsg('Profile updated successfully.')
    } catch {
      setProfileMsg('Could not update your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const searching = query.trim().length > 0
  const matched = searchProducts(products, query)

  const nav = (k: Tab, active: boolean) => (
    <button
      key={k}
      onClick={() => setTab(k)}
      className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all ${active ? 'bg-primary-600 text-white shadow-md shadow-primary-200/60' : 'text-gray-600 hover:bg-primary-50/80 hover:text-primary-700'}`}
    >
      <span className="text-lg">{TABS.find((t) => t.key === k)!.icon}</span>
      {TABS.find((t) => t.key === k)!.label}
    </button>
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xl shadow-md shadow-primary-200/60">
          {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">My Dashboard</h1>
          <p className="text-sm text-gray-500">{user?.name} · {user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[230px_1fr] gap-6 items-start">
        <div className="space-y-2 md:sticky md:top-24">
          {TABS.map((t) => nav(t.key, tab === t.key))}
        </div>

        <div className="bg-white rounded-2xl border p-6 min-h-[480px]">
          {tab === 'products' && (
            <>
              <div className="flex items-end justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">All Products</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Approved products from all businesses</p>
                </div>
                <span className="text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-100 rounded-full px-3 py-1">
                  {searching ? `${matched.length} matches` : `${productsTotal} products`}
                </span>
              </div>
              <div className="relative mb-5">
                <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" /></svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products by name, business or keyword…"
                  className="input-field pl-10"
                />
              </div>
              {loading ? (
                <p className="text-gray-500">Loading products…</p>
              ) : matched.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🔍</div>
                  <p className="text-gray-500">No products match "{query}".</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {matched.map(({ product: p, pct }) => (
                    <div key={p.id} className="relative">
                      {searching && pct < 100 && (
                        <span className={`absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold border shadow-sm ${pctBadgeClass(pct)}`}>
                          {pct}% match
                        </span>
                      )}
                      <ProductCard
                        to={`/products/${p.id}`}
                        name={p.name}
                        price={p.price}
                        imageUrl={p.imageUrl}
                        stockQuantity={p.stockQuantity}
                        subtitle={p.businessName}
                        rating={p.averageRating}
                        reviewCount={p.reviewCount}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'profile' && (
            <form onSubmit={saveProfile} className="max-w-md space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
                <p className="text-xs text-gray-400 mt-0.5">Keep your name and phone current — the seller uses these to deliver your orders.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input value={user?.email ?? ''} disabled className="input-field bg-gray-50 text-gray-500" />
              </div>
              {profileMsg && <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">{profileMsg}</p>}
              <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all">
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </form>
          )}

          {tab === 'orders' && <MyOrders />}
        </div>
      </div>
    </div>
  )
}