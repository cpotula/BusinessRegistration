import { useState } from 'react'
import { Link } from 'react-router-dom'

// Flipkart / Amazon style product card: square image tile on a soft
// marketplace background, two-line name, bold price and stock state.
// Shared by Home, product search and business detail pages.
export default function ProductCard({
  to,
  name,
  price,
  imageUrl,
  stockQuantity,
  subtitle,
  rating,
  reviewCount,
  accent,
}: {
  to: string
  name: string
  price: number | null
  imageUrl?: string | null
  stockQuantity?: number
  subtitle?: string | null
  rating?: number
  reviewCount?: number
  /** Optional business-theme accent classes for price + title hover. */
  accent?: { price?: string; titleHover?: string }
}) {
  const out = (stockQuantity ?? 1) <= 0
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = !!imageUrl && !imgFailed
  const hasReviews = (reviewCount ?? 0) > 0 && (rating ?? 0) > 0
  const priceCls = accent?.price ?? 'text-primary-700'
  const titleHoverCls = accent?.titleHover ?? 'group-hover:text-primary-700'

  return (
    <Link
      to={to}
      className="group card overflow-hidden hover:-translate-y-0.5 transition-transform duration-300"
    >
      <div className="product-tile aspect-square flex items-center justify-center">
        {showImage ? (
          <img src={imageUrl} alt={name} loading="lazy" onError={() => setImgFailed(true)} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        {out && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white text-[11px] font-semibold text-red-600 border border-red-100 shadow-sm">
            Out of stock
          </span>
        )}
      </div>
      <div className="p-3.5">
        <h3 className={`text-sm font-semibold text-gray-800 leading-snug line-clamp-2 min-h-[2.6rem] transition-colors ${titleHoverCls}`}>
          {name}
        </h3>
        {subtitle && <p className="text-xs text-gray-400 truncate mt-1">{subtitle}</p>}
        {hasReviews ? (
          <p className="flex items-center gap-1 text-xs mt-1.5">
            <span className="text-amber-500 text-[13px] leading-none">{'★'.repeat(Math.max(1, Math.min(5, Math.round(rating!))))}</span>
            <span className="text-amber-500 text-[13px] leading-none">{'☆'.repeat(5 - Math.round(rating!))}</span>
            <span className="font-bold text-gray-800 ml-0.5">{rating!.toFixed(1)}</span>
            <span className="text-gray-400">({reviewCount!} review{reviewCount === 1 ? '' : 's'})</span>
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-1.5">☆ Not yet rated</p>
        )}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          {price != null ? (
            <p className={`${priceCls} font-extrabold text-lg leading-none tracking-tight`}>
              ₹{price.toLocaleString('en-IN')}
            </p>
          ) : (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Price on request</p>
          )}
          {!out && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold border border-green-100">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              In stock
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}