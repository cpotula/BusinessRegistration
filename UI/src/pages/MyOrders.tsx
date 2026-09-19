import { useState, useEffect, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { api } from '../api/client'
import { OrderInfo, OrderItemInfo } from '../api/types'
import OrderStatusBar, { ORDER_STATUS_LABELS, OrderStatus } from '../components/OrderStatusBar'

function inr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

interface ReviewTarget {
  productId: number
  productName: string
  businessName: string
  imageUrl: string | null
}

export default function MyOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null)
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewMsg, setReviewMsg] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewedIds, setReviewedIds] = useState<number[]>([])

  useEffect(() => {
    if (!user) return
    api.get('/orders/my').then(({ data }) => setOrders(data)).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  const openReview = (it: OrderItemInfo) => {
    setReviewTarget({ productId: it.productId, productName: it.productName, businessName: it.businessName, imageUrl: it.imageUrl })
    setRating(5); setHover(0); setReviewText(''); setReviewMsg(''); setReviewError('')
  }

  const submitReview = async (e: FormEvent) => {
    e.preventDefault()
    if (!reviewTarget) return
    setSubmitting(true); setReviewMsg(''); setReviewError('')
    try {
      await api.post(`/products/${reviewTarget.productId}/reviews`, { rating, reviewText })
      setReviewMsg('Thank you! Your review has been posted.')
      setReviewedIds((ids) => [...ids, reviewTarget.productId])
    } catch (err: any) {
      setReviewError(err.response?.data?.message ?? 'Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const isReviewed = (it: OrderItemInfo) => it.reviewedByMe || reviewedIds.includes(it.productId)

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-2xl border">
        <div className="text-5xl mb-4">📦</div>
        <h1 className="text-2xl font-bold text-gray-900">Login to see your orders</h1>
        <p className="text-gray-500 mt-2">Track and follow up on your order requests here.</p>
        <Link to="/login" className="inline-block mt-6 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
          Login
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Orders</h1>
      <p className="text-gray-500 text-sm mb-6">Your order requests and their confirmation status.</p>

      {loading ? <p className="text-gray-500">Loading your orders…</p> : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-gray-500">You have not placed any orders yet.</p>
          <Link to="/directory" className="inline-block mt-5 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
            Browse Directory
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const total = o.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0)
            const st = o.status as OrderStatus
            const label = ORDER_STATUS_LABELS[st] ?? o.status
            return (
              <div key={o.id} className="bg-white rounded-2xl border overflow-hidden">
                <div className={`px-5 py-3 flex flex-wrap justify-between gap-2 items-center ${st === 'Delivered' ? 'bg-green-50' : st === 'Pending' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Order #{o.orderNumber}</p>
                    <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st === 'Pending' ? 'bg-amber-500 text-white' : st === 'Delivered' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                    {o.status === 'Pending' ? 'Pending — awaiting seller confirmation' : label}
                  </span>
                </div>
                <div className="px-5 py-4">
                  <ul className="space-y-3">
                    {o.items.map((it) => (
                      <li key={it.id} className="rounded-xl border border-gray-100 p-3">
                        <div className="flex items-center gap-3">
                          {it.imageUrl && <img src={it.imageUrl} alt={it.productName} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{it.productName}</p>
                            <p className="text-xs text-gray-400">{it.businessName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{it.quantity} × {inr(it.unitPrice)}</p>
                          </div>
                          <span className="text-sm font-medium text-gray-800">{inr(it.unitPrice * it.quantity)}</span>
                        </div>
                        {st === 'Delivered' && (
                          isReviewed(it) ? (
                            <span className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              Reviewed
                            </span>
                          ) : (
                            <button
                              onClick={() => openReview(it)}
                              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-full px-3 py-1 hover:bg-primary-100 transition-colors"
                            >
                              <span className="text-amber-400">★</span> Rate &amp; Review this product
                            </button>
                          )
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t flex justify-between text-sm font-semibold text-gray-900">
                    <span>Total</span><span>{inr(total)}</span>
                  </div>
                  {o.deliveryAddress && (
                    <div className="mt-3 rounded-xl bg-primary-50 border border-primary-100 px-4 py-3 text-sm">
                      <p className="text-xs font-bold uppercase tracking-wide text-primary-700 mb-1">🚚 Deliver to</p>
                      <p className="text-sm font-medium text-gray-900">{o.deliveryName}</p>
                      {o.deliveryPhone && <p className="text-xs text-gray-600 mt-0.5">{o.deliveryPhone}</p>}
                      <p className="text-xs text-gray-600 mt-0.5">{o.deliveryAddress}</p>
                    </div>
                  )}
                  <div className="mt-4">
                    <OrderStatusBar status={o.status} />
                  </div>
                  {o.status === 'Pending' && (
                    <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      Awaiting seller confirmation. You'll be notified as soon as the seller confirms your order.
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !submitting && setReviewTarget(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-slide-down">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                {reviewTarget.imageUrl && <img src={reviewTarget.imageUrl} alt={reviewTarget.productName} className="w-12 h-12 rounded-xl object-cover bg-gray-100" />}
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 leading-tight truncate">{reviewTarget.productName}</p>
                  <p className="text-xs text-gray-400">{reviewTarget.businessName}</p>
                </div>
              </div>
              <button onClick={() => !submitting && setReviewTarget(null)} aria-label="Close" className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {reviewMsg ? (
              <div className="text-center py-8 border border-dashed border-green-200 rounded-xl">
                <div className="text-4xl mb-2">🎉</div>
                <p className="font-medium text-green-700">{reviewMsg}</p>
              </div>
            ) : (
              <form onSubmit={submitReview} className="space-y-4">
                <p className="text-sm text-gray-500">How was this product? Share your rating and a short review so other customers can trust your experience.</p>
                <div className="flex gap-1 text-4xl justify-center">
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
                </div>
                <p className="text-center text-sm text-gray-500 font-medium">{rating}/5</p>
                <textarea
                  rows={4}
                  placeholder="What did you like or dislike? (optional)"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  maxLength={2000}
                  className="input-field"
                />
                {reviewError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{reviewError}</p>}
                <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
                <p className="text-xs text-gray-400 text-center">Your review is posted instantly on the product page — only verified buyers can review, so no approval is needed.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}