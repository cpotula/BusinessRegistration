import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BusinessSummary } from '../api/types'
import { getTheme } from '../themes'

export default function BusinessCard({ business }: { business: BusinessSummary }) {
  const t = getTheme(business.theme)
  const [coverFailed, setCoverFailed] = useState(false)
  const cover = business.coverUrl && !coverFailed ? business.coverUrl : null
  const rating = business.averageRating > 0 ? business.averageRating : null

  return (
    <Link
      to={`/b/${business.slug}`}
      className="group card overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      {/* Cover band */}
      <div className="relative h-28 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt=""
            loading="lazy"
            onError={() => setCoverFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${t.gradient} opacity-90`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />
        {rating != null && (
          <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/95 backdrop-blur text-xs font-bold text-gray-900 shadow-md">
            <span className="text-amber-500">★</span>
            {rating.toFixed(1)}
          </span>
        )}
        <span className={`absolute inset-x-0 bottom-0 h-1 ${t.topBar}`} />
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-3">
          {business.logoUrl ? (
            <img
              src={business.logoUrl}
              alt={business.name}
              loading="lazy"
              className={`w-11 h-11 rounded-xl object-cover bg-white ring-4 ring-white -mt-9 shadow-lg shrink-0`}
            />
          ) : (
            <div className={`w-11 h-11 rounded-xl bg-white ring-4 ring-white -mt-9 bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-lg font-bold shadow-lg shrink-0`}>
              {business.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 pt-1">
            <h3 className={`font-semibold text-gray-900 leading-tight truncate transition-colors ${t.titleHover}`}>{business.name}</h3>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${t.chip}`}>
              {business.categoryName}
            </span>
          </div>
        </div>

        {business.description && (
          <p className="mt-3 text-sm text-gray-500 line-clamp-2 leading-relaxed flex-1">{business.description}</p>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          {business.city ? (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {business.city}
            </div>
          ) : <span />}
          <span className={`text-sm font-semibold flex items-center gap-1 transition-colors ${t.link}`}>
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