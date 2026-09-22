import { useEffect, useState, FormEvent, ReactNode, CSSProperties } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { BusinessDetail as BusinessDetailType, BusinessSummary, Product } from '../api/types'
import { whatsappChatLink, shareBusiness, subscriptionState, subscriptionBadge, fmtDate } from '../api/utils'
import { getTheme, BusinessTheme } from '../themes'
import ProductCard from '../components/ProductCard'
import usePageTitle from '../hooks/usePageTitle'

// The public Business Detail Page is the primary product of the platform -
// the destination reached from search, WhatsApp shares and category browsing.
export interface MyReview { id: number; customerName: string; rating: number; reviewText: string | null; createdAt: string; isVerified: boolean }

export default function BusinessDetailPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>()
  const { user } = useAuth()
  const [business, setBusiness] = useState<BusinessDetailType | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [related, setRelated] = useState<BusinessSummary[]>([])
  const [notFound, setNotFound] = useState(false)
  const [notOwner, setNotOwner] = useState(false)
  const [enquiry, setEnquiry] = useState({ name: '', email: '', phone: '', message: '' })
  const [enquirySent, setEnquirySent] = useState(false)
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewSent, setReviewSent] = useState(false)
  const [myReview, setMyReview] = useState<MyReview | null>(null)
  const [error, setError] = useState('')
  const [shared, setShared] = useState('')

  usePageTitle(business ? `${business.name} — Enterprise Business Portal` : 'Business Page — Enterprise Business Portal')

  useEffect(() => {
    let cancelled = false
    let resolvedBizId: number | undefined
    // RBAC: business owners may only open listings they registered themselves.
    const ownershipCheck =
      user?.role === 'BusinessOwner'
        ? api.get('/businesses/my').then(({ data }) => {
            const mine = (data as BusinessSummary[]).some((b) => b.slug === slug || String(b.id) === id)
            if (!mine) {
              const err = new Error('forbidden') as any
              err.notOwner = true
              throw err
            }
          })
        : Promise.resolve()

    const fetchUrl = slug ? `/businesses/slug/${slug}` : `/businesses/${id}`
    ownershipCheck
      .then(() => api.get(fetchUrl))
      .then(({ data }) => {
        if (cancelled) return
        resolvedBizId = data.id
        setBusiness(data)
        return Promise.all([
          api.get(`/products?businessId=${data.id}`),
          api.get(`/businesses/${data.id}/related`),
        ])
      })
      .then((pair) => {
        if (!pair || cancelled) return
        setProducts(pair[0].data)
        setRelated(pair[1].data)
        if (user && resolvedBizId) return api.get(`/testimonials/mine?businessId=${resolvedBizId}`).then(({ data: mine }) => {
          if (!cancelled) setMyReview(mine ?? null)
        })
      })
      .catch((err: any) => {
        if (cancelled) return
        if (err?.notOwner) setNotOwner(true)
        else setNotFound(true)
      })
    return () => { cancelled = true }
  }, [slug, id, user?.role])

  const submitEnquiry = async (e: FormEvent) => {
    e.preventDefault(); setError('')
    try {
      await api.post(`/enquiries?businessId=${business!.id}`, enquiry)
      setEnquirySent(true)
    } catch (err: any) { setError(err.response?.data?.message ?? 'Failed to send.') }
  }

  const submitReview = async (e: FormEvent) => {
    e.preventDefault(); setError('')
    try {
      await api.post(`/testimonials?businessId=${business!.id}`, { rating, reviewText })
      setReviewSent(true)
      setMyReview({ id: 0, customerName: user?.name ?? 'You', rating, reviewText, createdAt: new Date().toISOString(), isVerified: false })
    } catch (err: any) { setError(err.response?.data?.message ?? 'Failed to submit.') }
  }

  const doShare = async () => {
    if (!business) return
    await shareBusiness(business.name, window.location.href)
    setShared('Link ready to paste in WhatsApp!')
    setTimeout(() => setShared(''), 2500)
  }

  if (notOwner) return <Navigate to="/dashboard" replace />
  if (notFound) return (
    <div className="text-center py-20">
      <p className="text-gray-500 text-lg">Business not found.</p>
      <Link to="/directory" className="text-primary-600 mt-4 inline-block">Back to Directory</Link>
    </div>
  )
  if (!business) return <div className="text-center py-20"><div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>

  const t: BusinessTheme = getTheme(business.theme)

  const wa = whatsappChatLink(business.contactWhatsApp ?? business.contactPhone, business.name)
  const sub = subscriptionBadge(subscriptionState(business.subscriptionExpiresOn, business.isActive), business.subscriptionExpiresOn)
  const isPreview = !business.isPublished || !business.isActive
  const canManagePreview = isPreview && !!user && (user.role === 'Admin' || user.role === 'BusinessOwner')

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link to="/directory" className={`inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors ${t.link}`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back to Directory
      </Link>

      {canManagePreview && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800 flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          Preview mode — this page is <strong>{!business.isPublished ? 'not published' : 'disabled'}</strong> and hidden from public visitors.
        </div>
      )}

      <article className="card overflow-hidden">
        {/* Theme accent strip — instant visual identity for this business. */}
        <div className={`h-1.5 w-full ${t.topBar}`} />
        {business.coverUrl ? (
          <div className="relative h-56 sm:h-72">
            <img src={business.coverUrl} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
          </div>
        ) : (
          <div className={`relative h-40 sm:h-56 bg-gradient-to-br ${t.gradient}`}>
            <div className="absolute inset-0 opacity-15">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-72 h-40 bg-white rounded-full blur-3xl" />
            </div>
          </div>
        )}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={business.name}
                className={`w-24 h-24 rounded-2xl object-cover shadow-card ring-4 ring-white ${t.logoRing} shrink-0 ${business.coverUrl ? '-mt-16 sm:-mt-20 relative' : ''}`}
              />
            ) : (
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-4xl font-bold shadow-card ring-4 ring-white ${t.logoRing} shrink-0 ${business.coverUrl ? '-mt-16 sm:-mt-20 relative' : ''}`}>
                {business.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className={`text-3xl font-bold ${t.heading} break-words tracking-tight`} style={{ fontFamily: t.fontHeading }}>{business.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.chip}`}>{business.categoryName}</span>
                {business.averageRating > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.363 1.118l1.287 3.958c.3.922-.755 1.688-1.539 1.118l-3.367-2.447a1 1 0 00-1.176 0l-3.367 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.958a1 1 0 00-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z" /></svg>
                    {business.averageRating.toFixed(1)}
                    <span className="text-amber-600/70 font-medium">· {business.testimonials.length} review{business.testimonials.length !== 1 ? 's' : ''}</span>
                  </span>
                )}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${sub.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sub.dot}`} />{sub.label}
                </span>
                {business.city && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {business.city}
                  </span>
                )}
                <span className="text-xs text-gray-400">{business.productCount} product{business.productCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <button onClick={doShare} className="px-4 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors flex items-center gap-1.5 shrink-0 shadow-md shadow-green-200/60 active:scale-[0.98]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Share
            </button>
          </div>
          {shared && <p className="mt-2 text-xs text-green-600">{shared}</p>}
          {business.description && <p className="mt-6 text-gray-700 leading-relaxed whitespace-pre-line">{business.description}</p>}

          {/* Prominent contact CTAs: Call / WhatsApp / Email / Website */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {business.contactPhone && (
              <a href={`tel:${business.contactPhone}`} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${t.btnPrimary}`}>
                📞 Call
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.463 3.5 11.816 11.816 0 0012.05 0zm5.422 17.382c-.23.636-1.334 1.216-1.838 1.264-.504.048-.963.096-2.754-.572-2.08-.792-3.43-2.904-3.535-3.039-.105-.135-.862-1.144-.862-2.183 0-1.039.552-1.55.744-1.76.192-.21.414-.262.552-.262.144 0 .288.006.414.012.132.006.31-.05.486.37.18.43.618 1.512.672 1.62.054.108.09.234.018.372-.072.138-.144.24-.288.39-.144.15-.302.334-.432.448-.144.126-.294.262-.126.53.168.267.756 1.217 1.608 1.958 1.104.96 2.028 1.26 2.316 1.404.288.144.456.12.624-.072.168-.192.72-.828.912-1.11.192-.288.384-.24.642-.144.258.096 1.638.774 1.92.912.282.138.468.21.534.324.066.114.066.66-.164 1.296z"/></svg>
                WhatsApp
              </a>
            )}
            {business.contactEmail && (
              <a href={`mailto:${business.contactEmail}`} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${t.btnSecondary}`}>
                ✉️ Email
              </a>
            )}
            {business.websiteUrl && (
              <a href={business.websiteUrl} target="_blank" rel="noreferrer" className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${t.btnSecondary}`}>
                🌐 Website
              </a>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(business.address || business.city) && <InfoItem icon="📍" label="Address" value={`${business.address || ''}${business.address && business.city ? ', ' : ''}${business.city || ''}`} panel={t.panel} />}
            {business.businessHours && <InfoItem icon="🕒" label="Business Hours" value={business.businessHours} panel={t.panel} />}
            {business.contactPhone && <InfoItem icon="📞" label="Phone" value={business.contactPhone} panel={t.panel} />}
            {business.contactEmail && <InfoItem icon="✉️" label="Email" value={business.contactEmail} panel={t.panel} />}
          </div>
        </div>
      </article>

      {/* Products & Services */}
      {products.length > 0 && (
        <section>
          <SectionHeading style={{ fontFamily: t.fontHeading }} className={t.heading} accent={t.topBar}>
            Products &amp; Services
          </SectionHeading>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                to={`/products/${p.id}`}
                name={p.name}
                price={p.price}
                imageUrl={p.images[0] ?? null}
                stockQuantity={p.stockQuantity}
                rating={p.averageRating}
                reviewCount={p.reviewCount}
                accent={{ price: t.price, titleHover: t.titleHover }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Enquiry & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6 sm:p-8">
          <SectionHeading small style={{ fontFamily: t.fontHeading }} className={t.heading} accent={t.topBar}>
            Send an Enquiry
          </SectionHeading>
          {enquirySent ? successBox('Your enquiry has been sent!') : (
            <form onSubmit={submitEnquiry} className="space-y-3">
              <input required placeholder="Your name" value={enquiry.name} onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })} className={inputCls} />
              <input required type="email" placeholder="Email" value={enquiry.email} onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })} className={inputCls} />
              <input placeholder="Phone (optional)" value={enquiry.phone} onChange={(e) => setEnquiry({ ...enquiry, phone: e.target.value })} className={inputCls} />
              <textarea required rows={3} placeholder="Your message" value={enquiry.message} onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })} className={inputCls} />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button type="submit" className={`w-full py-3 rounded-xl font-semibold transition-colors ${t.btnPrimary}`}>Send Enquiry</button>
            </form>
          )}
        </div>

        <div className="card p-6 sm:p-8">
          <SectionHeading small style={{ fontFamily: t.fontHeading }} className={t.heading} accent={t.topBar}>
            Customer Reviews
          </SectionHeading>
          <div className="text-sm text-gray-500 mb-5">
            {business.averageRating > 0 ? (
              <span><span className="text-2xl font-bold text-gray-900 mr-1">{business.averageRating.toFixed(1)}</span><span className="text-amber-500 mr-2">{'★'.repeat(Math.round(business.averageRating))}</span>{business.testimonials.length} review{business.testimonials.length !== 1 ? 's' : ''}</span>
            ) : (
              <span>No reviews yet — be the first!</span>
            )}
          </div>

          {!user && (
            <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
              <Link to="/login" className={`font-semibold hover:underline ${t.link}`}>Sign in</Link> to review this business
            </div>
          )}

          {user && myReview && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-4 text-sm">
              <p className="font-semibold text-gray-900 mb-1">Your review</p>
              <div className="text-amber-500">{'★'.repeat(myReview.rating)}{'☆'.repeat(5 - myReview.rating)}</div>
              {myReview.reviewText && <p className="text-gray-600 mt-1 leading-relaxed">{myReview.reviewText}</p>}
              <p className="text-xs text-gray-400 mt-2">You have already reviewed this business.</p>
            </div>
          )}

          {user && !myReview && (
            reviewSent ? successBox('Thank you! Your review will appear after approval.') : (
              <form onSubmit={submitReview} className="space-y-3">
                <p className="text-sm text-gray-500">Reviewing as <strong className="text-gray-900">{user.name ?? 'Customer'}</strong></p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
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
                </div>
                <textarea rows={3} placeholder="What did you like or dislike about this business?" value={reviewText} onChange={(e) => setReviewText(e.target.value)} className={inputCls} />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button type="submit" className={`w-full py-3 rounded-xl font-semibold transition-colors ${t.btnPrimary}`}>Submit Review</button>
              </form>
            )
          )}

          {user && !myReview && !reviewSent && <p className="text-xs text-gray-400 mt-2">Reviews appear after the owner approves them.</p>}

          {business.testimonials.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3" style={{ fontFamily: t.fontHeading }}>All reviews</h3>
              <div className="space-y-3">
                {business.testimonials.map((tm) => (
                  <div key={tm.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-medium text-sm text-gray-900">{tm.customerName}</span>
                      {tm.isVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          Verified Buyer
                        </span>
                      )}
                      <span className="text-amber-500 text-sm ml-auto">{'★'.repeat(tm.rating)}{'☆'.repeat(5 - tm.rating)}</span>
                    </div>
                    {tm.reviewText && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{tm.reviewText}</p>}
                    <p className="text-xs text-gray-400 mt-2">{fmtDate(tm.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Businesses - keep the visitor discovering */}
      {related.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6 gap-4">
            <SectionHeading flat style={{ fontFamily: t.fontHeading }} className={t.heading} accent={t.topBar}>
              Similar Businesses
            </SectionHeading>
            <Link to="/directory" className={`font-medium text-sm ${t.link}`}>Browse all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((b) => (
              <Link key={b.id} to={`/b/${b.slug}`} className="group bg-white rounded-2xl border overflow-hidden p-4 hover:border-primary-300 hover:shadow-md transition-all">
                <div className={`h-1 w-10 rounded-full mb-3 ${getTheme(b.theme).topBar}`} />
                <h3 className="font-semibold text-gray-900 truncate">{b.name}</h3>
                <p className={`text-xs mt-1 ${getTheme(b.theme).link}`}>{b.categoryName}</p>
                {b.city && <p className="text-xs text-gray-400 mt-1">📍 {b.city}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-gray-400 text-center pb-4">Listing ID #{business.id} · Last verified status: {sub.label.replace('Active — ', '').replace('Expired — ', '')} · {fmtDate(business.subscriptionExpiresOn) !== '-' ? `Valid till ${fmtDate(business.subscriptionExpiresOn)}` : 'Subscription pending'}</p>
    </div>
  )
}

const inputCls = 'input-field'

function SectionHeading({
  children,
  small,
  flat,
  accent,
  className,
  style,
}: {
  children: ReactNode
  small?: boolean
  flat?: boolean
  accent?: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <h2
      className={`${flat ? '' : small ? 'text-lg sm:text-xl mb-4' : 'text-2xl mb-6'} font-bold flex items-center gap-2.5 ${className ?? 'text-gray-900'}`}
      style={style}
    >
      <span className={`inline-block w-1.5 h-5 rounded-full shrink-0 ${accent ?? 'bg-primary-500'}`} />
      {children}
    </h2>
  )
}

function successBox(msg: string) {
  return (
    <div className="text-center py-8">
      <svg className="w-12 h-12 mx-auto text-green-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <p className="text-green-700 font-medium">{msg}</p>
    </div>
  )
}

function InfoItem({ icon, label, value, panel }: { icon: string; label: string; value: string; panel?: string }) {
  return (
    <div className={`rounded-xl p-4 ${panel ?? 'bg-gray-50'}`}>
      <p className="text-xs text-gray-400 uppercase font-medium mb-1">{icon} {label}</p>
      <p className="text-sm text-gray-800 break-words">{value}</p>
    </div>
  )
}
