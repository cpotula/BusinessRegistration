// Per-business industry themes (Ezone-style presets).
//
// IMPORTANT: every Tailwind class below is written as a full literal string so
// Tailwind's content scanner picks it up at build time. Never build class names
// dynamically (e.g. `bg-${color}-600`) — those get purged and silently fail.

export interface BusinessTheme {
  key: string
  name: string
  blurb: string
  /** 3 hex colors for the picker preview swatch. */
  swatch: [string, string, string]
  /** Hex accent for thin bars / inline decoration. */
  accent: string
  /** CSS font-family stack for display headings. */
  fontHeading: string
  /** Section heading text color. */
  heading: string
  /** Primary call-to-action button classes. */
  btnPrimary: string
  /** Secondary / ghost button classes. */
  btnSecondary: string
  /** Category & info chip classes. */
  chip: string
  /** Text link classes. */
  link: string
  /** Branding gradient stops ('from-x to-y'). */
  gradient: string
  /** Soft tinted background for info panels. */
  softBg: string
  /** Tinted panel with border. */
  panel: string
  /** Thin top accent bar for cards / sections. */
  topBar: string
  /** Ring around the business logo. */
  logoRing: string
  /** Product card price color. */
  price: string
  /** Product card title hover color (group-hover variant). */
  titleHover: string
}

const classic: BusinessTheme = {
  key: 'classic',
  name: 'Classic',
  blurb: 'Clean violet — the portal default look.',
  swatch: ['#6337eb', '#a78bfa', '#ede9fe'],
  accent: '#6337eb',
  fontHeading: "'Inter', system-ui, sans-serif",
  heading: 'text-gray-900',
  btnPrimary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md',
  btnSecondary:
    'border border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50/60',
  chip: 'bg-primary-50 text-primary-700 border border-primary-100',
  link: 'text-primary-600 hover:text-primary-700',
  gradient: 'from-primary-500 to-primary-700',
  softBg: 'bg-primary-50/60',
  panel: 'bg-primary-50/60 border border-primary-100/70',
  topBar: 'bg-primary-500',
  logoRing: 'ring-primary-100',
  price: 'text-primary-700',
  titleHover: 'group-hover:text-primary-700',
}

const fashion: BusinessTheme = {
  key: 'fashion',
  name: 'Fashion Boutique',
  blurb: 'Elegant rose tones with editorial serif headings.',
  swatch: ['#db2777', '#fb7185', '#fce7f3'],
  accent: '#db2777',
  fontHeading: "'Playfair Display', Georgia, serif",
  heading: 'text-gray-900',
  btnPrimary: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:shadow-md shadow-rose-200/60',
  btnSecondary: 'border border-rose-200 bg-white text-rose-700 hover:bg-rose-50',
  chip: 'bg-rose-50 text-rose-700 border border-rose-100',
  link: 'text-rose-600 hover:text-rose-700',
  gradient: 'from-rose-500 to-fuchsia-600',
  softBg: 'bg-rose-50/70',
  panel: 'bg-rose-50/70 border border-rose-100',
  topBar: 'bg-rose-500',
  logoRing: 'ring-rose-100',
  price: 'text-rose-700',
  titleHover: 'group-hover:text-rose-700',
}

const electronics: BusinessTheme = {
  key: 'electronics',
  name: 'Electronics Store',
  blurb: 'Sharp sky-blue tech styling for gadgets & electronics.',
  swatch: ['#0284c7', '#22d3ee', '#e0f2fe'],
  accent: '#0284c7',
  fontHeading: "'Poppins', 'Inter', sans-serif",
  heading: 'text-gray-900',
  btnPrimary: 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm hover:shadow-md shadow-sky-200/60',
  btnSecondary: 'border border-sky-200 bg-white text-sky-700 hover:bg-sky-50',
  chip: 'bg-sky-50 text-sky-700 border border-sky-100',
  link: 'text-sky-600 hover:text-sky-700',
  gradient: 'from-sky-500 to-cyan-600',
  softBg: 'bg-sky-50/70',
  panel: 'bg-sky-50/70 border border-sky-100',
  topBar: 'bg-sky-500',
  logoRing: 'ring-sky-100',
  price: 'text-sky-700',
  titleHover: 'group-hover:text-sky-700',
}

const food: BusinessTheme = {
  key: 'food',
  name: 'Food & Drink',
  blurb: 'Warm orange & amber tones for restaurants and cafés.',
  swatch: ['#ea580c', '#fbbf24', '#ffedd5'],
  accent: '#ea580c',
  fontHeading: "'Poppins', 'Inter', sans-serif",
  heading: 'text-gray-900',
  btnPrimary: 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm hover:shadow-md shadow-orange-200/60',
  btnSecondary: 'border border-orange-200 bg-white text-orange-700 hover:bg-orange-50',
  chip: 'bg-orange-50 text-orange-700 border border-orange-100',
  link: 'text-orange-600 hover:text-orange-700',
  gradient: 'from-orange-500 to-amber-500',
  softBg: 'bg-orange-50/70',
  panel: 'bg-orange-50/70 border border-orange-100',
  topBar: 'bg-orange-500',
  logoRing: 'ring-orange-100',
  price: 'text-orange-700',
  titleHover: 'group-hover:text-orange-700',
}

const furniture: BusinessTheme = {
  key: 'furniture',
  name: 'Furniture & Home',
  blurb: 'Earthy emerald & teal with classic serif headings.',
  swatch: ['#059669', '#14b8a6', '#d1fae5'],
  accent: '#059669',
  fontHeading: "'Playfair Display', Georgia, serif",
  heading: 'text-gray-900',
  btnPrimary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md shadow-emerald-200/60',
  btnSecondary: 'border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50',
  chip: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  link: 'text-emerald-600 hover:text-emerald-700',
  gradient: 'from-emerald-500 to-teal-600',
  softBg: 'bg-emerald-50/70',
  panel: 'bg-emerald-50/70 border border-emerald-100',
  topBar: 'bg-emerald-500',
  logoRing: 'ring-emerald-100',
  price: 'text-emerald-700',
  titleHover: 'group-hover:text-emerald-700',
}

export const DEFAULT_THEME_KEY = 'classic'

export const THEMES: Record<string, BusinessTheme> = {
  classic,
  fashion,
  electronics,
  food,
  furniture,
}

export const THEME_LIST: BusinessTheme[] = [
  THEMES.classic,
  THEMES.fashion,
  THEMES.electronics,
  THEMES.food,
  THEMES.furniture,
]

/** Safe lookup — unknown / missing keys fall back to the classic theme. */
export function getTheme(key?: string | null): BusinessTheme {
  if (!key) return THEMES[DEFAULT_THEME_KEY]
  return THEMES[key] ?? THEMES[DEFAULT_THEME_KEY]
}
