import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  History, Trash2, ChevronDown, ChevronUp, AlertCircle, Loader,
  Plane, Globe, Clock, Calendar, ExternalLink, Download,
} from 'lucide-react'
import { historyApi } from '../api/client'
import { COUNTRIES, getVisaBadgeClass } from '../data/countries'
import { jsPDF } from 'jspdf'

function getCountryLabel(code) {
  return COUNTRIES.find((c) => c.value === code?.toUpperCase())?.label || code
}

function HistoryItem({ entry, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const result = entry.result

  const handleDelete = async () => {
    if (!window.confirm('Delete this history entry?')) return
    setDeleting(true)
    try { await onDelete(entry.id) } finally { setDeleting(false) }
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('MyVisaAssistant — Visa Report', 14, 20)
    doc.setFontSize(11)
    const d = result?.destination
    const r = result?.visa_rule
    doc.text(`Passport: ${getCountryLabel(entry.passport_code)} (${entry.passport_code})`, 14, 34)
    doc.text(`Destination: ${d?.name || entry.destination_code}`, 14, 42)
    if (r) {
      doc.text(`Visa Type: ${r.name}`, 14, 50)
      if (r.duration) doc.text(`Max Stay: ${r.duration}`, 14, 58)
    }
    if (d) {
      doc.text(`Capital: ${d.capital}`, 14, 66)
      doc.text(`Currency: ${d.currency}`, 14, 74)
    }
    doc.text(`Date: ${new Date(entry.created_at).toLocaleDateString()}`, 14, 90)
    doc.save(`visa-${entry.destination_code}-${new Date(entry.created_at).toISOString().slice(0,10)}.pdf`)
  }

  const badgeClass = result?.visa_rule ? getVisaBadgeClass(result.visa_rule.color) : 'badge-red'

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Plane size={20} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-gray-900">
                {getCountryLabel(entry.passport_code)}
              </span>
              <span className="text-gray-400">→</span>
              <span className="font-semibold text-gray-900">
                {result?.destination?.name || getCountryLabel(entry.destination_code)}
              </span>
              {result?.visa_rule && (
                <span className={badgeClass}>{result.visa_rule.name}</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar size={11} /> {new Date(entry.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              {result?.visa_rule?.duration && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={11} /> {result.visa_rule.duration}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={downloadPDF} title="Download PDF" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Download size={16} />
          </button>
          <button onClick={handleDelete} disabled={deleting} title="Delete" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            {deleting ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && result && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {result.destination && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Globe size={11} /> Destination Info
              </h4>
              <div className="text-sm space-y-1 text-gray-600">
                <div><span className="text-gray-400">Capital:</span> {result.destination.capital}</div>
                <div><span className="text-gray-400">Currency:</span> {result.destination.currency}</div>
                <div><span className="text-gray-400">Continent:</span> {result.destination.continent}</div>
                {result.destination.timezone && <div><span className="text-gray-400">Timezone:</span> {result.destination.timezone}</div>}
                {result.destination.embassy_url && (
                  <a href={result.destination.embassy_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    Embassy <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          )}
          {result.visa_rule && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Visa Details</h4>
              <div className="text-sm space-y-1 text-gray-600">
                <div><span className="text-gray-400">Type:</span> {result.visa_rule.name}</div>
                {result.visa_rule.duration && <div><span className="text-gray-400">Max stay:</span> {result.visa_rule.duration}</div>}
                {result.visa_rule.link && (
                  <a href={result.visa_rule.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    Official link <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          )}
          {result.mandatory_registration && (
            <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="text-xs font-semibold text-amber-700 mb-1">Mandatory Registration</div>
              <div className="text-sm text-amber-800">{result.mandatory_registration.name}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function HistoryPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    historyApi.getAll()
      .then((res) => setEntries(res.data))
      .catch(() => setError('Failed to load search history.'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    await historyApi.delete(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <History className="text-blue-600" size={32} /> Search History
            </h1>
            <p className="text-gray-500 mt-2">Your previous visa searches, saved for quick access.</p>
          </div>
          {entries.length > 0 && (
            <div className="text-sm text-gray-400">{entries.length} search{entries.length !== 1 ? 'es' : ''}</div>
          )}
        </div>

        {loading && (
          <div className="text-center py-16">
            <Loader size={32} className="text-blue-500 animate-spin mx-auto" />
            <p className="text-gray-500 mt-3">Loading your history...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <History size={32} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No searches yet</h3>
            <p className="text-gray-500 mb-6">Start checking visa requirements and your searches will appear here.</p>
            <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
              <Plane size={16} /> Check Visa Requirements
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {entries.map((entry) => (
            <HistoryItem key={entry.id} entry={entry} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  )
}
