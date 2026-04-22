// Root application component — handles routing and auth state
import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { subscribeToAuthChanges } from './services/authService'
import useAuthStore from './store/authStore'
import LoadingSpinner from './components/LoadingSpinner'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'

// Protected route wrapper — redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  if (loading) return <LoadingSpinner />
  return user ? children : <Navigate to="/login" replace />
}

// Public route wrapper — redirects to home if already authenticated
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  if (loading) return <LoadingSpinner />
  return !user ? children : <Navigate to="/" replace />
}

const App = () => {
  const { setUser, setLoading } = useAuthStore()

  // Subscribe to Firebase auth state on mount
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [setUser, setLoading])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public: Login */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Protected: Home (role selection) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Placeholder routes for company and user flows */}
        <Route
          path="/company"
          element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center text-gray-500">
                Company Dashboard — coming soon
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center text-gray-500">
                User Token Search — coming soon
              </div>
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
