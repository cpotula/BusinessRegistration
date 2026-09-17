import { useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { BusinessSummary, BusinessDetail, Category, Enquiry, Product, Subscription, Testimonial, Plan, OrderInfo, SoldSummary, SoldByPeriod, SoldPeriodPoint } from '../api/types'
import { subscriptionState, subscriptionBadge, daysUntil, fmtDate, completeness } from '../api/utils'
import OrderStatusBar, { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, ORDER_STATUS_BADGE, OrderStatus } from '../components/OrderStatusBar'

type Tab = 'overview' | 'edit' | 'products' | 'inventory' | 'reports' | 'subscription' | 'reviews' | 'enquiries' | 'orders'

const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

export default function OwnerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) || 'overview')
  const [wizard, setWizard] = useState(params.get('new') === '1')
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    if (user?.role !== 'BusinessOwner') { navigate('/login'); return }
    api.get('/categories').then(({ data }) => setCategories(data))
    reload().then((list) => {
      if (list.length > 0) setSelectedId(list[0].id)
      else setWizard(true)
    })
  }, [])

  const reload = async (): Promise<BusinessSummary[]> => {
    const { data } = await api.get('/businesses/my')
    setBusinesses(data)
    return data
  }

  const selectBusiness = async (id: number | null) => {
    setSelectedId(id)
    setTab('overview')
    setParams({})
  }

  const switchTab = (t: Tab) => {
    setTab(t)
    if (params.get('tab')) setParams({})
  }

  // Notifications: subscription expiry warnings (doc requirement).
  const notice = businesses.reduce((worst, b) => {
    if (!b.subscriptionExpiresOn) return worst
    const d = daysUntil(b.subscriptionExpiresOn)
    return worst === null || d < worst ? d : worst
  }, null as number | null)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <Link to="/plans" className="text-sm font-medium text-primary-600 hover:text-primary-700">View plans &amp; pricing →</Link>
      </div>

      {notice !== null && notice <= 14 && (
        <button onClick={() => switchTab('subscription')} className={`w-full text-left mb-6 rounded-2xl border px-5 py-4 text-sm font-medium transition-colors ${notice < 0 ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' : 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100'}`}>
          {notice < 0
            ? `⚠️ A listing subscription has expired (${fmtDate(businesses.find((b) => b.subscriptionExpiresOn && daysUntil(b.subscriptionExpiresOn) === notice)?.subscriptionExpiresOn)}). Your page is hidden from visitors until renewed.`
            : `⏳ Subscription expiring in ${notice} day${notice === 1 ? '' : 's'} — renew now to keep your page visible.`}
          <span className="underline ml-2">Renew →</span>
        </button>
      )}

      {!wizard && (
        <>
          <div className="flex flex-wrap gap-2 mb-5">
            {businesses.map((b) => (
              <button key={b.id} onClick={() => selectBusiness(b.id)} className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${selectedId === b.id ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-200/60' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-700'}`}>
                {b.name}
                {b.isActive && b.subscriptionExpiresOn && daysUntil(b.subscriptionExpiresOn) >= 0 ? '' : ' ⚠'}
              </button>
            ))}
            <button onClick={() => setWizard(true)} className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${wizard ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border border-dashed border-gray-300 hover:border-primary-400 hover:text-primary-700'}`}>+ New Business</button>
          </div>

          {selectedId != null && (
            <>
              <div className="lg:flex lg:gap-6">
                <aside className="lg:w-60 shrink-0 mb-4 lg:mb-0">
                  <div className="card p-2 flex flex-col gap-1">
                    {([
                      ['overview', 'Overview'],
                      ['inventory', 'Inventory'],
                      ['products', 'Products & Services'],
                      ['orders', 'Orders'],
                      ['reports', 'Reports'],
                      ['edit', 'Edit Page'],
                      ['subscription', 'Subscription'],
                      ['reviews', 'Reviews'],
                      ['enquiries', 'Enquiries'],
                    ] as [Tab, string][]).map(([t, label]) => (
                      <button key={t} onClick={() => switchTab(t)} className={`px-3.5 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200 ${tab === t ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-200/60' : 'text-gray-600 hover:bg-primary-50/70 hover:text-primary-700'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </aside>
                <div className="flex-1 min-w-0">
                  {tab === 'overview' && <OverviewSec bizId={selectedId} summary={businesses.find((b) => b.id === selectedId)} />}
                  {tab === 'inventory' && <InventorySec bizId={selectedId} />}
                  {tab === 'products' && <ProductsSec bizId={selectedId} />}
                  {tab === 'orders' && <OrdersSec />}
                  {tab === 'reports' && <ReportsSec bizId={selectedId} />}
                  {tab === 'edit' && <BizEditor key={selectedId} bizId={selectedId} cats={categories} onChanged={async () => { await reload() }} />}
                  {tab === 'subscription' && <SubSec bizId={selectedId} />}
                  {tab === 'reviews' && <TestSec bizId={selectedId} />}
                  {tab === 'enquiries' && <EnqSec />}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {wizard && (
        <Wizard
          cats={categories}
          onCancel={businesses.length > 0 ? () => setWizard(false) : undefined}
          onCreated={async (id) => {
            await reload()
            setSelectedId(id)
            setWizard(false)
          }}
        />
      )}
    </div>
  )
}

/* ---------- Reusable image upload ---------- */

function UploadField({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setBusy(true); setErr('')
    try {
      const fd = new FormData()
      fd.append('file', f)
      const { data } = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onChange(data.url)
    } catch (ex: any) {
      setErr(ex.response?.data?.message ?? 'Upload failed.')
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative">
            <img src={value} alt="" className="w-20 h-20 rounded-xl object-cover border" />
            <button type="button" onClick={() => onChange('')} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs leading-none">×</button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
        <label className="cursor-pointer px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          {busy ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
          <input type="file" accept="image/*" className="hidden" onChange={pick} disabled={busy} />
        </label>
      </div>
      {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
    </div>
  )
}

/* ---------- Overview ---------- */

function OverviewSec({ bizId, summary }: { bizId: number; summary?: BusinessSummary }) {
  const navigate = useNavigate()
  const [detail, setDetail] = useState<BusinessDetail | null>(null)

  useEffect(() => {
    api.get(`/businesses/${bizId}`).then(({ data }) => setDetail(data)).catch(() => {})
  }, [bizId])

  if (!detail) return <p className="text-sm text-gray-500">Loading…</p>

  const c = completeness(detail)
  const sub = subscriptionBadge(subscriptionState(detail.subscriptionExpiresOn, detail.isActive), detail.subscriptionExpiresOn)

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{detail.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Unambiguous subscription state */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${sub.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sub.dot}`} />{sub.label}
              </span>
              {!detail.isActive ? (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                  Pending admin approval — not shown on the website yet
                </span>
              ) : (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${detail.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {detail.isPublished ? 'Published — visible to public' : 'Draft — hidden from public'}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.open(`/b/${detail.slug}`, '_blank')} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Preview page ↗</button>
            {detail.isActive && !detail.isPublished && (
              <button
                onClick={async () => { await api.put(`/businesses/${bizId}/publish`, { isPublished: true }); const { data } = await api.get(`/businesses/${bizId}`); setDetail(data) }}
                className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
              >
                Publish Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Completeness indicator */}
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Listing completeness</h3>
          <span className={`text-sm font-bold ${c.percent >= 80 ? 'text-green-600' : c.percent >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>{c.percent}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div className={`h-full rounded-full transition-all ${c.percent >= 80 ? 'bg-green-500' : c.percent >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${c.percent}%` }} />
        </div>
        {c.missing.length === 0 ? (
          <p className="text-sm text-green-600">Complete! Your listing has everything visitors look for.</p>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-2">Add these to get more customer enquiries:</p>
            <div className="flex flex-wrap gap-2">
              {c.missing.map((m) => <span key={m} className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">{m}</span>)}
            </div>
          </div>
        )}
        <button onClick={() => navigate(`/dashboard?tab=${c.missing.includes('Products / services') ? 'products' : 'edit'}`)} className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700">Improve listing →</button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[['Category', summary.categoryName], ['City', summary.city || '—'], ['Products', String(detail.productCount)], ['Reviews', String(detail.testimonials.length)]].map(([k, v]) => (
            <div key={k} className="stat-card">
              <p className="text-xs text-gray-500">{k}</p>
              <p className="font-semibold text-gray-900 mt-1 truncate">{v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- Onboarding wizard (Register -> Create -> Preview -> Publish) ---------- */

interface WizardFields {
  name: string; categoryId: number; description: string
  contactPhone: string; contactWhatsApp: string; contactEmail: string
  address: string; city: string; websiteUrl: string; businessHours: string
  logoUrl: string; coverUrl: string
}

function Wizard({ cats, onCreated, onCancel }: { cats: Category[]; onCreated: (id: number) => void; onCancel?: () => void }) {
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [f, setF] = useState<WizardFields>({
    name: '', categoryId: cats[0]?.id ?? 1, description: '',
    contactPhone: '', contactWhatsApp: '', contactEmail: '',
    address: '', city: '', websiteUrl: '', businessHours: '',
    logoUrl: '', coverUrl: '',
  })
  const set = (patch: Partial<WizardFields>) => setF({ ...f, ...patch })

  const steps = ['Basics', 'Contact & Hours', 'Photos', 'Preview & Publish']
  const canNext = step !== 0 || (f.name.trim().length > 1)

  const submit = async (publish: boolean) => {
    setBusy(true); setErr('')
    try {
      const { data: id } = await api.post('/businesses', { ...f, isPublished: publish })
      onCreated(id)
    } catch (ex: any) {
      setErr(ex.response?.data?.message ?? 'Could not create the business.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Create your business page</h2>
      <p className="text-sm text-gray-500 mb-6">Guided setup — you can edit everything later.</p>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-primary-700' : 'text-gray-400'}`}>{s}</span>
            {i < steps.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? 'bg-green-400' : 'bg-gray-100'}`} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Business name *</label>
            <input autoFocus value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Spice Junction Restaurant" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Category *</label>
            <select value={f.categoryId} onChange={(e) => set({ categoryId: Number(e.target.value) })} className={inputCls}>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Short description</label>
            <textarea rows={3} value={f.description} onChange={(e) => set({ description: e.target.value })} placeholder="What makes your business special?" className={inputCls} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Phone</label><input value={f.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} placeholder="98765 43210" className={inputCls} /></div>
          <div><label className={labelCls}>WhatsApp number</label><input value={f.contactWhatsApp} onChange={(e) => set({ contactWhatsApp: e.target.value })} placeholder="Same as phone?" className={inputCls} /><p className="text-xs text-gray-400 mt-1">Customers get a one-tap chat button.</p></div>
          <div><label className={labelCls}>Email</label><input type="email" value={f.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} placeholder="you@business.com" className={inputCls} /></div>
          <div><label className={labelCls}>Website</label><input value={f.websiteUrl} onChange={(e) => set({ websiteUrl: e.target.value })} placeholder="https://…" className={inputCls} /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Address</label><input value={f.address} onChange={(e) => set({ address: e.target.value })} placeholder="Shop no, street, area" className={inputCls} /></div>
          <div><label className={labelCls}>City</label><input value={f.city} onChange={(e) => set({ city: e.target.value })} placeholder="Hyderabad" className={inputCls} /></div>
          <div><label className={labelCls}>Business hours</label><input value={f.businessHours} onChange={(e) => set({ businessHours: e.target.value })} placeholder="Mon-Sat: 9 AM - 8 PM" className={inputCls} /></div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <UploadField label="Logo (square works best)" value={f.logoUrl} onChange={(url) => set({ logoUrl: url })} />
          <UploadField label="Cover photo (wide banner)" value={f.coverUrl} onChange={(url) => set({ coverUrl: url })} />
          <p className="text-xs text-gray-400">Optional — pages without photos get an automatic branded look.</p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-2xl border p-5 bg-gray-50">
            <div className="flex items-center gap-4">
              {f.logoUrl ? <img src={f.logoUrl} className="w-14 h-14 rounded-xl object-cover" alt="" /> : <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-xl font-bold">{(f.name || '?').charAt(0)}</div>}
              <div>
                <p className="font-bold text-gray-900">{f.name || 'Your Business'}</p>
                <p className="text-xs text-primary-600">{cats.find((c) => c.id === f.categoryId)?.name}</p>
                {(f.city || f.contactPhone) && <p className="text-xs text-gray-400">{[f.address, f.city].filter(Boolean).join(', ')}{f.contactPhone ? ` · 📞 ${f.contactPhone}` : ''}</p>}
              </div>
            </div>
            {f.description && <p className="text-sm text-gray-600 mt-3">{f.description}</p>}
          </div>
          <p className="text-sm text-gray-500">After creating, your business will be sent to the administrator for approval. It will appear on the website to everyone only after the admin approves it.</p>
        </div>
      )}

      {err && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg mt-4">{err}</p>}

      <div className="flex items-center justify-between mt-8">
        <div className="flex gap-2">
          {step > 0 && <button onClick={() => setStep(step - 1)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Back</button>}
          {onCancel && step === 0 && <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50">Cancel</button>}
        </div>
        {step < steps.length - 1 ? (
          <button disabled={!canNext} onClick={() => setStep(step + 1)} className="px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-40">Continue</button>
        ) : (
          <div className="flex gap-2">
            <button disabled={busy} onClick={() => submit(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-40">Save as Draft</button>
            <button disabled={busy} onClick={() => submit(true)} className="px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-40">{busy ? 'Creating…' : 'Submit for Approval'}</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Profile editor ---------- */

function BizEditor({ bizId, cats, onChanged }: { bizId: number; cats: Category[]; onChanged: () => Promise<void> }) {
  const [f, setF] = useState({
    name: '', categoryId: cats[0]?.id ?? 1, description: '',
    contactPhone: '', contactWhatsApp: '', contactEmail: '',
    address: '', city: '', websiteUrl: '', businessHours: '',
    logoUrl: '', coverUrl: '', isPublished: true,
  })
  const [loadedSlug, setLoadedSlug] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const set = (patch: Partial<typeof f>) => setF({ ...f, ...patch })

  useEffect(() => {
    api.get(`/businesses/${bizId}`).then(({ data }: { data: BusinessDetail }) => {
      setLoadedSlug(data.slug)
      setF({
        name: data.name,
        categoryId: cats.find((c) => c.name === data.categoryName)?.id ?? cats[0]?.id ?? 1,
        description: data.description ?? '',
        contactPhone: data.contactPhone ?? '',
        contactWhatsApp: data.contactWhatsApp ?? '',
        contactEmail: data.contactEmail ?? '',
        address: data.address ?? '',
        city: data.city ?? '',
        websiteUrl: data.websiteUrl ?? '',
        businessHours: data.businessHours ?? '',
        logoUrl: data.logoUrl ?? '',
        coverUrl: data.coverUrl ?? '',
        isPublished: data.isPublished,
      })
    })
  }, [bizId, cats])

  const save = async (e: FormEvent) => {
    e.preventDefault(); setMsg(''); setErr('')
    try {
      await api.put(`/businesses/${bizId}`, f)
      await onChanged()
      setMsg('Saved! Changes are live on your page.')
    } catch (ex: any) { setErr(ex.response?.data?.message ?? 'Error saving.') }
  }

  const togglePublish = async () => {
    await api.put(`/businesses/${bizId}/publish`, { isPublished: !f.isPublished })
    setF({ ...f, isPublished: !f.isPublished })
    setMsg(f.isPublished ? 'Page unpublished — hidden from visitors.' : 'Page published — visible to everyone!')
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-5 bg-white rounded-2xl border p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Business profile</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${f.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {f.isPublished ? '● Published' : '○ Draft'}
        </span>
      </div>

      <div><label className={labelCls}>Business name *</label><input required value={f.name} onChange={(e) => set({ name: e.target.value })} className={inputCls} /></div>
      <div>
        <label className={labelCls}>Category *</label>
        <select value={f.categoryId} onChange={(e) => set({ categoryId: Number(e.target.value) })} className={inputCls}>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div><label className={labelCls}>Description</label><textarea rows={4} value={f.description} onChange={(e) => set({ description: e.target.value })} className={inputCls} /></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={labelCls}>Phone</label><input value={f.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} className={inputCls} /></div>
        <div><label className={labelCls}>WhatsApp number</label><input value={f.contactWhatsApp} onChange={(e) => set({ contactWhatsApp: e.target.value })} className={inputCls} /></div>
        <div><label className={labelCls}>Email</label><input value={f.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} className={inputCls} /></div>
        <div><label className={labelCls}>Website URL</label><input value={f.websiteUrl} onChange={(e) => set({ websiteUrl: e.target.value })} className={inputCls} /></div>
        <div><label className={labelCls}>Address</label><input value={f.address} onChange={(e) => set({ address: e.target.value })} className={inputCls} /></div>
        <div><label className={labelCls}>City</label><input value={f.city} onChange={(e) => set({ city: e.target.value })} className={inputCls} /></div>
        <div className="sm:col-span-2"><label className={labelCls}>Business hours</label><input value={f.businessHours} onChange={(e) => set({ businessHours: e.target.value })} placeholder="Mon-Sat: 9 AM - 8 PM" className={inputCls} /></div>
      </div>

      <UploadField label="Logo" value={f.logoUrl} onChange={(url) => set({ logoUrl: url })} />
      <UploadField label="Cover photo" value={f.coverUrl} onChange={(url) => set({ coverUrl: url })} />

      {msg && <p className="text-green-700 text-sm bg-green-50 px-4 py-2 rounded-lg">{msg}</p>}
      {err && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{err}</p>}

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" className="px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700">Save Changes</button>
        <button type="button" onClick={togglePublish} className={`px-6 py-3 rounded-xl font-semibold border ${f.isPublished ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}>
          {f.isPublished ? 'Unpublish' : 'Publish'}
        </button>
        <a href={`/b/${loadedSlug}`} target="_blank" rel="noreferrer" className="px-6 py-3 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50">Preview ↗</a>
      </div>
    </form>
  )
}

/* ---------- Products & services ---------- */

function ProductsSec({ bizId }: { bizId: number }) {
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState(''); const [desc, setDesc] = useState(''); const [price, setPrice] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => api.get(`/products?businessId=${bizId}`).then(({ data }) => setProducts(data))
  useEffect(() => { load() }, [bizId])

  const add = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true)
    try {
      await api.post(`/products?businessId=${bizId}`, { name, description: desc, price: price ? Number(price) : null })
      setName(''); setDesc(''); setPrice('')
      load()
    } finally { setBusy(false) }
  }

  const del = async (id: number) => {
    if (confirm('Delete this product/service?')) { await api.delete(`/products/${id}`); load() }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="bg-white rounded-2xl border p-6 max-w-2xl space-y-3">
        <h2 className="text-xl font-bold text-gray-900">Add product / service</h2>
        <input required placeholder="Name (e.g. Chicken Biryani)" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        <textarea rows={2} placeholder="Short description" value={desc} onChange={(e) => setDesc(e.target.value)} className={inputCls} />
        <input placeholder="Price in ₹ (optional)" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} />
        <button type="submit" disabled={busy} className="px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50">Add</button>
        <p className="text-xs text-gray-500">Newly added products need admin approval and will show on the website only after approval.</p>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((p) => <ProductCard key={p.id} product={p} onDeleted={() => del(p.id)} onChanged={load} />)}
      </div>
      {products.length === 0 && <p className="text-sm text-gray-500">No products yet. Add your first offering above.</p>}
    </div>
  )
}

function ProductCard({ product, onDeleted, onChanged }: { product: Product; onDeleted: () => void; onChanged: () => void }) {
  const [uploading, setUploading] = useState(false)

  const addPhotos = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploading(true)
    try {
      const urls: string[] = []
      for (const f of files.slice(0, 4)) {
        const fd = new FormData()
        fd.append('file', f)
        const { data } = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        urls.push(data.url)
      }
      if (urls.length > 0) await api.post(`/products/${product.id}/images`, urls)
      onChanged()
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="bg-white rounded-2xl border p-5">
      <div className="flex justify-between items-start">
        <div className="min-w-0 pr-2">
          <h3 className="font-semibold text-gray-900">{product.name}
            {!product.isApproved && <span className="ml-2 align-middle text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Pending approval</span>}
            {product.isApproved && <span className="ml-2 align-middle text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">Live</span>}
          </h3>
          {product.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>}
          {product.price != null && <p className="text-primary-700 font-semibold mt-1">₹{product.price.toLocaleString()}</p>}
        </div>
        <button onClick={onDeleted} className="text-sm text-red-600 hover:underline shrink-0">Delete</button>
      </div>

      {product.images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {product.images.map((url, i) => <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover border" />)}
        </div>
      )}

      <label className="inline-block cursor-pointer mt-3 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50">
        {uploading ? 'Uploading…' : '＋ Add photos'}
        <input type="file" accept="image/*" multiple className="hidden" onChange={addPhotos} disabled={uploading} />
      </label>
    </div>
  )
}

/* ---------- Subscription ---------- */

function SubSec({ bizId }: { bizId: number }) {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [detail, setDetail] = useState<BusinessDetail | null>(null)
  const [usage, setUsage] = useState<{ planName: string | null; productLimit: number | null; productCount: number; remaining: number | null }>({ planName: null, productLimit: null, productCount: 0, remaining: null })
  const [notice, setNotice] = useState('')
  const [busyPlan, setBusyPlan] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/subscriptions/my'),
      api.get('/subscriptions/plans'),
      api.get(`/businesses/${bizId}`),
      api.get(`/subscriptions/usage?businessId=${bizId}`),
    ]).then(([s, p, d, u]) => { setSubs(s.data); setPlans(p.data); setDetail(d.data); setUsage(u.data) })
  }, [bizId])

  const renew = async (planName: string) => {
    setBusyPlan(planName); setNotice('')
    try {
      const { data } = await api.post('/subscriptions/renew', { businessId: bizId, planName })
      setNotice(data.message)
      const { data: subs } = await api.get('/subscriptions/my')
      setSubs(subs)
    } catch (ex: any) {
      setNotice(ex.response?.data?.message ?? 'Could not create renewal request.')
    } finally {
      setBusyPlan('')
    }
  }

  if (!detail) return <p className="text-sm text-gray-500">Loading…</p>

  const state = subscriptionState(detail.subscriptionExpiresOn, detail.isActive)
  const badge = subscriptionBadge(state, detail.subscriptionExpiresOn)
  const mySubs = subs.filter((s) => s.businessId === bizId)
  const hasPending = mySubs.some((s) => s.paymentStatus === 'Pending')

  return (
    <div className="max-w-3xl space-y-6">
      {/* Unambiguous subscription status */}
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Subscription status</h2>
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${badge.cls}`}>
          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />{badge.label}
        </span>
        {usage.planName && (
          <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900">
                Current plan: <span className="text-primary-700">{usage.planName}</span>
              </p>
              <p className="text-sm text-gray-500">
                {usage.productLimit == null
                  ? 'Unlimited products'
                  : `${usage.productCount} / ${usage.productLimit} products used`}
              </p>
            </div>
            {usage.productLimit != null && (
              <>
                <div className="mt-2 h-2.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500"
                    style={{ width: `${Math.min((usage.productCount / usage.productLimit) * 100, 100)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  {usage.remaining === 0
                    ? 'You have reached your product limit. Upgrade to add more products.'
                    : `You can add ${usage.remaining} more product${usage.remaining === 1 ? '' : 's'}.`}
                </p>
              </>
            )}
          </div>
        )}
        {state !== 'active' && (
          <p className="text-sm text-gray-500 mt-3">
            {state === 'expired'
              ? 'Your page is currently hidden from visitors. Choose a plan below to request reactivation.'
              : 'You have no subscription yet. Choose a plan below.'}
          </p>
        )}
      </div>

      {/* Renewal: Select Plan -> Pay -> Activate */}
      {!hasPending && (
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Renew / choose a plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plans.map((p) => (
              <div key={p.name} className="rounded-2xl border-2 border-gray-100 p-5 flex flex-col hover:border-primary-300 transition-colors">
                <p className="font-bold text-gray-900">{p.name}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-2">₹{p.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-400">per year</p>
                <p className="mt-2 text-xs font-medium text-gray-600">
                  {p.productLimit == null ? 'Unlimited products' : `Up to ${p.productLimit} products`}
                </p>
                <button
                  onClick={() => renew(p.name)}
                  disabled={busyPlan !== ''}
                  className="mt-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50"
                >
                  {busyPlan === p.name ? 'Requesting…' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasPending && (
        <div className="rounded-2xl bg-yellow-50 border border-yellow-200 px-5 py-4 text-sm text-yellow-800">
          ⏳ A renewal request is awaiting payment confirmation. Online payment is coming soon — please coordinate with the administrator to activate it.
        </div>
      )}
      {notice && !hasPending && <p className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">{notice}</p>}

      {/* Payment history */}
      <div className="bg-white rounded-2xl border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">History</h3>
        {mySubs.length === 0 ? <p className="text-sm text-gray-500">No subscriptions yet.</p> : (
          <div className="space-y-3">
            {mySubs.map((s) => (
              <div key={s.id} className="border rounded-xl p-4 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-sm">{s.planName} — ₹{s.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{fmtDate(s.startDate)} → {fmtDate(s.endDate)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  s.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                  s.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'}`}>
                  {s.paymentStatus}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Reviews ---------- */

function TestSec({ bizId }: { bizId: number }) {
  const [tests, setTests] = useState<Testimonial[]>([])
  useEffect(() => { api.get(`/businesses/${bizId}`).then(({ data }) => setTests(data.testimonials || [])) }, [bizId])
  return (
    <div className="bg-white rounded-2xl border p-6 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Customer reviews</h2>
      {tests.length === 0 ? <p className="text-gray-500">No approved reviews yet. Ask happy customers to leave one!</p> : (
        <div className="space-y-3">
          {tests.map((t) => (
            <div key={t.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex justify-between"><span className="font-medium text-sm">{t.customerName}</span><span className="text-amber-500 text-sm">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</span></div>
              {t.reviewText && <p className="text-sm text-gray-600 mt-2">{t.reviewText}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- Enquiries ---------- */

function EnqSec() {
  const [enqs, setEnqs] = useState<Enquiry[]>([])
  const load = () => api.get('/enquiries').then(({ data }) => setEnqs(data))
  useEffect(() => { load() }, [])
  const markRead = async (id: number) => { await api.put(`/enquiries/${id}/read`); load() }

  return (
    <div className="bg-white rounded-2xl border p-6 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Customer enquiries</h2>
      {enqs.length === 0 ? <p className="text-gray-500">No enquiries yet. Keep your listing complete to attract more!</p> : (
        <div className="space-y-3">
          {enqs.map((e) => (
            <div key={e.id} className={`border rounded-xl p-4 ${e.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex justify-between gap-2">
                <p className="font-medium text-sm break-all">{e.name} <span className="text-gray-400">({e.email}){e.phone ? ` · ${e.phone}` : ''}</span></p>
                {!e.isRead && <button onClick={() => markRead(e.id)} className="text-xs text-primary-600 hover:underline shrink-0">Mark read</button>}
              </div>
              <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{e.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(e.createdAt).toLocaleString()} · via {e.businessName}</p>
              {(e.email || e.phone) && (
                <div className="flex gap-2 mt-2">
                  {e.phone && <a href={`tel:${e.phone}`} className="text-xs font-medium text-primary-600 hover:underline">Call</a>}
                  {e.phone && <a href={`https://wa.me/91${e.phone.replace(/\D/g, '').slice(-10)}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-green-600 hover:underline">WhatsApp</a>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function inr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

function OrdersSec() {
  const [orders, setOrders] = useState<OrderInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [advancingId, setAdvancingId] = useState<number | null>(null)
  useEffect(() => {
    api.get('/orders/for-my-businesses').then(({ data }) => setOrders(data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const setStatus = async (id: number, status: OrderStatus) => {
    setAdvancingId(id)
    try {
      const { data } = await api.put(`/orders/${id}/status`, { status })
      setOrders((os) => os.map((o) => (o.id === data.id ? data : o)))
    } catch (ex: any) {
      alert(ex.response?.data?.message ?? 'Could not update the order status.')
    } finally {
      setAdvancingId(null)
    }
  }

  if (loading) return <div className="bg-white rounded-2xl border p-6 max-w-3xl"><p className="text-gray-500">Loading orders…</p></div>

  return (
    <div className="bg-white rounded-2xl border p-6 max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Order requests</h2>
      <p className="text-sm text-gray-500 mb-4">Orders placed by users for your products. Move each order through the fulfilment steps (confirmed → packed → in transit → out for delivery → delivered) — the customer gets a message at every step.</p>
      {orders.length === 0 ? <p className="text-gray-500">No order requests yet.</p> : (
        <div className="space-y-4">
          {orders.map((o) => {
            const sub = o.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0)
            const oidx = Math.max(ORDER_STATUS_FLOW.indexOf(o.status as OrderStatus), 0)
            return (
              <div key={o.id} className="border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex flex-wrap justify-between gap-2 items-center">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Order #{o.orderNumber}</p>
                    <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ORDER_STATUS_BADGE[o.status as OrderStatus] ?? 'bg-gray-100 text-gray-700'}`}>
                      {oidx >= 1 ? '✓ ' : ''}{ORDER_STATUS_LABELS[o.status as OrderStatus] ?? o.status}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm text-gray-800 font-medium">{o.customerName}</p>
                  {o.customerPhone && <p className="text-xs text-gray-500">{o.customerPhone}{o.customerEmail ? ` · ${o.customerEmail}` : ''}</p>}
                  <div className="mt-3">
                    <OrderStatusBar
                      status={o.status}
                      advancing={advancingId === o.id}
                      onAdvance={(next) => setStatus(o.id, next)}
                    />
                  </div>
                  <ul className="mt-3 space-y-2">
                    {o.items.map((it) => (
                      <li key={it.id} className="flex items-center gap-3">
                        {it.imageUrl && <img src={it.imageUrl} alt={it.productName} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{it.productName}</p>
                          <p className="text-xs text-gray-400">{it.quantity} × {inr(it.unitPrice)}</p>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{inr(it.unitPrice * it.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-2 border-t flex justify-between text-sm font-semibold text-gray-900">
                    <span>Your total</span><span>{inr(sub)}</span>
                  </div>
                  {(o.customerPhone || o.customerEmail) && (
                    <div className="flex gap-2 mt-3">
                      {o.customerPhone && <a href={`tel:${o.customerPhone}`} className="text-xs font-medium text-primary-600 hover:underline">Call</a>}
                      {o.customerPhone && <a href={`https://wa.me/91${o.customerPhone.replace(/\D/g, '').slice(-10)}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-green-600 hover:underline">WhatsApp</a>}
                      {o.customerEmail && <a href={`mailto:${o.customerEmail}`} className="text-xs font-medium text-primary-600 hover:underline">Email</a>}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ---------- Inventory & Reports ---------- */

export function StatCard({ label, value, tint, icon }: { label: string; value: string; tint?: 'green' | 'red'; icon?: string }) {
  const palette = tint === 'green'
    ? { glow: 'bg-emerald-200/50', chip: 'from-emerald-500 to-emerald-600', value: 'text-emerald-600' }
    : tint === 'red'
      ? { glow: 'bg-red-200/50', chip: 'from-red-500 to-red-600', value: 'text-red-500' }
      : { glow: 'bg-primary-200/50', chip: 'from-primary-500 to-primary-700', value: 'text-gray-900' }
  return (
    <div className="card p-5 relative overflow-hidden hover:-translate-y-0.5 transition-transform duration-300">
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl ${palette.glow}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          <p className={`text-2xl font-extrabold mt-1.5 tracking-tight truncate ${palette.value}`}>{value}</p>
        </div>
        {icon && (
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${palette.chip} flex items-center justify-center text-xl shadow-md shrink-0`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

export function DonutChart({ inStock, outOfStock }: { inStock: number; outOfStock: number }) {
  const total = inStock + outOfStock
  const r = 70, c = 2 * Math.PI * r
  const inFrac = total ? inStock / total : 0
  return (
    <svg viewBox="0 0 200 200" className="w-44 h-44 mx-auto">
      <defs>
        <linearGradient id="donutGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="donutRed" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r={r} fill="none" stroke="#f1f5f9" strokeWidth="24" />
      <circle cx="100" cy="100" r={r} fill="none" stroke="url(#donutGreen)" strokeWidth="24"
        strokeDasharray={`${inFrac * c} ${c}`} transform="rotate(-90 100 100)" strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      <circle cx="100" cy="100" r={r} fill="none" stroke="url(#donutRed)" strokeWidth="24"
        strokeDasharray={`${(1 - inFrac) * c} ${c}`} strokeDashoffset={-inFrac * c} transform="rotate(-90 100 100)" strokeLinecap="round" />
      <text x="100" y="96" textAnchor="middle" fontSize="26" fontWeight="800" fill="#111827">{total}</text>
      <text x="100" y="116" textAnchor="middle" fontSize="11" fill="#6b7280">products</text>
      {total > 0 && (
        <text x="100" y="136" textAnchor="middle" fontSize="11" fontWeight="700" fill={inFrac >= 0.5 ? '#059669' : '#ef4444'}>
          {Math.round(inFrac * 100)}% in stock
        </text>
      )}
    </svg>
  )
}

export function BarChart({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <div className="space-y-3.5">
      {items.map((it, i) => (
        <div key={i} className="group">
          <div className="flex justify-between text-xs text-gray-600 mb-1.5">
            <span className="truncate pr-3">{it.label}</span>
            <span className="font-bold text-gray-900">₹{it.value.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-gray-100 h-4 rounded-full overflow-hidden">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-500 group-hover:from-primary-600 group-hover:to-primary-500"
              style={{ width: `${Math.max((it.value / max) * 100, it.value > 0 ? 4 : 0)}%` }}
            />
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-gray-500">No data yet.</p>}
    </div>
  )
}

export function BarSeries({ points }: { points: SoldPeriodPoint[] }) {
  const max = Math.max(...points.map((p) => p.units), 1)
  if (points.length === 0) return (
    <div className="py-12 text-center">
      <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="text-sm text-gray-500">No confirmed sales yet.</p>
      <p className="text-xs text-gray-400 mt-1">Sales from confirmed orders will chart here</p>
    </div>
  )
  return (
    <div className="flex items-end gap-2 h-52 pt-2">
      {points.map((p, i) => {
        const isMax = p.units === max && max > 0
        return (
          <div key={i} className="group flex-1 flex flex-col items-center justify-end h-full min-w-0" title={`${p.key}: ${p.units} units · ₹${p.revenue.toLocaleString('en-IN')}`}>
            <span className={`text-[11px] font-bold mb-1.5 ${isMax ? 'text-primary-700' : 'text-gray-500'} transition-colors`}>{p.units}</span>
            <div
              className={`w-full max-w-[44px] rounded-t-lg transition-all duration-300 group-hover:brightness-110 ${isMax ? 'bg-gradient-to-t from-primary-700 to-primary-500 shadow-sm' : 'bg-gradient-to-t from-primary-400/90 to-primary-300'}`}
              style={{ height: `${Math.max((p.units / max) * 100, p.units > 0 ? 4 : 1)}%` }}
            />
            <span className={`text-[10px] mt-2 w-full text-center truncate ${isMax ? 'text-primary-700 font-semibold' : 'text-gray-400'}`}>{p.key}</span>
          </div>
        )
      })}
    </div>
  )
}

function ProductTable({ products, onChanged }: { products: Product[]; onChanged: () => void }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [editStock, setEditStock] = useState('')
  const [saving, setSaving] = useState(false)

  const startEdit = (p: Product) => {
    setEditingId(p.id)
    setEditPrice(p.price != null ? String(p.price) : '')
    setEditStock(String(p.stockQuantity))
  }

  const saveEdit = async (id: number) => {
    setSaving(true)
    try {
      await api.put(`/products/${id}/inventory`, {
        price: editPrice !== '' ? Number(editPrice) : null,
        stockQuantity: editStock !== '' ? Number(editStock) : null,
      })
      setEditingId(null)
      onChanged()
    } catch (ex: any) {
      alert(ex.response?.data?.message ?? 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b">
            <th className="py-2 pr-3 font-medium">Product</th>
            <th className="py-2 px-3 font-medium text-right">Price</th>
            <th className="py-2 px-3 font-medium text-center">Stock</th>
            <th className="py-2 px-3 font-medium text-center">Status</th>
            <th className="py-2 pl-3 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const editing = editingId === p.id
            const out = p.stockQuantity <= 0
            return (
              <tr key={p.id} className="border-b last:border-b-0 hover:bg-slate-50/70 transition-colors">
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-3">
                    {p.images[0] && <img src={p.images[0]} alt="" className="w-11 h-11 rounded-lg object-cover bg-gray-100" />}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate max-w-[240px]">{p.name}</p>
                      {!p.isApproved && <span className="text-[11px] text-amber-600">Pending approval</span>}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  {editing ? (
                    <input type="number" step="1" min="0" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className={`${inputCls} !py-1.5 !px-2 text-right max-w-[110px] ml-auto`} />
                  ) : (
                    <span className="font-semibold text-gray-900">{p.price != null ? `₹${p.price.toLocaleString('en-IN')}` : '—'}</span>
                  )}
                </td>
                <td className="py-3 px-3 text-center">
                  {editing ? (
                    <input type="number" min="0" value={editStock} onChange={(e) => setEditStock(e.target.value)} className={`${inputCls} !py-1.5 !px-2 text-center max-w-[90px] mx-auto`} />
                  ) : (
                    <span className={out ? 'text-red-600 font-semibold' : 'text-gray-700 font-medium'}>{p.stockQuantity}</span>
                  )}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${out ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {out ? 'Out of stock' : 'In stock'}
                  </span>
                </td>
                <td className="py-3 pl-3 text-right">
                  {editing ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => saveEdit(p.id)} disabled={saving} className="text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-lg disabled:opacity-50">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-xs font-semibold text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(p)} className="text-xs font-semibold text-primary-600 border border-primary-200 hover:bg-primary-50 px-3 py-1.5 rounded-lg">Edit ✓</button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {products.length === 0 && <p className="text-sm text-gray-500 py-6 text-center">No products yet.</p>}
    </div>
  )
}

function InventorySec({ bizId }: { bizId: number }) {
  const [products, setProducts] = useState<Product[]>([])
  const [sold, setSold] = useState<SoldSummary | null>(null)
  const load = () => api.get(`/products?businessId=${bizId}`).then(({ data }) => setProducts(data))
  const loadSold = () => api.get(`/orders/sold?businessId=${bizId}`).then(({ data }) => setSold(data))
  useEffect(() => {
    load()
    loadSold()
  }, [bizId])

  const inStock = products.filter((p) => p.stockQuantity > 0)
  const outOfStock = products.filter((p) => p.stockQuantity <= 0)
  const value = products.reduce((s, p) => s + (p.price ?? 0) * Math.max(0, p.stockQuantity), 0)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total products" value={String(products.length)} icon="📦" />
        <StatCard label="In stock" value={String(inStock.length)} tint="green" icon="✅" />
        <StatCard label="Out of stock" value={String(outOfStock.length)} tint="red" icon="⚠️" />
        <StatCard label="Stock value" value={`₹${value.toLocaleString('en-IN')}`} icon="💰" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Sold — today" value={`${sold?.soldToday ?? 0} units`} icon="🔥" />
        <StatCard label="Sold — this month" value={`${sold?.soldThisMonth ?? 0} units`} icon="📅" />
        <StatCard label="Sold — this year" value={`${sold?.soldThisYear ?? 0} units`} icon="🗓️" />
        <StatCard label="Sales this month" value={`₹${(sold?.revenueThisMonth ?? 0).toLocaleString('en-IN')}`} icon="💵" />
      </div>

      <div className="bg-white rounded-2xl border p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">Stock sold</h3>
          <p className="text-sm text-gray-500">Units from confirmed orders, per product, split by day / month / year.</p>
        </div>
        {sold && sold.products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b">
                  <th className="py-2 pr-3 font-medium">Product</th>
                  <th className="py-2 px-3 font-medium text-center">Today</th>
                  <th className="py-2 px-3 font-medium text-center">This month</th>
                  <th className="py-2 px-3 font-medium text-center">This year</th>
                  <th className="py-2 pl-3 font-medium text-right">Sales this month</th>
                </tr>
              </thead>
              <tbody>
                {sold.products.map((sp) => (
                  <tr key={sp.productId} className="border-b last:border-b-0">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        {sp.imageUrl && <img src={sp.imageUrl} alt="" className="w-11 h-11 rounded-lg object-cover bg-gray-100" />}
                        <p className="font-medium text-gray-900 truncate max-w-[240px]">{sp.productName}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-gray-800">{sp.soldToday}</td>
                    <td className="py-3 px-3 text-center font-medium text-gray-800">{sp.soldThisMonth}</td>
                    <td className="py-3 px-3 text-center font-medium text-gray-800">{sp.soldThisYear}</td>
                    <td className="py-3 pl-3 text-right font-semibold text-gray-900">₹{sp.revenueThisMonth.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No confirmed sales yet. Once orders are accepted, sold stock will appear here.</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">Current stock</h3>
          <p className="text-sm text-gray-500">Set stock levels and change prices. Out-of-stock items are not orderable by users.</p>
        </div>
        <ProductTable products={products} onChanged={load} />
      </div>
    </div>
  )
}

function ReportsSec({ bizId }: { bizId: number }) {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<OrderInfo[]>([])
  const [periodData, setPeriodData] = useState<SoldByPeriod | null>(null)
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(true)

  const loadProducts = () => api.get(`/products?businessId=${bizId}`).then(({ data }) => setProducts(data))
  const loadOrders = () => api.get('/orders/for-my-businesses').then(({ data }) => setOrders(data))
  const loadPeriods = () => api.get(`/orders/sold-by-period?businessId=${bizId}`).then(({ data }) => setPeriodData(data))

  useEffect(() => {
    setLoading(true)
    Promise.all([loadProducts(), loadOrders(), loadPeriods()]).catch(() => {}).finally(() => setLoading(false))
  }, [bizId])

  const inStock = products.filter((p) => p.stockQuantity > 0)
  const outOfStock = products.filter((p) => p.stockQuantity <= 0)
  const value = products.reduce((s, p) => s + (p.price ?? 0) * Math.max(0, p.stockQuantity), 0)
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length
  const confirmedOrders = orders.filter((o) => o.status === 'Confirmed').length
  const topByValue = [...products]
    .sort((a, b) => (b.price ?? 0) * b.stockQuantity - (a.price ?? 0) * a.stockQuantity)
    .slice(0, 5)
    .map((p) => ({ label: p.name, value: (p.price ?? 0) * p.stockQuantity }))
  const orderTotal = Math.max(orders.length, 1)

  if (loading) return (
    <div className="card p-8 flex items-center justify-center gap-3 text-gray-500">
      <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <span className="text-sm font-medium">Loading reports…</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reports</h2>
          <p className="text-sm text-gray-500 mt-1">Inventory health and sales insights for this business</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100 text-xs font-semibold">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Live overview
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total products" value={String(products.length)} icon="📦" />
        <StatCard label="In stock" value={String(inStock.length)} tint="green" icon="✅" />
        <StatCard label="Out of stock" value={String(outOfStock.length)} tint="red" icon="⚠️" />
        <StatCard label="Stock value" value={`₹${value.toLocaleString('en-IN')}`} icon="💰" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-200/50">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Stock overview</h3>
              <p className="text-xs text-gray-400">Live inventory split</p>
            </div>
          </div>
          <DonutChart inStock={inStock.length} outOfStock={outOfStock.length} />
          <div className="flex justify-center gap-5 mt-4 text-sm">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> In stock ({inStock.length})
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-100">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Out of stock ({outOfStock.length})
            </span>
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-200/50">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Top 5 by stock value</h3>
              <p className="text-xs text-gray-400">Price × quantity on hand</p>
            </div>
          </div>
          <BarChart items={topByValue} />
        </div>

        <div className="card p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-200/50">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m-6 0a2 2 0 002 2h4a2 2 0 002-2m-6 0V3a2 2 0 002-2h4a2 2 0 002 2M9 5v2m4-2v2" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Order requests</h3>
              <p className="text-xs text-gray-400">Across all your businesses</p>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="inline-flex items-center gap-1.5 font-medium text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending
                </span>
                <span className="font-extrabold text-gray-900">{pendingOrders}</span>
              </div>
              <div className="bg-gray-100 h-3.5 rounded-full overflow-hidden">
                <div className="h-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500" style={{ width: `${(pendingOrders / orderTotal) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="inline-flex items-center gap-1.5 font-medium text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Confirmed
                </span>
                <span className="font-extrabold text-gray-900">{confirmedOrders}</span>
              </div>
              <div className="bg-gray-100 h-3.5 rounded-full overflow-hidden">
                <div className="h-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500" style={{ width: `${(confirmedOrders / orderTotal) * 100}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-sm text-gray-500">Total orders received</span>
              <span className="text-lg font-extrabold text-gray-900">{orders.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-200/50">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0L18 7.5M3 15l4.5-1.5M3 15l6 6M21 7.5l-4.5-2.25M21 7.5l-4.5 2.25M21 7.5V21M9 21h12m0 0v-3" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Sales by period</h3>
              <p className="text-xs text-gray-400">Units sold from confirmed orders — by month, quarter and year</p>
            </div>
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 shadow-inner">
            {(['monthly', 'quarterly', 'yearly'] as const).map((k) => (
              <button key={k} onClick={() => setPeriod(k)} className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${period === k ? 'bg-white shadow-md text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}>
                {k}
              </button>
            ))}
          </div>
        </div>
        <BarSeries points={periodData ? periodData[period] : []} />
        {periodData && periodData[period].length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-primary-100">Total {period} revenue</p>
              <p className="text-2xl font-extrabold mt-1 tracking-tight">₹{periodData[period].reduce((s, p) => s + p.revenue, 0).toLocaleString('en-IN')}</p>
              <p className="text-xs text-primary-200 mt-1">{periodData[period].reduce((s, p) => s + p.units, 0)} units sold</p>
            </div>
            {(() => {
              const best = [...periodData[period]].sort((a, b) => b.revenue - a.revenue)[0]
              return best && best.revenue > 0 ? (
                <div className="rounded-2xl bg-primary-50 border border-primary-100 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-primary-700">Best {period.replace('y', '')} period</p>
                  <p className="text-2xl font-extrabold mt-1 tracking-tight text-primary-700">{best.key}</p>
                  <p className="text-xs text-primary-600 mt-1">{best.units} units · ₹{best.revenue.toLocaleString('en-IN')} revenue</p>
                </div>
              ) : null
            })()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">In stock</h3>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">{inStock.length} items</span>
          </div>
          {inStock.length === 0 ? <p className="text-sm text-gray-500">Nothing in stock.</p> : (
            <ul className="space-y-1">
              {inStock.map((p) => (
                <li key={p.id} className="flex justify-between items-center text-sm py-2 border-b last:border-b-0 group hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors">
                  <span className="truncate pr-3 text-gray-800 group-hover:text-gray-900">{p.name}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">{p.stockQuantity} units</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Out of stock</h3>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100">{outOfStock.length} items</span>
          </div>
          {outOfStock.length === 0 ? <p className="text-sm text-gray-500">Everything is in stock. 🎉</p> : (
            <ul className="space-y-1">
              {outOfStock.map((p) => (
                <li key={p.id} className="flex justify-between items-center text-sm py-2 border-b last:border-b-0 group hover:bg-red-50/40 -mx-2 px-2 rounded-lg transition-colors">
                  <span className="truncate pr-3 text-gray-800 group-hover:text-gray-900">{p.name}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full shrink-0">{p.stockQuantity} units</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-gray-900">Products ({products.length})</h3>
            <p className="text-xs text-gray-400 mt-0.5">Edit price or stock directly from the table.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Manage inventory
          </span>
        </div>
        <ProductTable products={products} onChanged={loadProducts} />
      </div>
    </div>
  )
}
