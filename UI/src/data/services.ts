// Curated catalog of business / company / license / tax / startup services.
// Used by the Amazon-style search autocomplete. Each entry can be navigated
// to on selection (search is wired to the product/service search results page).

export interface ServiceSuggestion {
  id: string
  title: string
  description: string
  keywords: string[]
  // Where the suggestion takes the user when selected.
  search: string
}

export const services: ServiceSuggestion[] = [
  {
    id: 'business-registration',
    title: 'Business Registration',
    description: 'Register a new business / proprietorship',
    keywords: ['business', 'registration', 'register', 'trade', 'shops', 'establishment', 'proprietorship', 'sole'],
    search: 'Business Registration',
  },
  {
    id: 'business-registration-online',
    title: 'Online Business Registration',
    description: 'Register your business entirely online',
    keywords: ['business', 'registration', 'online', 'register'],
    search: 'Online Business Registration',
  },
  {
    id: 'business-registration-startups',
    title: 'Business Registration for Startups',
    description: 'Kickstart formal registration for your startup',
    keywords: ['business', 'registration', 'startup', 'start-ups', 'register'],
    search: 'Business Registration for Startups',
  },
  {
    id: 'business-registration-documents',
    title: 'Business Registration Documents',
    description: 'Required documents checklist for registration',
    keywords: ['business', 'registration', 'documents', 'document', 'list', 'checklist', 'paper'],
    search: 'Business Registration Documents',
  },
  {
    id: 'business-registration-fees',
    title: 'Business Registration Fees',
    description: 'Government + professional fees for registration',
    keywords: ['business', 'registration', 'fees', 'fee', 'price', 'cost', 'charges'],
    search: 'Business Registration Fees',
  },
  {
    id: 'business-registration-process',
    title: 'Business Registration Process',
    description: 'Step-by-step registration procedure',
    keywords: ['business', 'registration', 'process', 'procedure', 'steps', 'how'],
    search: 'Business Registration Process',
  },
  {
    id: 'company-registration',
    title: 'Company Registration',
    description: 'Incorporate a private / public limited company',
    keywords: ['company', 'registration', 'incorporation', 'incorporate', 'companies'],
    search: 'Company Registration',
  },
  {
    id: 'pvt-ltd-registration',
    title: 'Private Limited Company Registration',
    description: 'Incorporate a Private Limited (Pvt Ltd) company',
    keywords: ['private', 'limited', 'pvt', 'ltd', 'company', 'registration', 'incorporation', 'incorporate'],
    search: 'Private Limited Company Registration',
  },
  {
    id: 'company-registration-online',
    title: 'Company Registration Online',
    description: 'Incorporate your company online',
    keywords: ['company', 'registration', 'online', 'incorporation', 'incorporate'],
    search: 'Company Registration Online',
  },
  {
    id: 'company-registration-documents',
    title: 'Company Registration Documents',
    description: 'Documents required for company incorporation',
    keywords: ['company', 'registration', 'documents', 'incorporation', 'document', 'list'],
    search: 'Company Registration Documents',
  },
  {
    id: 'company-registration-fees',
    title: 'Company Registration Fees',
    description: 'Cost to incorporate a company',
    keywords: ['company', 'registration', 'fees', 'fee', 'cost', 'price', 'charges'],
    search: 'Company Registration Fees',
  },
  {
    id: 'company-registration-process',
    title: 'Company Registration Process',
    description: 'How to register a company step by step',
    keywords: ['company', 'registration', 'process', 'procedure', 'steps', 'how'],
    search: 'Company Registration Process',
  },
  {
    id: 'startup-registration',
    title: 'Startup Registration',
    description: 'Register your startup entity',
    keywords: ['startup', 'start-ups', 'registration', 'register'],
    search: 'Startup Registration',
  },
  {
    id: 'startup-business-registration',
    title: 'Startup Business Registration',
    description: 'Full registration setup for startup businesses',
    keywords: ['startup', 'business', 'registration', 'register'],
    search: 'Startup Business Registration',
  },
  {
    id: 'startup-india-registration',
    title: 'Startup India Registration',
    description: 'Register under the Startup India scheme',
    keywords: ['startup', 'india', 'registration', 'dpiit', 'scheme', 'recognition'],
    search: 'Startup India Registration',
  },
  {
    id: 'startup-registration-documents',
    title: 'Startup Registration Documents',
    description: 'Documents needed for startup registration',
    keywords: ['startup', 'registration', 'documents', 'document', 'list'],
    search: 'Startup Registration Documents',
  },
  {
    id: 'startup-registration-process',
    title: 'Startup Registration Process',
    description: 'Steps to register your startup',
    keywords: ['startup', 'registration', 'process', 'procedure', 'steps', 'how'],
    search: 'Startup Registration Process',
  },
  {
    id: 'gst-registration',
    title: 'GST Registration',
    description: 'Register for Goods & Services Tax',
    keywords: ['gst', 'goods', 'services', 'tax', 'registration', 'vat', 'indirect'],
    search: 'GST Registration',
  },
  {
    id: 'pan-registration',
    title: 'PAN Card Registration',
    description: 'Apply for a Permanent Account Number',
    keywords: ['pan', 'permanent', 'account', 'number', 'card', 'tax', 'registration'],
    search: 'PAN Card Registration',
  },
  {
    id: 'trademark-registration',
    title: 'Trademark Registration',
    description: 'Protect your brand / logo / name',
    keywords: ['trademark', 'brand', 'logo', 'ip', 'intellectual', 'property', 'registration'],
    search: 'Trademark Registration',
  },
  {
    id: 'fssai-license',
    title: 'FSSAI Food License',
    description: 'Food safety license for food businesses',
    keywords: ['fssai', 'food', 'safety', 'license', 'licence', 'restaurant', 'eatery'],
    search: 'FSSAI Food License',
  },
  {
    id: 'msme-udyam-registration',
    title: 'MSME / Udyam Registration',
    description: 'Register your MSME under Udyam',
    keywords: ['msme', 'udyam', 'small', 'medium', 'enterprise', 'registration', 'ssi'],
    search: 'MSME / Udyam Registration',
  },
  {
    id: 'shop-establishment-license',
    title: 'Shop & Establishment License',
    description: 'License for shops and commercial establishments',
    keywords: ['shop', 'establishment', 'shops', 'license', 'licence', 'trade', 'commercial'],
    search: 'Shop & Establishment License',
  },
  {
    id: 'import-export-code',
    title: 'Import Export Code (IEC)',
    description: 'Get an IEC to import / export goods',
    keywords: ['import', 'export', 'iec', 'code', 'customs', 'dgc', 'international', 'trade'],
    search: 'Import Export Code (IEC)',
  },
  {
    id: 'professional-tax-registration',
    title: 'Professional Tax Registration',
    description: 'Register for professional tax (PTEC / PTRC)',
    keywords: ['professional', 'tax', 'registration', 'ptec', 'ptrc', 'state'],
    search: 'Professional Tax Registration',
  },
  {
    id: 'llp-registration',
    title: 'LLP Registration',
    description: 'Register a Limited Liability Partnership',
    keywords: ['llp', 'limited', 'liability', 'partnership', 'registration', 'incorporation'],
    search: 'LLP Registration',
  },
  {
    id: 'partnership-registration',
    title: 'Partnership Firm Registration',
    description: 'Register a general partnership firm',
    keywords: ['partnership', 'firm', 'registration', 'partner', 'general'],
    search: 'Partnership Firm Registration',
  },
  {
    id: 'opc-registration',
    title: 'One Person Company (OPC) Registration',
    description: 'Incorporate a One Person Company',
    keywords: ['one', 'person', 'company', 'opc', 'registration', 'incorporation', 'single'],
    search: 'One Person Company (OPC) Registration',
  },
  {
    id: 'nidhi-company-registration',
    title: 'Nidhi Company Registration',
    description: 'Register a mutual benefit (Nidhi) company',
    keywords: ['nidhi', 'company', 'registration', 'mutual', 'benefit', 'finance'],
    search: 'Nidhi Company Registration',
  },
  {
    id: 'section-8-company',
    title: 'Section 8 Company Registration',
    description: 'Register a non-profit Section 8 company',
    keywords: ['section', '8', 'non-profit', 'nonprofit', 'company', 'registration', 'charity', 'ngo'],
    search: 'Section 8 Company Registration',
  },
  {
    id: 'sole-proprietorship-registration',
    title: 'Sole Proprietorship Registration',
    description: 'Register a sole proprietorship business',
    keywords: ['sole', 'proprietorship', 'proprietor', 'business', 'registration'],
    search: 'Sole Proprietorship Registration',
  },
  {
    id: 'income-tax-filing',
    title: 'Income Tax Registration / Filing',
    description: 'File taxes and get your tax registrations done',
    keywords: ['income', 'tax', 'filing', 'file', 'return', 'registration', 'itr'],
    search: 'Income Tax Filing',
  },
  {
    id: 'digital-signature-certificate',
    title: 'Digital Signature Certificate (DSC)',
    description: 'Get a DSC for company / tax filings',
    keywords: ['digital', 'signature', 'certificate', 'dsc', 'token', 'stamping'],
    search: 'Digital Signature Certificate (DSC)',
  },
  {
    id: 'website-and-social',
    title: 'Website & Digital Presence',
    description: 'Build your business website and online presence',
    keywords: ['website', 'web', 'digital', 'presence', 'social', 'media', 'online', 'marketing'],
    search: 'Website & Digital Presence',
  },
  {
    id: 'business-loan',
    title: 'Business Loan Assistance',
    description: 'Get financing / loans for your business',
    keywords: ['business', 'loan', 'finance', 'financing', 'credit', 'borrow', 'funding', 'assistance'],
    search: 'Business Loan Assistance',
  },
]

// Split a raw query string into meaningful lowercase tokens.
export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9&+\-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

// Rank the catalog against a query and return up to `limit` matches.
// Matching supports partial/prefix text, abbreviation ("opc", "gst"),
// and multi-word queries. Results are ordered by relevance.
export function searchServices(query: string, limit = 8): ServiceSuggestion[] {
  const tokens = tokenize(query)
  if (tokens.length === 0) return []

  const scored: { item: ServiceSuggestion; score: number }[] = []

  for (const item of services) {
    const titleTokens = tokenize(item.title)
    const haystack = `${item.title} ${item.keywords.join(' ')}`.toLowerCase()
    let matched = 0
    let score = 0

    for (const t of tokens) {
      // Prefix match against the whole haystack text.
      if (haystack.includes(t)) {
        matched++
        score += t.length
      }
      // Stronger weight when the token matches the title itself.
      if (titleTokens.some((tt) => tt.startsWith(t))) {
        score += titleTokens.length * 2
      }
    }

    if (matched === 0) continue

    const allMatched = matched === tokens.length
    if (!allMatched) {
      // Avoid irrelevant partial matches when the query is fairly specific.
      if (tokens.length > 1 && matched < 2) continue
    }

    scored.push({
      item,
      score: (allMatched ? 1000 : 500) + score,
    })
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((s) => s.item)
}
