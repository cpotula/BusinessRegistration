import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import { services, searchServices } from '../data/services'
import usePageTitle from '../hooks/usePageTitle'

export default function Services() {
  usePageTitle('Our Services — Enterprise Business Portal')
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const visible = query.trim() ? searchServices(query, 50) : services

  const submit = (e: FormEvent) => {
    e.preventDefault()
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="space-y-10">
      <div className="text-center space-y-4">
        <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
          Business &amp; Legal Services
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Registration &amp; Compliance Services
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Company registration, business licenses, tax registration, trademark and startup services —
          all in one place.
        </p>
        <div className="max-w-xl mx-auto">
          <SearchBar size="lg" placeholder='Try "business", "company" or "startup"... ' onNavigate={() => {}} />
        </div>
      </div>

      {query && (
        <p className="text-center text-sm text-gray-500">
          {visible.length} service{visible.length === 1 ? '' : 's'} match &ldquo;{query}&rdquo;
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(`/search?q=${encodeURIComponent(item.search)}`)}
            className="group text-left bg-white border border-gray-200 rounded-2xl p-5 hover:border-primary-300 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                {item.title}
              </h3>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">{item.description}</p>
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <form onSubmit={submit} className="text-center py-16 bg-white rounded-2xl border">
          <p className="text-gray-500 mb-4">No matching services found for &ldquo;{query}&rdquo;.</p>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            Search full catalog instead
          </button>
        </form>
      )}
    </div>
  )
}
