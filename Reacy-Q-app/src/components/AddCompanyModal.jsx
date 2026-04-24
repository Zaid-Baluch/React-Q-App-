// Modal for adding a new company
import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default marker icon (Vite asset issue)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Lives INSIDE MapContainer — watches lat/lng and flies map there
const MapController = ({ lat, lng }) => {
  const map = useMap()
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 15)
    }
  }, [lat, lng])
  return null
}

// Handle map click → reverse geocode
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

const INITIAL_FORM = {
  name: '',
  since: '',
  opens: '09:00',
  closes: '18:00',
  address: '',
  lat: 24.8607,
  lng: 67.0011,
}

const AddCompanyModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState(INITIAL_FORM)
  const [searchQuery, setSearchQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [searching, setSearching] = useState(false)
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')

  // Search address using Nominatim (free, no API key)
  const handleAddressSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0]
        // ✅ Update lat/lng → triggers MapController to fly map there
        setForm((prev) => ({
          ...prev,
          lat: parseFloat(lat),
          lng: parseFloat(lon),
          address: display_name,
        }))
        setSearchQuery(display_name)
        setErrors((e) => ({ ...e, address: '' }))
      }
    } catch (err) {
      console.error('Geocoding error:', err)
    } finally {
      setSearching(false)
    }
  }

  // Map click → reverse geocode to get address string
  const handleMapClick = async (lat, lng) => {
    setForm((prev) => ({ ...prev, lat, lng }))
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      )
      const data = await res.json()
      if (data.display_name) {
        setForm((prev) => ({ ...prev, address: data.display_name }))
        setSearchQuery(data.display_name)
        setErrors((e) => ({ ...e, address: '' }))
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err)
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Company name is required'
    if (!form.address.trim()) newErrors.address = 'Address is required'
    return newErrors
  }

  const handleSubmit = async () => {
    setSaveError('')
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setSaving(true)
    try {
      await onSave(form)
    } catch (err) {
      console.error('Save error:', err)
      setSaveError('Failed to save. Check Firestore rules or internet connection.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-xl font-bold text-gray-800">Add your company</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="px-6 pb-6 space-y-4">

          {/* Save error */}
          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {saveError}
            </div>
          )}

          {/* Company Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Company name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Saylani"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value })
                setErrors((er) => ({ ...er, name: '' }))
              }}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Since / Opens / Closes */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Since</label>
              <input
                type="number"
                placeholder="2010"
                min="1900"
                max={new Date().getFullYear()}
                value={form.since}
                onChange={(e) => setForm({ ...form, since: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Opens</label>
              <input
                type="time"
                value={form.opens}
                onChange={(e) => setForm({ ...form, opens: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Closes</label>
              <input
                type="time"
                value={form.closes}
                onChange={(e) => setForm({ ...form, closes: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Address search */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                placeholder="Search address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                onClick={handleAddressSearch}
                disabled={searching}
                className="bg-gray-800 hover:bg-gray-700 disabled:opacity-60 text-white px-3 py-2 rounded-lg transition-colors"
              >
                {searching ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          {/* Map — MapController inside handles auto-pan */}
          <div className="rounded-xl overflow-hidden border border-gray-200 h-52">
            <MapContainer
              center={[form.lat, form.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              />
              {/* ✅ Auto-pans map when lat/lng changes */}
              <MapController lat={form.lat} lng={form.lng} />
              <Marker position={[form.lat, form.lng]} />
              <MapClickHandler onLocationSelect={handleMapClick} />
            </MapContainer>
          </div>
          <p className="text-xs text-gray-400">Tip: search above or click anywhere on the map.</p>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white transition-colors"
            >
              {saving ? 'Saving...' : 'Save company'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default AddCompanyModal
