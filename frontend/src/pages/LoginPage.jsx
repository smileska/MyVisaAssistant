import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plane, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(form.email, form.password)
      login(res.data.access_token, { email: form.email })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-blue-800 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500 rounded-2xl mb-4">
            <Plane size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-blue-200 mt-1">Sign in to your MyVisaAssistant account</p>
        </div>

        <div className="card">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-5 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center space-y-3">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                Create one
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              Or{' '}
              <Link to="/dashboard" className="text-gray-500 hover:underline">
                continue as guest
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
