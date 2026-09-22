import { ReactNode } from 'react'

export type IconName = 'grid' | 'home' | 'layers' | 'package' | 'tag' | 'cart' | 'chart' | 'pencil' | 'card' | 'star' | 'chat' | 'store' | 'user' | 'shield' | 'megaphone' | 'logout'

export interface ShellUser {
  name?: string | null
  email?: string | null
  role?: string | null
}

export interface NavItem {
  key: string
  label: string
  icon?: IconName
  badge?: ReactNode
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

interface DashboardShellProps {
  brand: string
  brandTagline?: string
  navGroups: NavGroup[]
  active: string
  onSelect: (key: string) => void
  title: ReactNode
  subtitle?: ReactNode
  headerExtras?: ReactNode
  user?: ShellUser | null
  onLogout?: () => void
  children: ReactNode
}

function ShellIcon({ name, className }: { name: IconName; className?: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  }
  switch (name) {
    case 'grid':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 9.5 12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-5V15H9.5v6.5H4.5A1.5 1.5 0 0 1 3 20Z" />
        </svg>
      )
    case 'layers':
      return (
        <svg {...common}>
          <polygon points="12 2.5 2.5 7.5 12 12.5 21.5 7.5 12 2.5" /><polyline points="2.5 12.5 12 17.5 21.5 12.5" /><polyline points="2.5 17.5 12 22.5 21.5 17.5" />
        </svg>
      )
    case 'package':
      return (
        <svg {...common}>
          <path d="M20.5 7.27v9.46a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4a2 2 0 0 1-1-1.73V7.27a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4a2 2 0 0 1 1 1.73Z" /><polyline points="2.8 7.7 12 12.9 21.2 7.7" /><line x1="12" y1="22" x2="12" y2="12" />
        </svg>
      )
    case 'tag':
      return (
        <svg {...common}>
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83Z" /><line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      )
    case 'cart':
      return (
        <svg {...common}>
          <circle cx="9" cy="20.5" r="1.3" /><circle cx="18" cy="20.5" r="1.3" /><path d="M2.5 3h2l2.5 11.5a1.6 1.6 0 0 0 1.6 1.3h8.8a1.6 1.6 0 0 0 1.6-1.3L21 7H6" />
        </svg>
      )
    case 'chart':
      return (
        <svg {...common}>
          <path d="M4 20V4" /><path d="M4 20H20" /><path d="M8.5 14.5v4" /><path d="M13 10v8.5" /><path d="M17.5 7v11.5" />
        </svg>
      )
    case 'pencil':
      return (
        <svg {...common}>
          <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
      )
    case 'card':
      return (
        <svg {...common}>
          <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      )
    case 'star':
      return (
        <svg {...common}>
          <polygon points="12 2.5 15.09 8.76 22 9.77 17 14.64 18.18 21.52 12 18.27 5.82 21.52 7 14.64 2 9.77 8.91 8.76 12 2.5" />
        </svg>
      )
    case 'chat':
      return (
        <svg {...common}>
          <path d="M21 14.5a2 2 0 0 1-2 2H7.5L3 21V5.5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
        </svg>
      )
    case 'store':
      return (
        <svg {...common}>
          <path d="M3 9.5 4.7 4h14.6L21 9.5" /><path d="M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /><path d="M4.5 13v7h15v-7" /><path d="M9.5 20v-4.5h5V20" />
        </svg>
      )
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m8.5 11.8 2.4 2.4 4.6-4.7" />
        </svg>
      )
    case 'megaphone':
      return (
        <svg {...common}>
          <path d="m3 11 18-5v12L3 14Z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
      )
    case 'logout':
      return (
        <svg {...common}>
          <path d="M9 21H5.5A1.5 1.5 0 0 1 4 19.5v-15A1.5 1.5 0 0 1 5.5 3H9" /><polyline points="15.5 16.5 20 12 15.5 7.5" /><line x1="20" y1="12" x2="9.5" y2="12" />
        </svg>
      )
  }
}

function SidebarNavItem({ item, active, onSelect }: { item: NavItem; active: boolean; onSelect: (key: string) => void }) {
  return (
    <button
      onClick={() => onSelect(item.key)}
      className={`group flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200 ${active
        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-900/40'
        : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'}`}
    >
      {item.icon && <ShellIcon name={item.icon} className="w-5 h-5 shrink-0" />}
      <span className="flex-1 min-w-0 truncate">{item.label}</span>
      {item.badge != null && <span className="shrink-0">{item.badge}</span>}
    </button>
  )
}

function MobileNavBar({ navGroups, active, onSelect }: { navGroups: NavGroup[]; active: string; onSelect: (key: string) => void }) {
  const flat = navGroups.flatMap((g) => g.items)
  return (
    <nav className="flex gap-1.5 overflow-x-auto px-4 sm:px-6 py-2.5 border-t border-slate-200/70">
      {flat.map((item) => (
        <button
          key={item.key}
          onClick={() => onSelect(item.key)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${active === item.key ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          {item.icon && <ShellIcon name={item.icon} className="w-4 h-4" />}
          {item.label}
        </button>
      ))}
    </nav>
  )
}

export default function DashboardShell({
  brand,
  brandTagline,
  navGroups,
  active,
  onSelect,
  title,
  subtitle,
  headerExtras,
  user,
  onLogout,
  children,
}: DashboardShellProps) {
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'U'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-72 flex-col bg-slate-900 overflow-y-auto">
        <div className="flex items-center gap-3 px-5 pt-6 pb-5">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold text-white shadow-lg shadow-primary-900/40">
            {brand.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold leading-tight truncate">{brand}</p>
            {brandTagline && <p className="text-[11px] text-slate-500 leading-tight truncate">{brandTagline}</p>}
          </div>
        </div>

        <nav className="flex-1 px-4 pb-6 space-y-6">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{group.label}</p>
              )}
              <div className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <SidebarNavItem key={item.key} item={item} active={active === item.key} onSelect={onSelect} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 p-3">
            <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-primary-500 to-slate-700 flex items-center justify-center text-sm font-bold text-white">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Guest'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.role || user?.email}</p>
            </div>
          </div>
          {onLogout && (
            <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/70 hover:text-white transition-colors">
              <ShellIcon name="logout" className="w-5 h-5" />
              Sign out
            </button>
          )}
        </div>
      </aside>

      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-50/85 backdrop-blur border-b border-slate-200/70">
          <div className="lg:hidden flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-slate-200/70">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold text-white">
                {brand.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-bold text-slate-900">{brand}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-slate-700 flex items-center justify-center text-xs font-bold text-white">
              {initial}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4">
            <div className="min-w-0">
              {title}
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
            {headerExtras && <div className="shrink-0">{headerExtras}</div>}
          </div>

          <div className="lg:hidden">
            <MobileNavBar navGroups={navGroups} active={active} onSelect={onSelect} />
          </div>
        </header>

        {/* Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          <div className="animate-fadeIn">{children}</div>
        </main>
      </div>
    </div>
  )
}