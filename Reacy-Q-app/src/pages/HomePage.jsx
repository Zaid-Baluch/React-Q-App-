// Home page — user selects their role after login
import React from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { logout } from '../services/authService'

const HomePage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">Q</span>
          </div>
          <span className="font-semibold text-gray-800">Q-App</span>
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-3">
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-9 h-9 rounded-full object-cover"
            />
          )}
          <span className="text-sm text-gray-600 hidden sm:block">
            {user?.displayName}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Welcome, {user?.displayName?.split(' ')[0]}!
        </h1>
        <p className="text-gray-500 mb-10 text-center">How would you like to use Q-App?</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Company card */}
          <button
            onClick={() => navigate('/company')}
            className="group bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-transparent hover:border-blue-500 p-8 flex flex-col items-center gap-4 transition-all duration-200"
          >
            <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-600 rounded-2xl flex items-center justify-center transition-colors duration-200">
              <svg className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">Are you a Company?</h2>
              <p className="text-gray-500 text-sm mt-1">Manage your tokens and customers</p>
            </div>
          </button>

          {/* User / token seeker card */}
          <button
            onClick={() => navigate('/user')}
            className="group bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-transparent hover:border-green-500 p-8 flex flex-col items-center gap-4 transition-all duration-200"
          >
            <div className="w-16 h-16 bg-green-100 group-hover:bg-green-600 rounded-2xl flex items-center justify-center transition-colors duration-200">
              <svg className="w-8 h-8 text-green-600 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">Finding a Token?</h2>
              <p className="text-gray-500 text-sm mt-1">Search companies and get your token</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomePage
