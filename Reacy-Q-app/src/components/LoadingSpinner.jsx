// Reusable full-screen loading spinner
import React from 'react'

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  )
}

export default LoadingSpinner
