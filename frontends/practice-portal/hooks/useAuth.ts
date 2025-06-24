import { useState, useEffect } from 'react'
import { User, UserRole } from '../types'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for authentication token in URL or localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token') || localStorage.getItem('authToken')
    
    if (!token) {
      // No token, redirect to auth portal
      window.location.href = 'http://localhost:3000?redirect=practice'
      return
    }

    // Verify token with backend
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/token-data`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(userData => {
      if (['practice_owner', 'accountant', 'bookkeeper', 'payroll'].includes(userData.role)) {
        const userObject: User = {
          id: userData.user_id,
          email: userData.email,
          role: userData.role as UserRole,
          practiceId: userData.practice_id,
          clientIds: userData.client_ids,
          accessToken: token,
          name: userData.name || userData.email.split('@')[0]
        }
        setUser(userObject)
        localStorage.setItem('authToken', token)
        // Clean URL if token was in params
        if (urlParams.get('token')) {
          window.history.replaceState({}, '', window.location.pathname)
        }
      } else {
        // Wrong role, redirect back to auth
        window.location.href = 'http://localhost:3000?error=unauthorized'
      }
    })
    .catch(() => {
      // Invalid token, redirect to auth
      localStorage.removeItem('authToken')
      window.location.href = 'http://localhost:3000?error=session_expired'
    })
    .finally(() => {
      setLoading(false)
    })
  }, [])

  const logout = () => {
    localStorage.removeItem('authToken')
    window.location.href = 'http://localhost:3000'
  }

  return {
    user,
    loading,
    logout,
    isAuthenticated: !!user
  }
} 