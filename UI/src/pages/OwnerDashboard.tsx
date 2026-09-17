import { useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { BusinessSummary, BusinessDetail, Category, Enquiry, Product, Subscription, Testimonial, Plan } from '../api/types'
import { subscriptionState, subscriptionBadge, daysUntil, fmtDate, completeness } from '../api/utils'

type Tab = 'overview' | 'edit' | 'products' | 'subscription' | 'reviews' | 'enquiries'

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
          <div className="flex flex-wrap gap-2 mb-4">
            {businesses.map((b) => (
              <button key={b.id} onClick={() => selectBusiness(b.id)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${selectedId === b.id ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'}`}>
                {b.name}
                {b.isActive && b.subscriptionExpiresOn && daysUntil(b.subscriptionExpiresOn) >= 0 ? '' : ' ⚠'}
              </button>
            ))}
            <button onClick={() => setWizard(true)} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${wizard ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'}`}>+ New Business</button>
          </div>

          {selectedId != null && (
            <>
              <div className="flex gap-1 mb-6 overflow-x-auto border-b border-gray-200">
                {([['overview', 'Overview'], ['edit', 'Edit Page'], ['products', 'Products & Services'], ['subscription', 'Subscription'], ['reviews', 'Reviews'], ['enquiries', 'Enquiries']] as [Tab, string][]).map(([t, label]) => (
                  <button key={t} onClick={() => switchTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${tab === t ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{label}</button>
                ))}
              </div>

              {tab === 'overview' && <OverviewSec bizId={selectedId} summary={businesses.find((b) => b.id === selectedId)} />}
              {tab === 'edit' && <BizEditor key={selectedId} bizId={selectedId} cats={categories} onChanged={async () => { await reload() }} />}
              {tab === 'products' && <ProductsSec bizId={selectedId} />}
              {tab === 'subscription' && <SubSec bizId={selectedId} />}
              {tab === 'reviews' && <TestSec bizId={selectedId} />}
              {tab === 'enquiries' && <EnqSec />}
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
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${detail.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {detail.isPublished ? 'Published — visible to public' : 'Draft — hidden from public'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.open(`/b/${detail.slug}`, '_blank')} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Preview page ↗</button>
            {!detail.isPublished && (
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
            <div key={k} className="bg-white rounded-2xl border p-4">
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
          <p className="text-sm text-gray-500">Publishing makes the page publicly visible in the directory immediately. You can unpublish any time.</p>
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
            <button disabled={busy} onClick={() => submit(true)} className="px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-40">{busy ? 'Creating…' : 'Create & Publish'}</button>
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
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
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
  const [notice, setNotice] = useState('')
  const [busyPlan, setBusyPlan] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/subscriptions/my'),
      api.get('/subscriptions/plans'),
      api.get(`/businesses/${bizId}`),
    ]).then(([s, p, d]) => { setSubs(s.data); setPlans(p.data); setDetail(d.data) })
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
                <p className="text-xs text-gray-400">{p.months} months</p>
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
