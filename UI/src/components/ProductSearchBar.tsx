import { useEffect, useRef, useState, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { MatchResult, getCatalog, searchProducts, pctBadgeClass } from '../utils/productSearch'

interface Props {
  placeholder?: string
  size?: 'md' | 'lg'
  onNavigate?: () => void
}

// Product search box with live fuzzy autocomplete over the full catalog.
// Typing "burger"/"bugger", "solid drive" (-> SSD) or a misspelling like
// "bryani" (-> Biryani) surfaces the matching products with a match %.
export default function ProductSearchBar({ placeholder = 'Search products...', size = 'md', onNavigate }: Props) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<MatchResult[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const navigateFn = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const term = query.trim()
    if (!term) { setSuggestions([]); return }
    const t = setTimeout(() => {
      getCatalog().then((products) => {
        setSuggestions(searchProducts(products, term).slice(0, 8))
        setActiveIndex(-1)
      })
    }, 200)
    return () => clearTimeout(t)
  }, [query])

  // Close the dropdown when clicking outside the search box.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const runSearch = (term: string) => {
    const q = term.trim()
    navigateFn(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
    setOpen(false)
    setActiveIndex(-1)
    onNavigate?.()
  }

  const goProduct = (id: number) => {
    navigateFn(`/products/${id}`)
    setOpen(false)
    setActiveIndex(-1)
    onNavigate?.()
  }

  const isEmptyQuery = query.trim().length === 0

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!isEmptyQuery) {
          e.preventDefault()
          setOpen(true)
          setActiveIndex(e.key === 'ArrowDown' ? 0 : suggestions.length - 1)
        }
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % Math.max(suggestions.length + 1, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const count = suggestions.length + 1
      setActiveIndex((prev) => (prev <= 0 ? count - 1 : prev - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        goProduct(suggestions[activeIndex].product.id)
      } else if (activeIndex === suggestions.length) {
        runSearch(query)
      } else {
        runSearch(query)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  const inputCls =
    size === 'lg'
      ? 'w-full pl-12 pr-12 py-4 rounded-xl border border-gray-200 bg-white shadow-sm text-base'
      : 'w-full pl-10 pr-9 py-2 rounded-lg border border-gray-200 bg-white shadow-sm text-sm'

  return (
    <div ref={containerRef} className="relative w-full" onFocus={() => !isEmptyQuery && setOpen(true)}>
      <div className="relative">
        <svg
          className={`absolute left-3 text-gray-400 pointer-events-none ${size === 'lg' ? 'w-5 h-5 top-1/2 -translate-y-1/2' : 'w-4 h-4 top-1/2 -translate-y-1/2'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Search products"
          aria-expanded={open}
          className={`${inputCls} pl-11 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setSuggestions([])
              setOpen(false)
              setActiveIndex(-1)
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          {isEmptyQuery ? (
            <div className="px-4 py-3 text-sm text-gray-400">
              Start typing to search products — try &ldquo;burger&rdquo;, &ldquo;solid drive&rdquo; or &ldquo;blouse&rdquo;
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-5 text-center">
              <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm text-gray-500">No matching products found</p>
              <button onClick={() => runSearch(query)} className="mt-3 text-primary-600 text-sm font-medium hover:underline">
                Search full catalog for &ldquo;{query}&rdquo;
              </button>
            </div>
          ) : (
            <>
              <ul role="listbox" className="max-h-80 overflow-y-auto py-1">
                {suggestions.map(({ product: p, pct }, idx) => (
                  <li
                    key={p.id}
                    role="option"
                    aria-selected={idx === activeIndex}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => goProduct(p.id)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                      idx === activeIndex ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="w-10 h-10 object-cover" />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center text-gray-400 text-xs">img</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-sm text-gray-800 font-medium truncate">{p.name}</span>
                    </div>
                    {pct < 100 && (
                      <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${pctBadgeClass(pct)}`}>
                        {pct}%
                      </span>
                    )}
                  </li>
                ))}
                <li
                  role="option"
                  aria-selected={activeIndex === suggestions.length}
                  onMouseEnter={() => setActiveIndex(suggestions.length)}
                  onClick={() => runSearch(query)}
                  className={`px-4 py-2.5 cursor-pointer text-sm text-primary-700 font-semibold border-t border-gray-100 transition-colors ${
                    activeIndex === suggestions.length ? 'bg-primary-50' : ''
                  }`}
                >
                  View all results for &ldquo;{query}&rdquo; →
                </li>
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}