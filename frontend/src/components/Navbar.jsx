import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Plane, Map, MessageSquare, History, LogOut, LogIn, User } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700 hover:text-white'
    }`

  return (
    <nav className="bg-navy-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <div className="bg-blue-500 rounded-lg p-1.5">
              <Plane size={20} className="text-white" />
            </div>
            <span className="hidden sm:block">MyVisaAssistant</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/dashboard" className={navLinkClass}>
              <Plane size={16} /> Visa Check
            </NavLink>
            <NavLink to="/map" className={navLinkClass}>
              <Map size={16} /> Map
            </NavLink>
            <NavLink to="/chat" className={navLinkClass}>
              <MessageSquare size={16} /> AI Chat
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/history" className={navLinkClass}>
                <History size={16} /> History
              </NavLink>
            )}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 text-blue-200 text-sm">
                  <User size={16} />
                  <span>{user?.email || 'Account'}</span>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-colors">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-colors">
                  <LogIn size={16} /> Login
                </Link>
                <Link to="/register" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-500 hover:bg-blue-400 text-white transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-blue-100 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              <Plane size={16} /> Visa Check
            </NavLink>
            <NavLink to="/map" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              <Map size={16} /> Map
            </NavLink>
            <NavLink to="/chat" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              <MessageSquare size={16} /> AI Chat
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/history" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                <History size={16} /> History
              </NavLink>
            )}
            <div className="border-t border-blue-800 pt-2 mt-2">
              {isAuthenticated ? (
                <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="flex items-center gap-1.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-colors">
                  <LogOut size={16} /> Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
                    <LogIn size={16} /> Login
                  </Link>
                  <Link to="/register" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
