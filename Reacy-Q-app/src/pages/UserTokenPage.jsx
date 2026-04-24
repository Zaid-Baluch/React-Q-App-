// User Token Page — search companies, view details, buy/cancel tokens
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useTokenStore from '../store/tokenStore'
import {
  searchCompanies,
  buyToken,
  cancelToken,
  fetchMyTokens,
  getCompanyById,
} from '../services/tokenService'

// ─── Main Page ────────────────────────────────────────────────────────────────
const UserTokenPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { myTokens, setMyTokens, addToken, removeToken } = useTokenStore()

  const [query, setQuery] = useState('')
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [buying, setBuying] = useState(false)
  const [activeTab, setActiveTab] = useState('search') // 'search' | 'mytokens'

  // Load companies + user tokens on mount
  useEffect(() => {
    searchCompanies('').then(setCompanies)
    fetchMyTokens(user.uid).then(setMyTokens)
  }, [])

  // Live search
  useEffect(() => {
    const t = setTimeout(() => {
      searchCompanies(query).then(setCompanies)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const handleBuyToken = async (company) => {
    setBuying(true)
    try {
      const token = await buyToken(company, user)
      addToken(token)
      // Refresh company data so token count updates
      const updated = getCompanyById(company.id)
      setSelectedCompany(updated)
      setActiveTab('mytokens')
    } catch (err) {
      console.error(err)
    } finally {
      setBuying(false)
    }
  }

  const handleCancelToken = async (tokenId) => {
    await cancelToken(tokenId)
    removeToken(tokenId)
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* ── Top App Bar ── */}
      <div className="bg-blue-600 text-white px-4 pt-10 pb-6 shadow-md">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate('/')}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">Find a Token</h1>
        </div>

        {/* Search bar */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search companies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white text-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm shadow focus:outline-none"
          />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex bg-white shadow-sm">
        {['search', 'mytokens'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            {tab === 'search' ? 'Companies' : `My Tokens ${myTokens.length > 0 ? `(${myTokens.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {activeTab === 'search' ? (
          <CompanyList
            companies={companies}
            onSelect={setSelectedCompany}
            query={query}
          />
        ) : (
          <MyTokensList tokens={myTokens} onCancel={handleCancelToken} />
        )}
      </div>

      {/* ── Company Detail Bottom Sheet ── */}
      {selectedCompany && (
        <CompanyDetailSheet
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onBuy={() => handleBuyToken(selectedCompany)}
          buying={buying}
          alreadyHasToken={myTokens.some((t) => t.companyId === selectedCompany.id)}
        />
      )}
    </div>
  )
}

// ─── Company List ─────────────────────────────────────────────────────────────
const CompanyList = ({ companies, onSelect, query }) => {
  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
          </svg>
        </div>
        <p className="text-gray-400 font-medium">
          {query ? `No results for "${query}"` : 'No companies available yet'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {companies.map((company) => (
        <button
          key={company.id}
          onClick={() => onSelect(company)}
          className="w-full bg-white rounded-2xl shadow-sm p-4 text-left hover:shadow-md transition-shadow active:scale-[0.99]"
        >
          <div className="flex items-start justify-between gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-bold text-lg">
                {company.name?.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">{company.name}</h3>
              {company.since && (
                <p className="text-xs text-gray-400">Since {company.since}</p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {/* Timings */}
                {company.opens && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {company.opens} – {company.closes}
                  </span>
                )}
                {/* Token badge */}
                <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  Token #{company.currentToken || 0}
                </span>
              </div>
            </div>

            <svg className="w-5 h-5 text-gray-300 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  )
}

// ─── My Tokens List ───────────────────────────────────────────────────────────
const MyTokensList = ({ tokens, onCancel }) => {
  if (tokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <p className="text-gray-400 font-medium">No active tokens</p>
        <p className="text-gray-300 text-sm mt-1">Search a company and buy a token</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tokens.map((token) => (
        <TokenCard key={token.id} token={token} onCancel={onCancel} />
      ))}
    </div>
  )
}

// ─── Token Card ───────────────────────────────────────────────────────────────
const TokenCard = ({ token, onCancel }) => {
  const [cancelling, setCancelling] = useState(false)

  const handleCancel = async () => {
    setCancelling(true)
    await onCancel(token.id)
    setCancelling(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Color strip */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-800">{token.companyName}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {token.companyOpens} – {token.companyCloses}
            </p>
          </div>
          {/* Big token number */}
          <div className="text-right">
            <p className="text-xs text-gray-400">Your token</p>
            <p className="text-3xl font-bold text-blue-600">#{token.tokenNumber}</p>
          </div>
        </div>

        {/* Waiting time */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
          <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs text-amber-600 font-medium">Estimated wait</p>
            <p className="text-sm font-bold text-amber-700">
              ~{token.estimatedWaitMinutes} minutes
            </p>
          </div>
        </div>

        {/* Purchased time */}
        <p className="text-xs text-gray-400 mb-3">
          Purchased at {new Date(token.purchasedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>

        {/* Cancel button */}
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="w-full py-2.5 rounded-xl border-2 border-red-100 text-red-500 hover:bg-red-50 text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {cancelling ? 'Cancelling...' : 'Cancel Token'}
        </button>
      </div>
    </div>
  )
}

// ─── Company Detail Bottom Sheet ──────────────────────────────────────────────
const CompanyDetailSheet = ({ company, onClose, onBuy, buying, alreadyHasToken }) => {
  // Refresh company from storage for latest token count
  const fresh = getCompanyById(company.id) || company
  const waitTime = (fresh.currentToken || 0) * (fresh.timePerToken || 5)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 pb-8 pt-2">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-2xl">
                  {company.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{company.name}</h2>
                {company.since && (
                  <p className="text-sm text-gray-400">Since {company.since}</p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <InfoCard
              icon={
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              label="Timings"
              value={`${company.opens || '--'} – ${company.closes || '--'}`}
            />
            <InfoCard
              icon={
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              }
              label="Current Token"
              value={`#${fresh.currentToken || 0}`}
            />
            <InfoCard
              icon={
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                </svg>
              }
              label="Total Tokens"
              value={fresh.totalTokens || 'Unlimited'}
            />
            <InfoCard
              icon={
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              label="Est. Wait"
              value={`~${waitTime} min`}
            />
          </div>

          {/* Address */}
          {company.address && (
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3 mb-5">
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-gray-600">{company.address}</p>
            </div>
          )}

          {/* Buy Token Button */}
          {alreadyHasToken ? (
            <div className="w-full py-4 rounded-2xl bg-green-50 border border-green-200 text-center">
              <p className="text-green-600 font-semibold">✓ You already have a token</p>
              <p className="text-green-500 text-sm mt-0.5">Check "My Tokens" tab</p>
            </div>
          ) : (
            <button
              onClick={onBuy}
              disabled={buying}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-base shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
            >
              {buying ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Getting Token...
                </span>
              ) : (
                'Get Token'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Info Card ────────────────────────────────────────────────────────────────
const InfoCard = ({ icon, label, value }) => (
  <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
    <div className="shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-700 truncate">{value}</p>
    </div>
  </div>
)

export default UserTokenPage
