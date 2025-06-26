// lib/api-client.ts
// ==========================================
// CENTRALIZED API CLIENT FOR DIRECT BACKEND CALLS
// Replaces Next.js API routes with direct backend communication
// ==========================================

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Custom error class for API errors
export class ApiError extends Error {
  status: number
  data?: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// Get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}

// Central fetch function - reusable for all API calls
export async function fetchFromBackend<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BACKEND_URL}${endpoint}`
  const token = getAuthToken()
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  // Add body if it's an object (for POST/PUT requests)
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }

  try {
    const response = await fetch(url, config)

    // Handle authentication errors
    if (response.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = 'http://localhost:3000?error=session_expired'
      throw new ApiError('Authentication required', 401)
    }

    // Handle other HTTP errors
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      let errorData = null
      
      try {
        errorData = await response.json()
        errorMessage = errorData.message || errorData.detail || errorMessage
      } catch {
        // Response isn't JSON, use status text
      }
      
      throw new ApiError(errorMessage, response.status, errorData)
    }

    // Handle empty responses (like DELETE)
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return null as T
    }

    return response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    )
  }
}

// Convenience methods for different HTTP verbs
export const api = {
  get: <T>(endpoint: string) => 
    fetchFromBackend<T>(endpoint),

  post: <T>(endpoint: string, data?: any) =>
    fetchFromBackend<T>(endpoint, { 
      method: 'POST', 
      body: data 
    }),

  put: <T>(endpoint: string, data?: any) =>
    fetchFromBackend<T>(endpoint, { 
      method: 'PUT', 
      body: data 
    }),

  patch: <T>(endpoint: string, data?: any) =>
    fetchFromBackend<T>(endpoint, { 
      method: 'PATCH', 
      body: data 
    }),

  delete: <T>(endpoint: string) =>
    fetchFromBackend<T>(endpoint, { method: 'DELETE' }),
} 