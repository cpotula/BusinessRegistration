import { useEffect, useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { BusinessSummary, Category, Announcement, ProductSearchItem } from '../api/types'
import BusinessCard from '../components/BusinessCard'
import ProductCard from '../components/ProductCard'
import SectionHeader from '../components/ui/SectionHeader'
import Reveal from '../components/ui/Reveal'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import CategoryIcon from '../components/ui/CategoryIcon'

const GRID_PATTERN = {
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.11) 1px, transparent 1px)',
  backgroundSize: '26px 26px',
}

const CATEGORY_TINTS = [
  'bg-primary-50 text-primary-600',
  'bg-accent-50 text-accent-600',
  'bg-emerald-50 text-emerald-600',
  'bg-rose-50 text-rose-500',
  'bg-cyan-50 text-cyan-600',
  'bg-amber-50 text-amber-600',
  'bg-violet-50 text-violet-600',
  'bg-teal-50 text-teal-600',
]

const STEPS = [
  {
    title: 'Create your free page',
    desc: 'Register, then add your business details, logo, photos, products and opening hours in under 10 minutes.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6" /><path d="M22 11h-6" />
      </svg>
    ),
  },
  {
    title: 'Get discovered',
    desc: 'Appear in directory search by name, category or city — and share a short WhatsApp-friendly link to your page.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /><path d="M8 11h6" /><path d="M11 8v6" />
      </svg>
    ),
  },
  {
    title: 'Grow & stay visible',
    desc: 'Collect enquiries and reviews, take orders, and pick an affordable plan to keep your page live and ranked.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M3 3v18h18" /><path d="M7 15v-4" /><path d="M12 15V8" /><path d="M17 15v-6" />
      </svg>
    ),
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState<BusinessSummary[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [products, setProducts] = useState<ProductSearchItem[]>([])
  const [totalBiz, setTotalBiz] = useState(0)
  const [cityCount, setCityCount] = useState(0)
  const [query, setQuery] = useState('')

  useEffect(() => {
    api.get('/businesses?page=1&pageSize=6').then(({ data }) => setFeatured(data.items || []))
    api.get('/businesses?page=1&pageSize=1').then(({ data }) => setTotalBiz(data.total || 0))
    api.get('/businesses/cities').then(({ data }) => setCityCount(data.length || 0))
    api.get('/categories').then(({ data }) => setCategories(data))
    api.get('/announcements?take=3').then(({ data }) => setAnnouncements(data))
    api.get('/products/search?page=1&pageSize=16').then(({ data }) => {
      const items = (((data as { items?: ProductSearchItem[] }).items) || []).filter((p) => p.businessId !== 14)
      setProducts(items.slice(0, 8))
    })
  }, [])

  useEffect(() => {
    document.title = 'Enterprise Business Portal — Find Local Businesses, Products & Services'
  }, [])

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim()) navigate(`/directory?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-950 via-primary-800 to-primary-600 text-white shadow-2xl shadow-primary-900/20">
        <div className="absolute inset-0" style={GRID_PATTERN} />
        <div className="absolute -top-24 -right-16 w-96 h-96 bg-primary-400/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-accent-500/25 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/60 via-transparent to-transparent" />

        <div className="relative px-6 sm:px-10 lg:px-14 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm font-medium backdrop-blur-sm animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-accent-400" />
            India's local business marketplace
          </div>

          <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight animate-slide-up">
            Find the Best <br />
            <span className="gradient-text">Local Businesses</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-primary-100 max-w-2xl mx-auto">
            Browse verified businesses, discover products and services, and connect directly with owners in your area.
          </p>

          <form onSubmit={onSearch} className="relative max-w-2xl mx-auto mt-9">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search businesses, products or services…"
              className="w-full rounded-full bg-white text-gray-900 pl-12 pr-28 py-4 shadow-2xl shadow-primary-950/40 outline-none ring-4 ring-white/10 focus:ring-accent-400/40 placeholder:text-gray-400 text-[15px] font-medium"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold shadow-lg shadow-primary-900/30 hover:from-primary-500 hover:to-primary-400 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" /></svg>
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <span className="text-sm text-primary-100 font-medium">Popular:</span>
            {categories.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                to={`/directory?categoryId=${c.id}`}
                className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-white hover:bg-white/20 transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </div>

          <div className="max-w-2xl mx-auto mt-12 pt-8 border-t border-white/15 grid grid-cols-3 gap-4">
            {[
              { value: totalBiz, suffix: '+', label: 'Live Businesses' },
              { value: categories.length, suffix: '', label: 'Categories' },
              { value: cityCount, suffix: '+', label: 'Cities Served' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-2xl sm:text-3xl font-bold">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs sm:text-sm text-primary-100 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Categories ===== */}
      <section>
        <Reveal>
          <SectionHeader
            eyebrow="Categories"
            title="Browse by Category"
            subtitle="Find businesses organized by what they offer"
            linkTo="/directory"
            linkText="View directory"
          />
        </Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={(i % 4) * 60}>
              <Link
                to={`/directory?categoryId=${c.id}`}
                className="group card p-5 flex items-center gap-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-12 h-12 shrink-0 rounded-2xl ${CATEGORY_TINTS[i % CATEGORY_TINTS.length]} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <CategoryIcon slug={c.slug} className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors">{c.name}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    Browse listings
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Products & Services ===== */}
      {products.length > 0 && (
        <section>
          <Reveal>
            <SectionHeader
              eyebrow="Marketplace"
              title="Products &amp; Services"
              subtitle="Everything our listed businesses offer"
              linkTo="/search"
              linkText="View all products"
            />
          </Reveal>
          <Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  to={`/products/${p.id}`}
                  name={p.name}
                  price={p.price}
                  imageUrl={p.imageUrl}
                  stockQuantity={p.stockQuantity}
                  subtitle={p.businessName}
                  rating={p.averageRating}
                  reviewCount={p.reviewCount}
                />
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ===== Featured Businesses ===== */}
      {featured.length > 0 && (
        <section>
          <Reveal>
            <SectionHeader
              eyebrow="Featured"
              title="Featured Businesses"
              subtitle="Top-rated businesses in your area"
              linkTo="/directory"
              linkText="View all"
            />
          </Reveal>
          <Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ===== How it works ===== */}
      <section>
        <Reveal>
          <SectionHeader
            eyebrow="How it works"
            title="Three steps to a visible business"
            subtitle="From first page to loyal customers — everything you need is built in."
          />
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <div className="card-static hover-lift relative p-7 h-full overflow-hidden">
                <span className="absolute -top-1 right-3 font-display text-[84px] leading-none font-bold text-primary-50 select-none">
                  {i + 1}
                </span>
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/30 mb-5">
                    {s.icon}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Announcements ===== */}
      {announcements.length > 0 && (
        <section>
          <Reveal>
            <SectionHeader eyebrow="Updates" title="Latest Announcements" />
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.map((a, i) => (
              <Reveal key={a.id} delay={(i % 3) * 80}>
                <div className="card-static h-full p-6 border-l-4 border-l-primary-500">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                    </span>
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">Announcement</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{a.title}</h3>
                  {a.message && <p className="text-sm text-gray-600 line-clamp-3">{a.message}</p>}
                  <p className="text-xs text-gray-400 mt-3">{new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white px-8 py-14 sm:px-14 sm:py-16 text-center shadow-2xl shadow-primary-900/20">
            <div className="absolute inset-0" style={GRID_PATTERN} />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-72 bg-primary-400/30 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Ready to Grow Your Business?</h2>
              <p className="text-primary-100 mb-8 max-w-xl mx-auto text-base sm:text-lg">
                Create your own business page in minutes, get discovered by local customers and the WhatsApp community, and keep it fresh with affordable plans.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/plans"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold text-lg rounded-xl shadow-xl hover:bg-primary-50 hover:-translate-y-0.5 transition-all"
                >
                  See Plans &amp; Pricing
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all"
                >
                  Register Free Account
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}