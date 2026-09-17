import { useState, FormEvent } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import OwnerDashboard from './OwnerDashboard'
import AdminDashboard from './AdminDashboard'
import { roleHome } from '../components/Layout'

type AccountType = 'customer' | 'business'

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [accountType, setAccountType] = useState<AccountType>('customer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Already signed in? Show that account's dashboard here instead of the
  // registration form.
  if (user?.role === 'BusinessOwner') return <OwnerDashboard />
  if (user?.role === 'Admin') return <AdminDashboard />
  if (user) return <Navigate to={roleHome(user.role)} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await register({ name, email, phone, password, userType: accountType, address, city, state, pincode })
      navigate(accountType === 'business' ? '/dashboard?new=1' : '/')
    }
    catch (err: any) { setError(err.response?.data?.message ?? 'Registration failed.') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto py-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 animate-fadeIn">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-200/60">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Your Account</h1>
          <p className="text-gray-500 text-sm mt-1">
            {accountType === 'customer' ? 'Free user account to browse and buy from local businesses' : 'Get your business discovered by thousands of customers'}
          </p>
        </div>

        {/* Choose account type — users (buyers) or business owners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setAccountType('customer')}
            className={`text-left rounded-xl border-2 px-4 py-3 transition-colors ${accountType === 'customer' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
          >
            <span className="block text-sm font-bold text-gray-900">🛍️ User</span>
            <span className="block text-xs text-gray-500 mt-0.5">Buy products, browse the directory</span>
          </button>
          <button
            type="button"
            onClick={() => setAccountType('business')}
            className={`text-left rounded-xl border-2 px-4 py-3 transition-colors ${accountType === 'business' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
          >
            <span className="block text-sm font-bold text-gray-900">🏢 Business Owner</span>
            <span className="block text-xs text-gray-500 mt-0.5">List &amp; manage your business</span>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input placeholder="Phone number (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
          </div>
          {accountType === 'customer' && (
            <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-4">
              <p className="text-sm font-bold text-gray-900 mb-3">📍 Delivery address</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea placeholder="House no / building name, street, area, landmark" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input placeholder="PIN code" inputMode="numeric" maxLength={10} value={pincode} onChange={(e) => setPincode(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} className="input-field" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input required type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50 shadow-md shadow-primary-200/60 hover:shadow-lg transition-all active:scale-[0.98]">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
