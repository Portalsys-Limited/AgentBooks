'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirect = searchParams.get('redirect')
  const errorParam = searchParams.get('error')

  useEffect(() => {
    if (errorParam === 'unauthorized') {
      setError('You are not authorized to access that portal.')
    } else if (errorParam === 'session_expired') {
      setError('Your session has expired. Please log in again.')
    }
  }, [errorParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        // Get session to determine redirect
        const session = await getSession()
        if (session?.user?.role) {
          const role = session.user.role
          const token = session.user.accessToken
          
          // Redirect based on role and requested redirect
          if (redirect === 'client' && role === 'client') {
            window.location.href = `http://localhost:3001?token=${token}`
          } else if (redirect === 'practice' && ['practice_owner', 'accountant', 'bookkeeper', 'payroll'].includes(role)) {
            window.location.href = `http://localhost:3002?token=${token}`
          } else if (['practice_owner', 'accountant', 'bookkeeper', 'payroll'].includes(role)) {
            window.location.href = `http://localhost:3002?token=${token}`
          } else if (role === 'client') {
            window.location.href = `http://localhost:3001?token=${token}`
          } else {
            setError('Invalid user role. Please contact support.')
          }
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to AgentBooks
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {redirect === 'client' ? 'Access your Client Portal' : 
             redirect === 'practice' ? 'Access your Practice Portal' : 
             'Access your accounting platform'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="text-center">
              <div className="text-sm text-gray-600">
                Test Accounts:
              </div>
              <div className="mt-2 space-y-1 text-xs text-gray-500">
                <div>👤 <strong>admin@agentbooks.com</strong> (Practice Owner)</div>
                <div>👤 <strong>test@client.com</strong> (Client)</div>
                <div>🔑 Password: <strong>admin</strong></div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 