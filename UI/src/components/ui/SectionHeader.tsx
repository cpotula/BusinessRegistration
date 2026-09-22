import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  linkTo,
  linkText,
}: {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  linkTo?: string
  linkText?: string
}) {
  return (
    <div className="mb-8 sm:mb-10">
      {eyebrow && (
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-600 mb-2">
          <span className="w-8 h-px bg-primary-300" />
          {eyebrow}
        </p>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">{title}</h2>
          {subtitle && <p className="text-gray-500 mt-2 text-[15px]">{subtitle}</p>}
        </div>
        {linkTo && linkText && (
          <Link
            to={linkTo}
            className="inline-flex items-center gap-1.5 shrink-0 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors group"
          >
            {linkText}
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  )
}