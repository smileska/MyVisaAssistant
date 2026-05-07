import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plane, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { authApi } from '../api/client'

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '', password: '', confirm: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const validate = () => {
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (form.password !== form.confirm) return 'Passwords do not match.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setLoading(true)
    try {
      await authApi.register({
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        email: form.email,
        password: form.password,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-blue-800 px-4 py-12">
        <div className="w-full max-w-md card text-center">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email!</h2>
          <p className="text-gray-500 mb-6">
            We&apos;ve sent a verification link to <strong>{form.email}</strong>. Please verify your email before logging in.
          </p>
          <Link to="/login" className="btn-primary inline-block">Go to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-blue-800 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500 rounded-2xl mb-4">
            <Plane size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-blue-200 mt-1">Join MyVisaAssistant for free</p>
        </div>

        <div className="card">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-5 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                <input type="text" className="input-field" placeholder="John" value={form.first_name} onChange={set('first_name')} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                <input type="text" className="input-field" placeholder="Doe" value={form.last_name} onChange={set('last_name')} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" className="input-field" placeholder="johndoe" value={form.username} onChange={set('username')} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set('password')}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={set('confirm')}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
