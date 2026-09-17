import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { BusinessSummary, Category } from '../api/types'
import BusinessCard from '../components/BusinessCard'

export default function Directory() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [categoryId, setCategoryId] = useState<number | null>(Number(searchParams.get('categoryId')) || null)
  const [city, setCity] = useState(searchParams.get('city') ?? '')
  const [categories, setCategories] = useState<Category[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const pageSize = 12

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data))
    api.get('/businesses/cities').then(({ data }) => setCities(data))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (categoryId) params.set('categoryId', String(categoryId))
    if (city) params.set('city', city)
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    api.get(`/businesses?${params}`).then(({ data }) => { setBusinesses(data.items || []); setTotal(data.total || 0) }).finally(() => setLoading(false))
  }, [q, categoryId, city, page])

  const applySearch = () => {
    setPage(1)
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (categoryId) p.set('categoryId', String(categoryId))
    if (city) p.set('city', city)
    setSearchParams(p)
  }

  return (
    <div>
      <div className="mb-8 animate-fadeIn">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Business Directory</h1>
          <p className="text-gray-500">Discover local businesses, products and services</p>
        </div>
      </div>

      {/* Search -> Discover -> Evaluate -> Contact */}
      <form onSubmit={(e) => { e.preventDefault(); applySearch() }} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3 mb-8 shadow-card rounded-2xl bg-white p-3 border border-gray-100">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }}
            placeholder="Search by business, product/service or city..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500/40 bg-gray-50/60 hover:bg-gray-50 transition-colors"
          />
        </div>
        <select
          value={categoryId ?? ''} onChange={(e) => { setCategoryId(e.target.value ? Number(e.target.value) : null); setPage(1) }}
          className="px-4 py-3 rounded-xl border border-transparent bg-gray-50/60 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-gray-700 transition-colors"
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={city} onChange={(e) => { setCity(e.target.value); setPage(1) }}
          className="px-4 py-3 rounded-xl border border-transparent bg-gray-50/60 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-gray-700 transition-colors"
        >
          <option value="">All locations</option>
          {cities.map((cty) => <option key={cty} value={cty}>{cty}</option>)}
        </select>
        <button type="submit" className="px-8 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 shadow-md shadow-primary-200/60 hover:shadow-lg transition-all active:scale-[0.98]">
          Search
        </button>
      </form>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-500 mt-4">Loading businesses...</p>
        </div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <p className="text-gray-500 text-lg">No businesses found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6">{total} business{total !== 1 ? 'es' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((b) => <BusinessCard key={b.id} business={b} />)}
          </div>
          {Math.ceil(total / pageSize) > 1 && (
            <div className="flex justify-center gap-3 mt-10">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">Previous</button>
              <span className="px-4 py-2.5 text-sm text-gray-500">Page {page} of {Math.ceil(total / pageSize)}</span>
              <button disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage(page + 1)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
