// Login page — Facebook authentication entry point
import React, { useState } from 'react'
import { loginWithFacebook } from '../services/authService'

const LoginPage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFacebookLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await loginWithFacebook()
      // Auth state change handled in App.jsx via onAuthStateChanged
    } catch (err) {
      console.error('Facebook login error:', err)
      // Show user-friendly error messages
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login popup was closed. Please try again.')
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with a different sign-in method.')
      } else {
        setError('Failed to sign in. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        {/* App Logo / Title */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl font-bold">Q</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Q-App</h1>
          <p className="text-gray-500 mt-2">Token management made simple</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Facebook Login Button */}
        <button
          onClick={handleFacebookLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Signing in...
            </>
          ) : (
            <>
              {/* Facebook icon */}
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
              </svg>
              Continue with Facebook
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}

export default LoginPage
