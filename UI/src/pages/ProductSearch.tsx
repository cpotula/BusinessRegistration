import { useEffect, useState, FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { ProductSearchItem } from '../api/types'

// Search results page - lists every matching product/service; each result
// links to its product details page.
export default function ProductSearch() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const [term, setTerm] = useState(q)
  const [items, setItems] = useState<ProductSearchItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setTerm(q)
    setLoading(true)
    api
      .get(`/products/search?page=1&pageSize=50${q ? `&q=${encodeURIComponent(q)}` : ''}`)
      .then(({ data }) => { setItems(data.items || []); setTotal(data.total) })
      .catch(() => { setItems([]); setTotal(0) })
      .finally(() => setLoading(false))
  }, [q])

  const submitSearch = (e: FormEvent) => {
    e.preventDefault()
    navigate(term.trim() ? `/search?q=${encodeURIComponent(term.trim())}` : '/search')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {q ? <>Search results for &ldquo;{q}&rdquo;</> : 'All Products & Services'}
        </h1>
        {!loading && <p className="text-gray-500 mt-1">{total} result{total === 1 ? '' : 's'} found</p>}
      </div>

      {/* Refine search */}
      <form onSubmit={submitSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search products and services..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button type="submit" className="px-8 py-3.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
          Search
        </button>
      </form>

      {loading ? (
        <div className="text-center py-20"><div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-500">No products or services matched your search.</p>
          <Link to="/directory" className="text-primary-600 font-medium mt-3 inline-block hover:underline">Browse the directory instead</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300"
            >
              <div className="aspect-square bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <svg className="w-10 h-10 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm text-gray-900 truncate group-hover:text-primary-700 transition-colors">{p.name}</h3>
                <p className="text-xs text-gray-400 truncate mt-0.5">{p.businessName}</p>
                {p.price != null && <p className="text-primary-700 font-bold text-sm mt-2">₹{p.price.toLocaleString('en-IN')}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
