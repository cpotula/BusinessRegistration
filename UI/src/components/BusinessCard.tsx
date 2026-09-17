import { Link } from 'react-router-dom'
import { BusinessSummary } from '../api/types'

const COLORS = [
  'from-blue-500 to-blue-700',
  'from-emerald-500 to-emerald-700',
  'from-violet-500 to-violet-700',
  'from-amber-500 to-amber-700',
  'from-rose-500 to-rose-700',
  'from-cyan-500 to-cyan-700',
]

export default function BusinessCard({ business }: { business: BusinessSummary }) {
  const colorIdx = business.name.charCodeAt(0) % COLORS.length

  return (
    <Link
      to={`/b/${business.slug}`}
      className="group card overflow-hidden hover:-translate-y-0.5 transition-transform duration-300"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {business.logoUrl ? (
            <img src={business.logoUrl} alt={business.name} className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0 ring-1 ring-gray-100" />
          ) : (
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${COLORS[colorIdx]} flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-md`}>
              {business.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors truncate">{business.name}</h3>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
              {business.categoryName}
            </span>
          </div>
        </div>
        {business.description && (
          <p className="mt-3 text-sm text-gray-500 line-clamp-2 leading-relaxed">{business.description}</p>
        )}
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
          {business.city ? (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {business.city}
            </div>
          ) : <span />}
          <span className="text-sm font-semibold text-primary-600 group-hover:text-primary-700 flex items-center gap-1 transition-colors">
            View details
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
