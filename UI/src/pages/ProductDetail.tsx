import { useEffect, useState, FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { ProductDetailInfo, ProductReview, ProductReviewsResult } from '../api/types'
import { whatsappChatLink, fmtDate } from '../api/utils'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../cart/CartContext'

// Product Details page - reached from the search results page.
// Shows the product media/description plus its parent business with
// direct contact CTAs and a link to the full business page.
// Viewing is open to everyone; products are added to the cart and
// checkout happens from the cart page. Customers can leave Flipkart-style
// star reviews per product (approved by admins before going live).
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { addItem, count } = useCart()
  const [product, setProduct] = useState<ProductDetailInfo | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [added, setAdded] = useState(false)
  const [reviews, setReviews] = useState<ProductReviewsResult | null>(null)
  const [myReview, setMyReview] = useState<ProductReview | null>(null)
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewSent, setReviewSent] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => setNotFound(true))
    api.get(`/products/${id}/reviews`)
      .then(({ data }) => setReviews(data))
      .catch(() => {})
    if (user) {
      api.get(`/products/${id}/my-review`)
        .then(({ data }) => setMyReview(data ?? null))
        .catch(() => {})
    }
  }, [id, user])

  const submitReview = async (e: FormEvent) => {
    e.preventDefault(); setReviewError('')
    try {
      await api.post(`/products/${id}/reviews`, { rating, reviewText })
      setReviewSent(true)
      setMyReview({ id: 0, customerName: user?.name ?? 'You', rating, reviewText, createdAt: new Date().toISOString(), isVerified: false })
    } catch (err: any) { setReviewError(err.response?.data?.message ?? 'Failed to submit review.') }
  }

  if (notFound) return (
    <div className="text-center py-20">
      <p className="text-gray-500 text-lg">Product not found.</p>
      <Link to="/search" className="text-primary-600 mt-4 inline-block">Back to search</Link>
    </div>
  )
  if (!product) return <div className="text-center py-20"><div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>

  const wa = whatsappChatLink(product.contactWhatsApp ?? product.contactPhone, product.businessName)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link to="/search" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back to search results
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery — Flipkart/Amazon style: image on soft tile + thumbnail rail */}
        <div>
          <div className="product-tile aspect-square rounded-2xl border border-gray-100 shadow-card flex items-center justify-center">
            {product.images.length > 0 ? (
              <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-contain p-4 sm:p-8" />
            ) : (
              <svg className="w-20 h-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            )}
            {(product.stockQuantity ?? 1) <= 0 && (
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-xs font-semibold text-red-600 border border-red-100 shadow-sm">
                Out of stock
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${i === activeImg ? 'border-primary-600 bg-white' : 'border-gray-100 opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-snug">{product.name}</h1>
          <div className="mt-4 bg-gray-50 border border-gray-100 rounded-2xl p-5">
            {product.price != null && (
              <>
                <p className="text-4xl font-extrabold text-gray-900 tracking-tight">₹{product.price.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes · GST invoice available</p>
              </>
            )}
            {(product.stockQuantity ?? 1) <= 0 ? (
              <span className="inline-block mt-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">Out of stock</span>
            ) : (
              <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                In stock · {product.stockQuantity} available
              </span>
            )}
          </div>
          {product.description && (
            <div className="mt-5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed text-[15px]">{product.description}</p>
            </div>
          )}

          {/* Add to cart — checkout happens on the cart page */}
          <div className="mt-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  addItem({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images[0] ?? null,
                    businessName: product.businessName,
                    businessSlug: product.businessSlug,
                  })
                  setAdded(true)
                }}
                disabled={(product.stockQuantity ?? 1) <= 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white text-base font-bold hover:brightness-110 active:scale-95 shadow-lg shadow-primary-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.6 3m0 0L7.3 16a2 2 0 002 1.6h7.4a2 2 0 002-1.6L21 6H6M9.5 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm8 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
                {(product.stockQuantity ?? 1) <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              {count > 0 && (
                <Link to="/cart" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-gray-200 text-gray-700 text-base font-semibold hover:border-primary-300 hover:text-primary-700 transition-colors">
                  View Cart ({count})
                </Link>
              )}
            </div>
            {added && (
              <p className="mt-3 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 animate-fadeIn">
                ✓ {product.name} added to your cart.
              </p>
            )}
          </div>

          {product.videos.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-gray-900">Videos</h3>
              {product.videos.map((v) => (
                <a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 bg-white border rounded-xl hover:border-primary-300 transition-colors">
                  <span className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                  <span className="text-sm font-medium text-gray-700 truncate">{v.title || v.url}</span>
                </a>
              ))}
            </div>
          )}

          {/* Parent business card */}
          <div className="mt-8 card p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Offered by</p>
            <div className="flex items-center gap-4">
              {product.logoUrl ? (
                <img src={product.logoUrl} alt={product.businessName} className="w-14 h-14 rounded-xl object-cover border shadow-sm" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shadow-sm">
                  {product.businessName.charAt(0)}
                </div>
              )}
              <div>
                <Link to={`/b/${product.businessSlug}`} className="font-bold text-gray-900 hover:text-primary-700 transition-colors">{product.businessName}</Link>
                <p className="text-sm text-gray-500">{product.categoryName}{product.city ? ` · ${product.city}` : ''}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              {product.contactPhone && (
                <a href={`tel:${product.contactPhone}`} className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors">Call Now</a>
              )}
              {wa && (
                <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.48 11.815 11.815 0 0012.05 0zm5.422 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
                  WhatsApp
                </a>
              )}
              <Link to={`/b/${product.businessSlug}`} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:border-primary-300 hover:text-primary-700 transition-colors">
                View Business Page
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews — Flipkart/Amazon style */}
      <section className="card p-6 sm:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Ratings &amp; Reviews</h2>
        <div className="flex items-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-5xl font-extrabold text-gray-900">{reviews && reviews.total > 0 ? reviews.averageRating.toFixed(1) : '—'}</p>
            <p className="text-amber-500 text-lg mt-1">
              {reviews && reviews.total > 0 ? ['★'.repeat(Math.round(reviews.averageRating))] : '☆☆☆☆☆'}
            </p>
            <p className="text-xs text-gray-400 mt-1">{reviews ? reviews.total : 0} review{reviews && reviews.total !== 1 ? 's' : ''}</p>
          </div>
          {reviews && reviews.total > 0 && (
            <div className="flex-1 space-y-1 max-w-xs">
              {[5, 4, 3, 2, 1].map((s) => {
                const count = reviews.reviews.filter((r) => r.rating === s).length
                const pct = Math.round((count / reviews.total) * 100)
                return (
                  <div key={s} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-3">{s}</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-5 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {!user && (
          <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 mb-4">
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link> to review this product
          </div>
        )}

        {user && myReview && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-4 text-sm">
            <p className="font-semibold text-gray-900 mb-1">Your review</p>
            <div className="text-amber-500">{'★'.repeat(myReview.rating)}{'☆'.repeat(5 - myReview.rating)}</div>
            {myReview.reviewText && <p className="text-gray-600 mt-1 leading-relaxed">{myReview.reviewText}</p>}
            <p className="text-xs text-gray-400 mt-2">You have already reviewed this product.</p>
          </div>
        )}

        {user && !myReview && (
          reviewSent ? (
            <div className="text-center py-6 mb-4 border border-dashed border-green-200 rounded-xl">
              <p className="text-green-700 font-medium">Thank you! Your review will appear after approval.</p>
            </div>
          ) : (
            <form onSubmit={submitReview} className="space-y-3 mb-5">
              <p className="text-sm text-gray-500">Reviewing as <strong className="text-gray-900">{user.name}</strong></p>
              <div className="flex gap-1 text-3xl">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s} type="button" aria-label={`${s} star`}
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    className={`transition-transform hover:scale-110 ${(hover || rating) >= s ? 'text-amber-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-500 self-center">{rating}/5</span>
              </div>
              <textarea rows={3} placeholder="Share your experience with this product..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="input-field" />
              {reviewError && <p className="text-red-600 text-sm">{reviewError}</p>}
              <button type="submit" className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors">Submit Review</button>
            </form>
          )
        )}

        {reviews && reviews.reviews.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reviews.reviews.map((r) => (
              <div key={r.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium text-sm text-gray-900">{r.customerName}</span>
                  {r.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      Verified Buyer
                    </span>
                  )}
                  <span className="text-amber-500 text-sm ml-auto">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                {r.reviewText && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{r.reviewText}</p>}
                <p className="text-xs text-gray-400 mt-2">{fmtDate(r.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
        {reviews && reviews.total === 0 && <p className="text-sm text-gray-400">No reviews yet — be the first to review this product!</p>}
      </section>
    </div>
  )
}
