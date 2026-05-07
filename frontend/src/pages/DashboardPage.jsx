import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plane, Globe, Clock, Phone, DollarSign, Building2, FileText,
  ExternalLink, Download, AlertCircle, Loader, CheckCircle2, XCircle, Info,
} from 'lucide-react'
import { visaApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { COUNTRIES, getVisaBadgeClass } from '../data/countries'
import CountrySelect from '../components/CountrySelect'
import { jsPDF } from 'jspdf'

const VISA_COLORS = {
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: <CheckCircle2 className="text-green-500" size={32} /> },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: <Info className="text-blue-500" size={32} /> },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: <AlertCircle className="text-yellow-500" size={32} /> },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: <XCircle className="text-red-500" size={32} /> },
}

function getColorTheme(colorName = '') {
  const c = colorName.toLowerCase()
  if (c.includes('green') || c.includes('free')) return VISA_COLORS.green
  if (c.includes('blue') || c.includes('arrival')) return VISA_COLORS.blue
  if (c.includes('yellow') || c.includes('e-visa') || c.includes('evisa')) return VISA_COLORS.yellow
  return VISA_COLORS.red
}

function InfoRow({ icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div>
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</div>
        <div className="text-sm text-gray-800 font-medium mt-0.5">{value}</div>
      </div>
    </div>
  )
}

function VisaResult({ data, passportLabel, onReset }) {
  const { destination: dest, visa_rule: rule, mandatory_registration: reg } = data
  const theme = getColorTheme(rule.color)

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('MyVisaAssistant — Visa Report', 14, 20)
    doc.setFontSize(12)
    doc.text(`Passport: ${passportLabel}`, 14, 35)
    doc.text(`Destination: ${dest.name} (${dest.code})`, 14, 43)
    doc.text(`Visa Type: ${rule.name}`, 14, 51)
    if (rule.duration) doc.text(`Max Stay: ${rule.duration}`, 14, 59)
    doc.text(`Capital: ${dest.capital}`, 14, 67)
    doc.text(`Currency: ${dest.currency}`, 14, 75)
    if (dest.embassy_url) doc.text(`Embassy: ${dest.embassy_url}`, 14, 83)
    if (reg) doc.text(`Mandatory Registration: ${reg.name}`, 14, 91)
    doc.text(`Report generated: ${new Date().toLocaleDateString()}`, 14, 110)
    doc.save(`visa-report-${dest.code}.pdf`)
  }

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `visa-report-${dest.code}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5 mt-8">
      {/* Visa Status Banner */}
      <div className={`rounded-xl border-2 ${theme.bg} ${theme.border} p-6 flex items-start gap-4`}>
        <div className="flex-shrink-0">{theme.icon}</div>
        <div className="flex-1">
          <h2 className={`text-xl font-bold ${theme.text}`}>{rule.name}</h2>
          {rule.duration && (
            <p className={`text-sm mt-1 ${theme.text} opacity-80`}>
              Maximum stay: <strong>{rule.duration}</strong>
            </p>
          )}
          {rule.link && (
            <a href={rule.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:underline">
              Official info <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Destination Info */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Globe size={18} className="text-blue-500" /> Destination: {dest.name}
          </h3>
          <InfoRow icon={<Building2 size={16} />} label="Capital" value={dest.capital} />
          <InfoRow icon={<DollarSign size={16} />} label="Currency" value={dest.currency + (dest.exchange ? ` — ${dest.exchange}` : '')} />
          <InfoRow icon={<Globe size={16} />} label="Continent" value={dest.continent} />
          <InfoRow icon={<Clock size={16} />} label="Timezone" value={dest.timezone} />
          <InfoRow icon={<Phone size={16} />} label="Phone code" value={dest.phone_code ? `+${dest.phone_code}` : null} />
          <InfoRow icon={<FileText size={16} />} label="Passport validity" value={dest.passport_validity} />
          {dest.population && (
            <InfoRow icon={<Globe size={16} />} label="Population" value={dest.population.toLocaleString()} />
          )}
          {dest.embassy_url && (
            <div className="flex items-start gap-3 py-3">
              <div className="text-gray-400 mt-0.5"><Building2 size={16} /></div>
              <div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Embassy</div>
                <a href={dest.embassy_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                  Visit embassy page <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Visa Details */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-blue-500" /> Visa Details
            </h3>
            <InfoRow icon={<CheckCircle2 size={16} />} label="Visa type" value={rule.name} />
            <InfoRow icon={<Clock size={16} />} label="Allowed stay" value={rule.duration} />
          </div>

          {reg && (
            <div className="card border-l-4 border-amber-400">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-500" /> Mandatory Registration
              </h3>
              <p className="text-sm text-gray-600">{reg.name}</p>
              {reg.link && (
                <a href={reg.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:underline">
                  Learn more <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}

          {/* Download Report */}
          <div className="card bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Download size={18} /> Download Report
            </h3>
            <div className="flex gap-3">
              <button onClick={downloadPDF} className="btn-primary text-sm flex-1">PDF</button>
              <button onClick={downloadJSON} className="btn-secondary text-sm flex-1">JSON</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onReset} className="btn-secondary">New Search</button>
        <Link to="/chat" className="btn-primary flex items-center gap-2">
          Ask AI for more details
        </Link>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { isAuthenticated } = useAuth()
  const [passport, setPassport] = useState('')
  const [destination, setDestination] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const passportLabel = COUNTRIES.find((c) => c.value === passport)?.label || passport

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!passport || !destination) { setError('Please select both passport and destination country.'); return }
    if (passport === destination) { setError('Passport and destination cannot be the same country.'); return }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const checkFn = isAuthenticated ? visaApi.check : visaApi.checkGuest
      const res = await checkFn(passport, destination)
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch visa information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Plane className="text-blue-600" size={32} /> Visa Check
          </h1>
          <p className="text-gray-500 mt-2">
            Select your passport and destination country to instantly check visa requirements.
          </p>
          {!isAuthenticated && (
            <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-3 py-1.5 text-sm">
              <Info size={14} />
              <Link to="/login" className="underline font-medium">Sign in</Link> to save your search history.
            </div>
          )}
        </div>

        {/* Search Form */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Plane size={14} /> Your Passport (Nationality)
                  </span>
                </label>
                <CountrySelect
                  id="passport"
                  value={passport}
                  onChange={setPassport}
                  placeholder="Select your country..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Globe size={14} /> Destination Country
                  </span>
                </label>
                <CountrySelect
                  id="destination"
                  value={destination}
                  onChange={setDestination}
                  placeholder="Where are you going?"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button type="submit" disabled={loading || !passport || !destination} className="btn-primary flex items-center gap-2">
              {loading ? <><Loader size={16} className="animate-spin" /> Checking...</> : <><Plane size={16} /> Check Visa Requirements</>}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <VisaResult
            data={result}
            passportLabel={passportLabel}
            onReset={() => { setResult(null); setPassport(''); setDestination('') }}
          />
        )}
      </div>
    </div>
  )
}
