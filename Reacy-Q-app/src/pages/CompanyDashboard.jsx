// Company Dashboard — shows list of user's companies + add new
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useCompanyStore from '../store/companyStore'
import { fetchMyCompanies, addCompany, deleteCompany } from '../services/companyService'
import AddCompanyModal from '../components/AddCompanyModal'
import LoadingSpinner from '../components/LoadingSpinner'

const CompanyDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { companies, setCompanies, addCompany: addToStore, removeCompany, loading, setLoading } = useCompanyStore()
  const [showModal, setShowModal] = useState(false)

  // Fetch companies on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchMyCompanies(user.uid)
        setCompanies(data)
      } catch (err) {
        console.error('Error fetching companies:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user) load()
  }, [user])

  const handleSaveCompany = async (formData) => {
    try {
      const saved = await addCompany(formData, user.uid)
      addToStore(saved)
      setShowModal(false)
    } catch (err) {
      console.error('Error saving company:', err)
    }
  }

  const handleDeleteCompany = async (companyId) => {
    await deleteCompany(companyId)
    removeCompany(companyId)
  }

  if (loading) return <LoadingSpinner message="Loading your companies..." />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Home</span>
        </button>
        <h1 className="text-lg font-bold text-gray-800">My Companies</h1>
        <div className="w-20" /> {/* spacer */}
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {companies.length === 0 ? (
          // Empty state — show big + button
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-gray-400 text-sm">No companies yet. Add your first one!</p>
            <button
              onClick={() => setShowModal(true)}
              className="w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-4xl flex items-center justify-center shadow-lg transition-colors"
            >
              +
            </button>
          </div>
        ) : (
          <>
            {/* Company cards */}
            <div className="space-y-4 mb-6">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} onDelete={handleDeleteCompany} />
              ))}
            </div>

            {/* Add more button */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-3 border-2 border-dashed border-orange-300 rounded-xl text-orange-500 hover:bg-orange-50 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span> Add another company
            </button>
          </>
        )}
      </div>

      {/* Add Company Modal */}
      {showModal && (
        <AddCompanyModal
          onClose={() => setShowModal(false)}
          onSave={handleSaveCompany}
        />
      )}
    </div>
  )
}

// Individual company card
const CompanyCard = ({ company, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(company.id)
    setDeleting(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{company.name}</h2>
          {company.since && (
            <p className="text-sm text-gray-500 mt-0.5">Since {company.since}</p>
          )}
        </div>
        {/* Delete button */}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete company"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Delete?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {deleting ? '...' : 'Yes'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-lg font-medium transition-colors"
            >
              No
            </button>
          </div>
        )}
      </div>

      {company.address && (
        <div className="flex items-start gap-2 mt-3">
          <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm text-gray-500 line-clamp-2">{company.address}</p>
        </div>
      )}

      {(company.opens || company.closes) && (
        <div className="flex items-center gap-2 mt-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-500">{company.opens} – {company.closes}</p>
        </div>
      )}

      {/* Current token display */}
      <div className="mt-4 flex items-center gap-3">
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-2">
          <p className="text-xs text-gray-400">Now serving</p>
          <p className="text-2xl font-bold text-red-500">#{company.currentToken || 0}</p>
        </div>
        <button className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
          Call next token
        </button>
      </div>
    </div>
  )
}

export default CompanyDashboard
