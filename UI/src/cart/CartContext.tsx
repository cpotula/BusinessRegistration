import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// A simple browser-stored shopping cart. Items survive refreshes and work
// for guests too; login is only required at the checkout step.
export interface CartItem {
  productId: number
  name: string
  price: number | null
  image: string | null
  businessName: string
  businessSlug: string
  qty: number
}

interface CartCtx {
  items: CartItem[]
  count: number
  total: number
  addItem: (item: Omit<CartItem, 'qty'>) => void
  setQty: (productId: number, qty: number) => void
  removeItem: (productId: number) => void
  clear: () => void
}

const KEY = 'cart'
const Ctx = createContext<CartCtx>(null!)

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items))
  }, [items])

  const addItem = (item: Omit<CartItem, 'qty'>) =>
    setItems((prev) => {
      const existing = prev.find((x) => x.productId === item.productId)
      if (existing) return prev.map((x) => (x.productId === item.productId ? { ...x, qty: x.qty + 1 } : x))
      return [...prev, { ...item, qty: 1 }]
    })

  const setQty = (productId: number, qty: number) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((x) => x.productId !== productId)
        : prev.map((x) => (x.productId === productId ? { ...x, qty } : x)),
    )

  const removeItem = (productId: number) =>
    setItems((prev) => prev.filter((x) => x.productId !== productId))

  const clear = () => setItems([])

  const count = items.reduce((s, i) => s + i.qty, 0)
  const total = items.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0)

  return (
    <Ctx.Provider value={{ items, count, total, addItem, setQty, removeItem, clear }}>
      {children}
    </Ctx.Provider>
  )
}

export const useCart = () => useContext(Ctx)