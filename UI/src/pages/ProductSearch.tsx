import { useEffect, useState, FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { MatchResult, getCatalog, searchProducts, pctBadgeClass } from '../utils/productSearch'
import ProductCard from '../components/ProductCard'

// Search results page - lists every matching product/service, ranked by the
// client-side fuzzy matcher (same engine as the header/customer search). Each
// result links to its product details page.
export default function ProductSearch() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const [term, setTerm] = useState(q)
  const [items, setItems] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setTerm(q)
    setLoading(true)
    getCatalog()
      .then((products) => setItems(searchProducts(products, q)))
      .catch(() => setItems([]))
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
        {!loading && <p className="text-gray-500 mt-1">{items.length} result{items.length === 1 ? '' : 's'} found</p>}
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
          {items.map(({ product: p, pct }) => (
            <div key={p.id} className="relative">
              {q && pct < 100 && (
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
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
