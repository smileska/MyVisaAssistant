import { useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { Map, Loader, AlertCircle, ZoomIn, ZoomOut } from 'lucide-react'
import { mapApi } from '../api/client'
import { COUNTRIES, getMapFillColor } from '../data/countries'
import CountrySelect from '../components/CountrySelect'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const LEGEND = [
  { color: '#22c55e', label: 'Visa Free' },
  { color: '#3b82f6', label: 'Visa on Arrival' },
  { color: '#eab308', label: 'e-Visa / Electronic' },
  { color: '#ef4444', label: 'Visa Required' },
  { color: '#d1d5db', label: 'No Data' },
]

export default function MapPage() {
  const [passport, setPassport] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [colors, setColors] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const [zoom, setZoom] = useState(1)

  const handleSearch = async () => {
    if (!passport) return

    setError('')
    setLoading(true)
    setColors(null)

    try {
      const res = await mapApi.getColors(passport)
      setColors(res.data.colors || {})
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load map data.')
    } finally {
      setLoading(false)
    }
  }

  const passportLabel = COUNTRIES.find((c) => c.value === passport)?.label || ''

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Map className="text-blue-600" size={32} /> Interactive Visa Map
          </h1>
          <p className="text-gray-500 mt-2">
            Select your passport to see all countries color-coded by visa requirement.
          </p>
        </div>

        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Passport</label>
              <CountrySelect value={passport} onChange={setPassport} placeholder="Select your passport country..." />
            </div>
            <button
              onClick={handleSearch}
              disabled={!passport || loading}
              className="btn-primary flex items-center gap-2 sm:w-auto w-full"
            >
              {loading ? <><Loader size={16} className="animate-spin" /> Loading...</> : <><Map size={16} /> Show Map</>}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-5 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="card p-0 overflow-hidden">
          <div className="bg-navy-900 p-4 flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">
              {passportLabel ? `Travel map for ${passportLabel} passport` : 'Select a passport to load the map'}
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setZoom(z => Math.min(z + 0.5, 8))} className="p-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white">
                <ZoomIn size={16} />
              </button>
              <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="p-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white">
                <ZoomOut size={16} />
              </button>
            </div>
          </div>

          <div className="bg-[#d4e6f1] relative" style={{ height: '500px' }}>
            <ComposableMap projectionConfig={{ scale: 147 }} style={{ width: '100%', height: '100%' }}>
              <ZoomableGroup zoom={zoom}>
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const countryName = geo.properties?.name

const country = COUNTRIES.find(
  (c) =>
    c.label === countryName ||
    (countryName === 'United States of America' && c.value === 'US') ||
    (countryName === 'Russian Federation' && c.value === 'RU') ||
    (countryName === 'Korea, Republic of' && c.value === 'KR') ||
    (countryName === "Korea, Democratic People's Republic of" && c.value === 'KP')
)

const iso2 = country?.value

                      const fill =
                        iso2 && colors?.[iso2]
                          ? getMapFillColor(colors[iso2])
                          : colors ? '#d1d5db' : '#9fb3c8'

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fill}
                          stroke="#fff"
                          strokeWidth={0.3}
                          style={{
                            default: { outline: 'none', cursor: 'pointer' },
                            hover: { fill: '#1d4ed8', outline: 'none' },
                            pressed: { outline: 'none' },
                          }}
                          onMouseEnter={() => setTooltip(countryName || 'Unknown')}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      )
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>

            {tooltip && (
              <div className="absolute bottom-4 left-4 bg-navy-900 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none">
                {tooltip}
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <Loader size={36} className="text-blue-500 animate-spin" />
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-4 justify-center">
              {LEGEND.map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: l.color }} />
                  <span className="text-xs text-gray-600">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {colors && (
          <p className="text-center text-sm text-gray-400 mt-4">
            Showing visa requirements for <strong>{passportLabel}</strong> passport holders.
            Click a country on the map to highlight it.
          </p>
        )}
      </div>
    </div>
  )
}