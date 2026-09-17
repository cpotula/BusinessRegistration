import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { roleHome } from '../components/Layout'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await login(email, password)
      // Send each role straight to its own workspace
      const stored = JSON.parse(localStorage.getItem('user') ?? 'null')
      navigate(roleHome(stored?.role))
    }
    catch (err: any) { setError(err.response?.data?.message ?? 'Login failed.') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl border shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to manage your business</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input required type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          New here? <Link to="/register" className="text-primary-600 font-medium hover:underline">Register your business</Link>
        </p>
        <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-400">
          <p className="font-medium mb-1">Demo Accounts:</p>
          <p>Admin: admin@businessportal.local / Admin@123</p>
          <p>Owner: owner@businessportal.local / Owner@123</p>
        </div>
      </div>
    </div>
  )
}
