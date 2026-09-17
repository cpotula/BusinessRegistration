import { BusinessDetail } from './types'

// WhatsApp deep links: wa.me expects international format without '+' or leading zeros.
export function waNumber(raw: string | null | undefined): string | null {
  if (!raw) return null
  const digits = raw.replace(/[^\d]/g, '')
  if (digits.length < 8) return null
  return digits.length <= 10 ? `91${digits}` : digits
}

export function whatsappChatLink(number: string | null | undefined, businessName: string): string | null {
  const n = waNumber(number)
  if (!n) return null
  const text = encodeURIComponent(`Hi, I found your business "${businessName}" on the business directory.`)
  return `https://wa.me/${n}?text=${text}`
}

export function shareUrl(): string {
  return typeof window !== 'undefined' ? window.location.href : ''
}

export function whatsappShareLink(name: string, url: string): string {
  const text = encodeURIComponent(`Check out "${name}" on the business directory: ${url}`)
  return `https://wa.me/?text=${text}`
}

export async function shareBusiness(name: string, url: string): Promise<'native' | 'whatsapp' | 'copied'> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: name, url })
      return 'native'
    } catch {
      /* user cancelled - fall through */
    }
  }
  window.open(whatsappShareLink(name, url), '_blank')
  return 'whatsapp'
}

export type SubscriptionState = 'active' | 'expiring' | 'expired' | 'none'

export function subscriptionState(expiresOn: string | null | undefined, isActive: boolean | undefined = true): SubscriptionState {
  if (!expiresOn) return 'none'
  const days = daysUntil(expiresOn)
  if (days < 0) return 'expired'
  if (!isActive) return 'expired'
  if (days <= 14) return 'expiring'
  return 'active'
}

export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function subscriptionBadge(state: SubscriptionState, expiresOn: string | null | undefined) {
  // Doc requirement: unambiguous status, e.g. "Active — Expires 30 Sep 2026".
  switch (state) {
    case 'active':
      return { label: `Active — Expires ${fmtDate(expiresOn)}`, cls: 'bg-green-100 text-green-700', dot: 'bg-green-500' }
    case 'expiring':
      return { label: `Expiring soon — ${fmtDate(expiresOn)}`, cls: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' }
    case 'expired':
      return { label: `Expired — ${fmtDate(expiresOn)}`, cls: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
    default:
      return { label: 'No active subscription', cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }
  }
}

// Listing completeness indicator (doc: "Show what information is missing").
export function completeness(b: BusinessDetail | null): { percent: number; missing: string[] } {
  if (!b) return { percent: 0, missing: [] }
  const checks: [string, boolean][] = [
    ['Description', !!b.description],
    ['Phone or WhatsApp number', !!(b.contactPhone || b.contactWhatsApp)],
    ['Email', !!b.contactEmail],
    ['Address', !!(b.address && b.city)],
    ['Logo or cover image', !!(b.logoUrl || b.coverUrl)],
    ['Business hours', !!b.businessHours],
    ['Products / services', b.productCount > 0],
    ['Customer reviews', b.testimonials.length > 0],
  ]
  const done = checks.filter(([, ok]) => ok).length
  return { percent: Math.round((done / checks.length) * 100), missing: checks.filter(([, ok]) => !ok).map(([label]) => label) }
}
