import { Link } from 'react-router-dom'
import { Plane, Map, MessageSquare, History, Shield, Zap, Globe } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    icon: <Plane className="text-blue-500" size={28} />,
    title: 'Instant Visa Check',
    desc: 'Enter your passport country and destination to instantly find out if you need a visa, what type, and for how long.',
  },
  {
    icon: <Map className="text-emerald-500" size={28} />,
    title: 'Interactive World Map',
    desc: 'See the entire world color-coded by your visa requirements — green for visa-free, blue for on arrival, and more.',
  },
  {
    icon: <MessageSquare className="text-violet-500" size={28} />,
    title: 'AI Visa Assistant',
    desc: 'Chat with our AI-powered assistant to get answers about visa procedures, required documents, and travel tips.',
  },
  {
    icon: <History className="text-amber-500" size={28} />,
    title: 'Search History',
    desc: 'All your previous visa searches are saved and accessible anytime, so you can revisit information quickly.',
  },
]

const stats = [
  { label: 'Countries covered', value: '190+' },
  { label: 'Visa categories', value: '4' },
  { label: 'AI-powered responses', value: '24/7' },
]

export default function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-navy-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-800 rounded-full px-4 py-1.5 text-blue-200 text-sm font-medium mb-6">
            <Zap size={14} /> Powered by AI
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Your Smart
            <span className="text-blue-400"> Visa </span>
            Assistant
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-10">
            Instantly check visa requirements for any destination. No more confusion — get clear, accurate travel information in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
              <Plane size={18} /> Check Visa Requirements
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="btn-secondary text-base px-8 py-3 inline-flex items-center gap-2 bg-transparent border-blue-400 text-blue-200 hover:bg-blue-800 hover:border-blue-300">
                <Shield size={18} /> Create Free Account
              </Link>
            )}
          </div>

          {/* Quick guest access */}
          {!isAuthenticated && (
            <p className="mt-4 text-blue-300 text-sm">
              No account needed —{' '}
              <Link to="/dashboard" className="underline hover:text-white">
                continue as guest
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold">{s.value}</div>
                <div className="text-blue-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to travel smarter</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              MyVisaAssistant brings together real-time visa data, AI assistance, and interactive maps in one place.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card hover:shadow-md transition-shadow">
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Choose countries', desc: 'Select your passport country and travel destination from our comprehensive list.' },
              { step: '02', title: 'Get visa info', desc: 'Receive instant information about visa requirements, type, duration, and required documents.' },
              { step: '03', title: 'Travel confidently', desc: 'Download a report, chat with our AI for more details, or save the search for later.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-5xl font-black text-blue-100 mb-3">{s.step}</div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Globe size={40} className="text-blue-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ready to explore the world?</h2>
          <p className="text-blue-200 mb-8">Start checking visa requirements for free — no registration required.</p>
          <Link to="/dashboard" className="btn-primary text-base px-10 py-3 inline-flex items-center gap-2">
            <Plane size={18} /> Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Plane size={16} className="text-blue-400" />
          <span className="text-white font-semibold">MyVisaAssistant</span>
        </div>
        <p>© {new Date().getFullYear()} MyVisaAssistant — Team 42. All rights reserved.</p>
      </footer>
    </div>
  )
}
