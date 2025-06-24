'use client'

import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { redirectTo } from '../utils/navigation'

export default function HomePage() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to dashboard
      redirectTo('/dashboard')
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If user is not authenticated, they will be redirected by the useAuth hook
  return null
} 