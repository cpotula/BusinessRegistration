// SVG line icons for the business category grid (replaces emoji tiles).
export default function CategoryIcon({ slug, className = 'w-6 h-6' }: { slug?: string; className?: string }) {
  const props = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  }

  switch (slug) {
    case 'restaurants-cafes':
      return (
        <svg {...props}>
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
      )
    case 'retail-shopping':
      return (
        <svg {...props}>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      )
    case 'health-beauty':
      return (
        <svg {...props}>
          <path d="M9.9 2.5c.2-.7 1.2-.7 1.4 0l.9 2.8c.1.4.4.7.8.8l2.8.9c.7.2.7 1.2 0 1.4l-2.8.9c-.4.1-.7.4-.8.8l-.9 2.8c-.2.7-1.2.7-1.4 0l-.9-2.8a1.4 1.4 0 0 0-.8-.8l-2.8-.9c-.7-.2-.7-1.2 0-1.4l2.8-.9c.4-.1.7-.4.8-.8Z" />
          <path d="M16.5 16.5l.5 1.4a1 1 0 0 0 .6.6l1.4.5-1.4.5a1 1 0 0 0-.6.6l-.5 1.4-.5-1.4a1 1 0 0 0-.6-.6l-1.4-.5 1.4-.5a1 1 0 0 0 .6-.6Z" />
        </svg>
      )
    case 'home-services':
      return (
        <svg {...props}>
          <path d="m3 10.5 9-7.5 9 7.5" /><path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" /><path d="M9.5 21v-6.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V21" />
        </svg>
      )
    case 'it-professional-services':
      return (
        <svg {...props}>
          <rect x="2" y="7" width="20" height="13" rx="2" /><path d="M16 20V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v15" />
        </svg>
      )
    case 'education-training':
      return (
        <svg {...props}>
          <path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12.5V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" /><path d="M22 10v5" />
        </svg>
      )
    case 'automotive':
      return (
        <svg {...props}>
          <rect x="2" y="9" width="20" height="9" rx="2.5" /><path d="M4.5 9 7 5h10l2.5 4" /><circle cx="7" cy="16.5" r="1.5" /><circle cx="17" cy="16.5" r="1.5" />
        </svg>
      )
    case 'real-estate':
      return (
        <svg {...props}>
          <rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 21v-6h6v6" /><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01" />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" />
        </svg>
      )
  }
}