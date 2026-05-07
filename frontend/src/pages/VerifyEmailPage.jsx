import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { authApi } from '../api/client'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) { setStatus('error'); setMessage('No verification token found.'); return }

    authApi.verifyEmail(token)
      .then((res) => { setStatus('success'); setMessage(res.data.message || 'Email verified successfully!') })
      .catch((err) => { setStatus('error'); setMessage(err.response?.data?.detail || 'Verification failed.') })
  }, [params])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader size={48} className="text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-800">Verifying your email...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Email Verified!</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link to="/login" className="btn-primary inline-block">Sign In Now</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link to="/register" className="btn-secondary inline-block">Try Registering Again</Link>
          </>
        )}
      </div>
    </div>
  )
}
