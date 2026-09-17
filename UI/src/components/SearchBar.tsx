import { useEffect, useMemo, useRef, useState, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { services, searchServices, tokenize } from '../data/services'

interface Props {
  placeholder?: string
  size?: 'md' | 'lg'
  onNavigate?: () => void
}

// Amazon-style search autocomplete with a suggestions dropdown.
function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = tokenize(query)
  if (tokens.length === 0) return <>{text}</>

  const lower = text.toLowerCase()
  const parts: { text: string; match: boolean }[] = []
  let i = 0

  while (i < lower.length) {
    // Find the earliest token match starting at or after i.
    let bestMatch = -1
    let bestLen = 0
    for (const t of tokens) {
      const idx = lower.indexOf(t, i)
      if (idx !== -1 && (bestMatch === -1 || idx < bestMatch || (idx === bestMatch && t.length > bestLen))) {
        bestMatch = idx
        bestLen = t.length
      }
    }
    if (bestMatch === -1) {
      parts.push({ text: text.slice(i), match: false })
      break
    }
    if (bestMatch > i) parts.push({ text: text.slice(i, bestMatch), match: false })
    parts.push({ text: text.slice(bestMatch, bestMatch + bestLen), match: true })
    i = bestMatch + bestLen
  }

  return (
    <>
      {parts.map((p, idx) =>
        p.match ? (
          <span key={idx} className="text-primary-700 font-semibold">{p.text}</span>
        ) : (
          <span key={idx}>{p.text}</span>
        ),
      )}
    </>
  )
}

export default function SearchBar({ placeholder = 'Search services...', size = 'md', onNavigate }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => searchServices(query, 8), [query])
  const isEmptyQuery = query.trim().length === 0

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
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
    setOpen(false)
    setActiveIndex(-1)
    onNavigate?.()
  }

  const selectSuggestion = (item: (typeof services)[number]) => {
    runSearch(item.search)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (results.length > 0) {
          e.preventDefault()
          setOpen(true)
          setActiveIndex(e.key === 'ArrowDown' ? 0 : results.length - 1)
        }
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < results.length) {
        selectSuggestion(results[activeIndex])
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
          aria-label="Search services"
          aria-expanded={open}
          className={`${inputCls} pl-11 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
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
              Start typing to see matching services
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-5 text-center">
              <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm text-gray-500">No matching services found</p>
            </div>
          ) : (
            <ul role="listbox" className="max-h-96 overflow-y-auto py-1">
              {results.map((item, idx) => (
                <li
                  key={item.id}
                  role="option"
                  aria-selected={idx === activeIndex}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => selectSuggestion(item)}
                  className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                    idx === activeIndex ? 'bg-primary-50' : ''
                  }`}
                >
                  <svg
                    className={`mt-0.5 flex-shrink-0 ${size === 'lg' ? 'w-4 h-4' : 'w-4 h-4'} text-gray-400`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <div className="min-w-0">
                    <span className="block text-sm text-gray-800">
                      <Highlight text={item.title} query={query} />
                    </span>
                    {size === 'lg' && (
                      <span className="block text-xs text-gray-400 truncate">{item.description}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
