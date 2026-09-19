import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { api } from '../api/client'
import { OrderInfo } from '../api/types'
import OrderStatusBar, { ORDER_STATUS_LABELS, OrderStatus } from '../components/OrderStatusBar'

function inr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

export default function MyOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    api.get('/orders/my').then(({ data }) => setOrders(data)).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-2xl border">
        <div className="text-5xl mb-4">📦</div>
        <h1 className="text-2xl font-bold text-gray-900">Login to see your orders</h1>
        <p className="text-gray-500 mt-2">Track and follow up on your order requests here.</p>
        <Link to="/login" className="inline-block mt-6 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
          Login
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Orders</h1>
      <p className="text-gray-500 text-sm mb-6">Your order requests and their confirmation status.</p>

      {loading ? <p className="text-gray-500">Loading your orders…</p> : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-gray-500">You have not placed any orders yet.</p>
          <Link to="/directory" className="inline-block mt-5 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
            Browse Directory
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const total = o.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0)
            const st = o.status as OrderStatus
            const label = ORDER_STATUS_LABELS[st] ?? o.status
            return (
              <div key={o.id} className="bg-white rounded-2xl border overflow-hidden">
                <div className={`px-5 py-3 flex flex-wrap justify-between gap-2 items-center ${st === 'Delivered' ? 'bg-green-50' : st === 'Pending' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Order #{o.orderNumber}</p>
                    <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st === 'Pending' ? 'bg-amber-500 text-white' : st === 'Delivered' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                    {o.status === 'Pending' ? 'Pending — awaiting seller confirmation' : label}
                  </span>
                </div>
                <div className="px-5 py-4">
                  <ul className="space-y-3">
                    {o.items.map((it) => (
                      <li key={it.id} className="flex items-center gap-3">
                        {it.imageUrl && <img src={it.imageUrl} alt={it.productName} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{it.productName}</p>
                          <p className="text-xs text-gray-400">{it.businessName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{it.quantity} × {inr(it.unitPrice)}</p>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{inr(it.unitPrice * it.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t flex justify-between text-sm font-semibold text-gray-900">
                    <span>Total</span><span>{inr(total)}</span>
                  </div>
                  {o.deliveryAddress && (
                    <div className="mt-3 rounded-xl bg-primary-50 border border-primary-100 px-4 py-3 text-sm">
                      <p className="text-xs font-bold uppercase tracking-wide text-primary-700 mb-1">🚚 Deliver to</p>
                      <p className="text-sm font-medium text-gray-900">{o.deliveryName}</p>
                      {o.deliveryPhone && <p className="text-xs text-gray-600 mt-0.5">{o.deliveryPhone}</p>}
                      <p className="text-xs text-gray-600 mt-0.5">{o.deliveryAddress}</p>
                    </div>
                  )}
                  <div className="mt-4">
                    <OrderStatusBar status={o.status} />
                  </div>
                  {o.status === 'Pending' && (
                    <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      Awaiting seller confirmation. You'll be notified as soon as the seller confirms your order.
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}