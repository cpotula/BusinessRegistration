import { api } from '../api/client'
import { ProductSearchItem } from '../api/types'

export interface MatchResult {
  product: ProductSearchItem
  pct: number
}

const MIN_MATCH = 25

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()

// Common product synonyms so a loosely-worded search (e.g. "solid drive",
// "hard disk") still finds the matching product.
const SYNONYM_TERMS: [string, string[]][] = [
  ['solid state drive', ['ssd']],
  ['solid state', ['ssd']],
  ['solid drive', ['ssd']],
  ['solid', ['ssd']],
  ['hard disk', ['hdd']],
  ['hard drive', ['hdd']],
  ['hdd', ['harddrive', 'hard']],
  ['ssd', ['solid', 'solidstate']],
]

function expandQuery(query: string): string[] {
  const q = normalize(query)
  const words: string[] = []
  for (const [phrase, targets] of SYNONYM_TERMS) {
    if (q.includes(phrase)) words.push(...targets)
  }
  return words
}

// Levenshtein edit distance between two short words.
function editDistance(a: string, b: string): number {
  const m = a.length, n = b.length
  const d: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) d[i][0] = i
  for (let j = 0; j <= n; j++) d[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
  return d[m][n]
}

// Length-normalised edit-distance similarity (0..1). Only genuine
// misspellings score high ("bryani" ~ "biryani"); unrelated words such as
// "drive" vs "denim" are properly rejected instead of sharing scattered chars.
function fuzzy(q: string, tok: string): number {
  if (!tok) return 0
  return 1 - editDistance(q, tok) / Math.max(q.length, tok.length)
}

// How close a single search word is to some text. Exact / prefix / substring
// hits are strong (0.75+). Fuzzy matches are accepted only when the closest
// word in the text is genuinely similar (>=0.6 similarity) AND the word is
// long enough - so short words like "solid" never match unrelated words like
// "spice", and "drive" never matches "denim".
function wordToTextScore(q: string, t: string): number {
  if (!t) return 0
  const ql = q.length
  if (ql === 0) return 0
  if (t === q) return 1
  if (t.startsWith(q) && ql >= 2) return 0.9
  if (t.includes(q) && ql >= 2) return 0.75
  if (ql < 3) return 0
  const tokScores = t.split(' ').filter(Boolean).map((tok) => fuzzy(q, tok))
  const bestTok = Math.max(...tokScores, 0)
  if (bestTok < 0.6) return 0
  return 0.4 + 0.6 * (bestTok - 0.6) / (1 - 0.6)
}

// Match percentage (0-100) of a product against the typed query. Name matches
// count most, then the business name, then the description. Synonyms are
// expanded first (e.g. "solid drive" -> "ssd"), and every typed word must
// contribute a genuine match.
function matchPercent(p: ProductSearchItem, query: string): number {
  const typed = normalize(query).split(' ').filter(Boolean)
  if (typed.length === 0) return 0
  const words = [...new Set([...typed, ...expandQuery(query)])]
  const nameText = normalize(p.name)
  const bizText = normalize(p.businessName)
  const descText = normalize(p.description ?? '')
  const wordScores = words.map((w) => Math.max(
    wordToTextScore(w, nameText),
    wordToTextScore(w, bizText) * 0.8,
    wordToTextScore(w, descText) * 0.6,
  )).filter((s) => s > 0)
  if (wordScores.length === 0) return 0
  const best = Math.max(...wordScores)
  const avg = wordScores.reduce((s, x) => s + x, 0) / wordScores.length
  return Math.round(Math.min(1, best * 0.7 + avg * 0.3) * 100)
}

// Live fuzzy search over an already-loaded product list. An empty query
// returns every product at 100%.
export function searchProducts(products: ProductSearchItem[], query: string): MatchResult[] {
  const q = query.trim()
  if (!q) return products.map((product) => ({ product, pct: 100 }))
  return products
    .map((product) => ({ product, pct: matchPercent(product, q) }))
    .filter((r) => r.pct >= MIN_MATCH)
    .sort((a, b) => b.pct - a.pct)
}

export function pctBadgeClass(pct: number): string {
  if (pct >= 60) return 'bg-green-50 text-green-700 border-green-200'
  if (pct >= 40) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-gray-50 text-gray-600 border-gray-200'
}

// All approved, published products - fetched once and shared by the search
// bar autocomplete, the search results page and the customer dashboard.
let catalogPromise: Promise<ProductSearchItem[]> | null = null
export function getCatalog(): Promise<ProductSearchItem[]> {
  if (!catalogPromise) {
    catalogPromise = api
      .get('/products/search?pageSize=50')
      .then(({ data }) => (data.items as ProductSearchItem[]) || [])
      .catch(() => [])
  }
  return catalogPromise
}