import { useState, FormEvent } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { roleHome } from '../components/Layout'
import usePageTitle from '../hooks/usePageTitle'

export default function Login() {
  usePageTitle('Login — Enterprise Business Portal')
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Already signed in? Send them straight to their home / workspace.
  if (user) return <Navigate to={roleHome(user.role)} replace />

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
    <div className="max-w-md mx-auto py-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 sm:p-10 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-primary-200/60">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1.5">Sign in to buy products or manage your business</p>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="label">Email</label>
            <input required type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Password</label>
            <input required type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50 shadow-md shadow-primary-200/50 hover:shadow-lg transition-all active:scale-[0.98]">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          New here? <Link to="/register" className="text-primary-600 font-semibold hover:underline">Register Now</Link> — pick user or business account
        </p>
      </div>
    </div>
  )
}