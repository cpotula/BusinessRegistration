import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { useAuth } from '../auth/AuthContext'
import { api } from '../api/client'
import usePageTitle from '../hooks/usePageTitle'

function inr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

export default function CartPage() {
  usePageTitle('Your Cart — Enterprise Business Portal')
  const { items, count, total, setQty, removeItem, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [placedNo, setPlacedNo] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [deliveryName, setDeliveryName] = useState(user?.name ?? '')
  const [deliveryPhone, setDeliveryPhone] = useState(user?.phone ?? '')
  const [deliveryAddress, setDeliveryAddress] = useState('')

  const placeOrder = async () => {
    if (!user || items.length === 0) return
    if (!deliveryName.trim() || !deliveryPhone.trim() || !deliveryAddress.trim()) {
      setError('Please enter your name, phone and delivery address.')
      return
    }
    setPlacing(true); setError('')
    try {
      const { data } = await api.post('/orders', {
        items: items.map((i) => ({ productId: i.productId, quantity: i.qty })),
        delivery: true,
        deliveryName: deliveryName.trim(),
        deliveryPhone: deliveryPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
      })
      setPlacedNo(data.orderNumber)
      clear()
    } catch (ex: any) {
      setError(ex.response?.data?.message ?? 'Could not place the order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0 && !placedNo) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 bg-white rounded-2xl border">
        <div className="text-5xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-gray-500 mt-2">Browse the directory and add some products to your cart.</p>
        <Link to="/directory" className="inline-block mt-6 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
          Browse Directory
        </Link>
      </div>
    )
  }

  if (placedNo) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16 bg-green-50 rounded-2xl border border-green-200">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-800">Order request sent!</h1>
        <p className="text-green-700 mt-2 max-w-md mx-auto">
          Thank you, {user?.name}! Your order <span className="font-semibold">#{placedNo}</span> has been sent to the seller(s) and they will contact you shortly to complete the purchase.
        </p>
        <button onClick={() => { setPlacedNo(null); navigate('/directory') }} className="mt-6 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
      <p className="text-gray-500 mb-6">{count} item{count === 1 ? '' : 's'} in your cart</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Items */}
        <div className="space-y-4">
          {items.map((i) => (
            <div key={i.productId} className="bg-white border rounded-2xl p-4 flex gap-4 items-center">
              {i.image ? (
                <img src={i.image} alt={i.name} className="w-20 h-20 rounded-xl object-cover border shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-2xl shrink-0">🛍</div>
              )}
              <div className="flex-1 min-w-0">
                <Link to={`/products/${i.productId}`} className="font-semibold text-gray-900 hover:text-primary-700 transition-colors line-clamp-1">{i.name}</Link>
                <p className="text-xs text-gray-400 mt-0.5">{i.businessName}</p>
                <p className="font-bold text-primary-700 mt-1">{inr(i.price ?? 0)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(i.productId, i.qty - 1)} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">−</button>
                <span className="w-8 text-center font-semibold">{i.qty}</span>
                <button onClick={() => setQty(i.productId, i.qty + 1)} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">＋</button>
              </div>
              <button onClick={() => removeItem(i.productId)} className="text-sm text-red-500 hover:underline shrink-0">Remove</button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white border rounded-2xl p-6 lg:sticky lg:top-24">
          <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Items ({count})</span>
              <span>{inr(total)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Home delivery</span>
              <span className="text-primary-600">Details below</span>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-xl font-extrabold text-gray-900">{inr(total)}</span>
          </div>

          {!user ? (
            <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              <p className="font-semibold">Login required to place the order</p>
              <p className="text-xs mt-1">Your cart is saved. Login or create a free user account to checkout.</p>
              <Link
                to="/login"
                className="mt-3 block text-center px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
              >
                Login to Checkout
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-5 rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-bold text-gray-900 mb-1">🚚 Delivery details</p>
                <p className="text-xs text-gray-500 mb-4">Where should the seller deliver your order?</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                    <input required value={deliveryName} onChange={(e) => setDeliveryName(e.target.value)} placeholder="Full name" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                    <input required value={deliveryPhone} onChange={(e) => setDeliveryPhone(e.target.value)} placeholder="Phone number" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Address</label>
                    <textarea required value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="House no / building name, street, area, landmark" className="input-field" rows={3} />
                  </div>
                </div>
              </div>
              {error && <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
              <button
                onClick={placeOrder}
                disabled={placing}
                className="mt-5 w-full px-5 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors shadow-md shadow-primary-100 disabled:opacity-50"
              >
                {placing ? 'Placing order…' : 'Place Order'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}