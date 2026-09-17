import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Plan } from '../api/types'

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

  useEffect(() => { api.get('/subscriptions/plans').then(({ data }) => setPlans(data)) }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-16">
      {/* Value proposition */}
      <section className="text-center">
        <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-4">Subscription Plans</span>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Get Discovered by Customers<br />Looking for Your Business</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Your own single-page business website - searchable in the directory, shareable on WhatsApp,
          with enquiry forms, product showcases and customer reviews built in.
        </p>
      </section>

      {/* Benefits */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['🔎', 'Get discovered', 'Appear in directory search by name, category, service or city'],
          ['💬', 'Direct enquiries', 'Customers call or message you straight from your page'],
          ['🖼️', 'Showcase', 'Photos, logo, products, services and opening hours'],
          ['📲', 'WhatsApp ready', 'One-tap sharing and chat links for your customers'],
        ].map(([icon, title, desc]) => (
          <div key={title} className="bg-white rounded-2xl border p-5 text-center">
            <div className="text-2xl mb-2">{icon}</div>
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">{desc}</p>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
          <p className="text-gray-500 mt-2">All plans include the complete feature set. Choose your billing period.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(plans.length ? plans : [{ name: 'Quarterly', months: 3, amount: 1500, description: '' }, { name: 'Half-Yearly', months: 6, amount: 2800, description: '' }, { name: 'Annual', months: 12, amount: 5000, description: '' }] as Plan[]).map((p) => {
            const featured = p.name === 'Half-Yearly'
            return (
              <div key={p.name} className={`relative bg-white rounded-3xl border-2 p-8 flex flex-col ${featured ? 'border-primary-500 shadow-xl' : 'border-gray-200'}`}>
                {featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">Most Popular</span>}
                <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">₹{p.amount.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm"> / {p.months} months</span>
                </p>
                <p className="text-sm text-gray-500 mt-2 min-h-[40px]">{p.description}</p>
                <ul className="mt-6 space-y-2 text-sm text-gray-600 flex-1">
                  {['Single-page business profile', 'Directory search & category listing', 'Photo/logo uploads & product showcase', 'Enquiry inbox with notifications', 'WhatsApp share & chat links', 'Business hours & contact details'].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                {!user ? (
                  <Link to="/register" className={`mt-6 block text-center py-3 rounded-xl font-semibold transition-colors ${featured ? 'bg-primary-600 text-white hover:bg-primary-700' : 'border border-primary-200 text-primary-700 hover:bg-primary-50'}`}>
                    List Your Business
                  </Link>
                ) : user.role === 'BusinessOwner' ? (
                  <button onClick={() => navigate('/dashboard?tab=subscription')} className={`mt-6 py-3 rounded-xl font-semibold transition-colors ${featured ? 'bg-primary-600 text-white hover:bg-primary-700' : 'border border-primary-200 text-primary-700 hover:bg-primary-50'}`}>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to list your business?</h2>
        <Link to="/register" className="inline-block px-10 py-4 bg-primary-600 text-white font-semibold text-lg rounded-xl hover:bg-primary-700 shadow-lg transition-all hover:-translate-y-0.5">
          Create My Free Account
        </Link>
        <p className="text-xs text-gray-400 mt-3">Registration is free - you only pay when you activate a subscription plan.</p>
      </section>
    </div>
  )
}
