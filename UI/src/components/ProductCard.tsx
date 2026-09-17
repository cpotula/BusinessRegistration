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
}: {
  to: string
  name: string
  price: number | null
  imageUrl?: string | null
  stockQuantity?: number
  subtitle?: string | null
}) {
  const out = (stockQuantity ?? 1) <= 0

  return (
    <Link
      to={to}
      className="group card overflow-hidden hover:-translate-y-0.5 transition-transform duration-300"
    >
      <div className="product-tile aspect-square flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={name} loading="lazy" className="w-full h-full object-cover" />
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
        <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 min-h-[2.6rem] group-hover:text-primary-700 transition-colors">
          {name}
        </h3>
        {subtitle && <p className="text-xs text-gray-400 truncate mt-1">{subtitle}</p>}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          {price != null ? (
            <p className="text-primary-700 font-extrabold text-lg leading-none tracking-tight">
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