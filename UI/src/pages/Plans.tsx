import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Plan } from '../api/types'
import usePageTitle from '../hooks/usePageTitle'

const FAQS = [
  {
    q: 'How long does it take to create a listing?',
    a: 'Most owners finish in under 10 minutes. Register with your email, follow the guided wizard to add your business details, preview the page and publish it.',
  },
  {
    q: 'Can I edit my business page after publishing?',
    a: 'Yes. Your dashboard lets you update contact details, photos, products, services, business hours and more at any time - changes go live immediately.',
  },
  {
    q: 'What happens when my subscription expires?',
    a: 'Your page is automatically hidden from visitors after expiry. You can renew any time - as soon as the renewal is activated, your listing becomes visible again with all content intact.',
  },
  {
    q: 'How do payments work?',
    a: 'Choose a plan and request a subscription from your dashboard. Online payment integration is coming soon - for now our team will coordinate payment confirmation with you directly.',
  },
  {
    q: 'Will my listing be shared on WhatsApp?',
    a: 'Every business gets a short link that is perfect for WhatsApp sharing. Visitors can also share your page to WhatsApp with one tap.',
  },
]

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const { user } = useAuth()
  const navigate = useNavigate()

  usePageTitle('Plans & Pricing — Enterprise Business Portal')

  useEffect(() => { api.get('/subscriptions/plans').then(({ data }) => setPlans(data)) }, [])

  const benefits = [
    {
      title: 'Get discovered',
      desc: 'Appear in directory search by name, category, service or city',
      tint: 'bg-primary-50 text-primary-600',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /><path d="M8 11h6" /><path d="M11 8v6" /></svg>
      ),
    },
    {
      title: 'Direct enquiries',
      desc: 'Customers call or message you straight from your page',
      tint: 'bg-accent-50 text-accent-600',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /></svg>
      ),
    },
    {
      title: 'Showcase',
      desc: 'Photos, logo, products, services and opening hours',
      tint: 'bg-emerald-50 text-emerald-600',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
      ),
    },
    {
      title: 'WhatsApp ready',
      desc: 'One-tap sharing and chat links for your customers',
      tint: 'bg-green-50 text-green-600',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      ),
    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-16 sm:space-y-24">
      {/* Value proposition */}
      <section className="text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-4">
          <span className="w-2 h-2 rounded-full bg-accent-500" />
          Subscription Plans
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">Get Discovered by Customers<br />Looking for Your Business</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Your own single-page business website - searchable in the directory, shareable on WhatsApp,
          with enquiry forms, product showcases and customer reviews built in.
        </p>
      </section>

      {/* Benefits */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {benefits.map((b) => (
          <div key={b.title} className="bg-white rounded-2xl border border-gray-100 p-5 text-center hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            <div className={`w-12 h-12 rounded-2xl ${b.tint} flex items-center justify-center mx-auto mb-3`}>
              {b.icon}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">{b.title}</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
          <p className="text-gray-500 mt-2">Pick a plan for your year of listing. Silver 10 products · 20 stock each, Gold 25 · 40, Platinum unlimited.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(plans.length ? plans : [{ name: 'Silver', months: 12, amount: 1500, description: 'sell up to 10 products · 20 units of stock each', productLimit: 10, stockLimit: 20 }, { name: 'Gold', months: 12, amount: 2800, description: 'sell up to 25 products · 40 units of stock each', productLimit: 25, stockLimit: 40 }, { name: 'Platinum', months: 12, amount: 5000, description: 'sell unlimited products with unlimited stock', productLimit: null, stockLimit: null }] as Plan[]).map((p) => {
            const featured = p.name === 'Gold'
            return (
              <div key={p.name} className={`relative bg-white rounded-3xl border-2 p-8 flex flex-col ${featured ? 'border-primary-500 shadow-xl' : 'border-gray-200'}`}>
                {featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">Most Popular</span>}
                <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">₹{p.amount.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm"> / year</span>
                </p>
                <p className="text-sm text-gray-500 mt-2 min-h-[40px]">{p.description}</p>
                <ul className="mt-6 space-y-2 text-sm text-gray-600 flex-1">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {p.productLimit == null ? 'Unlimited products for a year' : `List up to ${p.productLimit} products for a year`}
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    {p.stockLimit == null ? 'Unlimited stock can be held per product' : `Up to ${p.stockLimit} units of stock per product`}
                  </li>
                  {['Single-page business profile', 'Directory search & category listing', 'Photo/logo uploads & product showcase', 'Enquiry inbox with notifications', 'WhatsApp share & chat links', 'Business hours & contact details'].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                {!user ? (
                  <Link to="/register" className={`mt-6 block text-center py-3 rounded-xl font-semibold transition-all ${featured ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/45 hover:-translate-y-0.5' : 'border border-primary-200 text-primary-700 hover:bg-primary-50'}`}>
                    List Your Business
                  </Link>
                ) : user.role === 'BusinessOwner' ? (
                  <button onClick={() => navigate('/dashboard?tab=subscription')} className={`mt-6 py-3 rounded-xl font-semibold transition-all ${featured ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/45 hover:-translate-y-0.5' : 'border border-primary-200 text-primary-700 hover:bg-primary-50'}`}>
                    Subscribe from Dashboard
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-10 text-center text-white">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Join businesses already growing with us</h2>
        <p className="text-primary-100 mb-6 max-w-xl mx-auto">Part of an active WhatsApp community of local buyers who discover and recommend businesses every day.</p>
        <Link to="/directory" className="inline-block px-8 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors">Explore the Directory</Link>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3 max-w-3xl mx-auto">
          {FAQS.map((f) => <details key={f.q} className="group bg-white border rounded-2xl p-5 open:shadow-md">
            <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
              {f.q}
              <span className="text-primary-500 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
            </summary>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{f.a}</p>
          </details>)}
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center pb-8">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Ready to list your business?</h2>
        <Link to="/register" className="inline-block px-10 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-lg rounded-xl shadow-xl shadow-primary-500/30 hover:shadow-primary-500/45 hover:-translate-y-0.5 transition-all">
          Create My Free Account
        </Link>
        <p className="text-xs text-gray-400 mt-3">Registration is free - you only pay when you activate a subscription plan.</p>
      </section>
    </div>
  )
}
