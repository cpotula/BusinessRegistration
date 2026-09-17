import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { BusinessSummary, Category, Announcement, ProductSearchItem } from '../api/types'
import BusinessCard from '../components/BusinessCard'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [featured, setFeatured] = useState<BusinessSummary[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [products, setProducts] = useState<ProductSearchItem[]>([])

  useEffect(() => {
    api.get('/businesses?page=1&pageSize=6').then(({ data }) => setFeatured(data.items || []))
    api.get('/categories').then(({ data }) => setCategories(data))
    api.get('/announcements?take=3').then(({ data }) => setAnnouncements(data))
    api.get('/products/search?page=1&pageSize=16').then(({ data }) => {
      const items = (((data as { items?: ProductSearchItem[] }).items) || []).filter((p) => p.businessId !== 14)
      setProducts(items.slice(0, 8))
    })
  }, [])

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="relative px-8 sm:px-12 py-16 sm:py-24 text-center">
          <div className="inline-block px-4 py-1.5 bg-white/15 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            Trusted by local businesses
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Find the Best<br />Local Businesses
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Browse hundreds of verified businesses, discover products and services, and connect
            directly with owners in your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/directory"
              className="px-8 py-4 rounded-xl bg-white text-primary-700 font-semibold text-lg hover:bg-primary-50 shadow-xl transition-all hover:-translate-y-0.5"
            >
              Explore Directory
            </Link>
            <Link
              to="/plans"
              className="px-8 py-4 rounded-xl border-2 border-white/40 text-white font-semibold text-lg hover:bg-white/10 transition-all"
            >
              List Your Business
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-primary-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Easy Listing
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Instant Visibility
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              24/7 Online
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
          <p className="text-gray-500 mt-2">Find businesses organized by what they offer</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              to={`/directory?categoryId=${c.id}`}
              className="group card p-6 text-center hover:-translate-y-0.5 transition-transform duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${['from-blue-400 to-blue-600','from-emerald-400 to-emerald-600','from-rose-400 to-rose-600','from-amber-400 to-amber-600','from-violet-400 to-violet-600','from-cyan-400 to-cyan-600','from-pink-400 to-pink-600','from-teal-400 to-teal-600'][i % 8]} flex items-center justify-center text-white text-2xl mx-auto mb-3 group-hover:scale-110 shadow-lg shadow-black/5 group-hover:-rotate-6 transition-all duration-300`}>
                {['🍽️','🛍️','💆','🏠','💻','📚','🚗','🏢'][i % 8]}
              </div>
              <h3 className="font-semibold text-gray-800 group-hover:text-primary-700 transition-colors">{c.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Products & Services */}
      {products.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Products &amp; Services</h2>
              <p className="text-gray-500 mt-1">Everything our listed businesses offer</p>
            </div>
            <Link to="/search" className="text-primary-600 font-medium text-sm hover:text-primary-700 flex items-center gap-1 transition-colors">
              View all
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
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
              />
            ))}
          </div>
        </section>
      )}

      {/* Featured Businesses */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Businesses</h2>
              <p className="text-gray-500 mt-1">Top-rated businesses in your area</p>
            </div>
            <Link to="/directory" className="text-primary-600 font-medium text-sm hover:text-primary-700 flex items-center gap-1 transition-colors">
              View all
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </section>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Latest Announcements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.map((a) => (
              <div key={a.id} className="bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                  </div>
                  <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">Announcement</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{a.title}</h3>
                {a.message && <p className="text-sm text-gray-600 line-clamp-3">{a.message}</p>}
                <p className="text-xs text-gray-400 mt-3">{new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-10 sm:p-16 text-center text-white">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Grow Your Business?</h2>
        <p className="text-gray-300 mb-8 max-w-xl mx-auto text-lg">
          Create your own business page in minutes, get discovered by local customers and the WhatsApp community, and keep it fresh with affordable subscription plans.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/plans"
            className="inline-block px-8 py-4 bg-primary-500 text-white font-semibold text-lg rounded-xl hover:bg-primary-400 shadow-xl transition-all hover:-translate-y-0.5"
          >
            See Plans &amp; Pricing
          </Link>
          <Link
            to="/register"
            className="inline-block px-8 py-4 border-2 border-white/30 text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all"
          >
            Register Free Account
          </Link>
        </div>
      </section>
    </div>
  )
}
