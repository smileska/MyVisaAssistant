import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import DashboardPage from './pages/DashboardPage'
import MapPage from './pages/MapPage'
import ChatPage from './pages/ChatPage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth pages — no navbar */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyEmailPage />} />

          {/* Pages with navbar */}
          <Route
            path="/*"
            element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route
                      path="/history"
                      element={
                        <ProtectedRoute>
                          <HistoryPage />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
