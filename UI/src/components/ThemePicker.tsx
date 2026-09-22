import { THEME_LIST } from '../themes'

// Reusable per-business theme selector used by the new-business wizard and
// the profile editor. Renders a swatch preview card per theme.
export default function ThemePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (key: string) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {THEME_LIST.map((t) => {
        const selected = t.key === value
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`relative rounded-xl border-2 p-3 text-left transition-all duration-200 ${
              selected
                ? 'border-primary-500 ring-2 ring-primary-200/70 bg-primary-50/40'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="h-10 rounded-lg overflow-hidden flex ring-1 ring-black/5">
              <div className="flex-1" style={{ backgroundColor: t.swatch[0] }} />
              <div className="flex-1" style={{ backgroundColor: t.swatch[1] }} />
              <div className="flex-1" style={{ backgroundColor: t.swatch[2] }} />
            </div>
            <p className={`mt-2 text-sm font-semibold ${selected ? 'text-primary-700' : 'text-gray-800'}`}>{t.name}</p>
            <p className="text-[11px] text-gray-400 leading-snug mt-0.5 line-clamp-2">{t.blurb}</p>
            {selected && (
              <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}