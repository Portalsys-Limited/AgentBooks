// lib/shared/types.ts
// ==========================================
// SHARED TYPES USED ACROSS MULTIPLE SERVICES
// ==========================================

// Common entity fields

// Pagination types
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
}

// Error types
export interface ApiErrorResponse {
  message: string
  detail?: string
  errors?: Record<string, string[]>
}

// Common entity fields
export interface BaseEntity {
  id: string
  created_at?: string
  updated_at?: string
}

// Address fields (used by both customers and clients)
export interface AddressFields {
  address?: string
  city?: string
  postal_code?: string
  country?: string
}

// Contact fields (used by both customers and clients) 
export interface ContactFields {
  email?: string
  phone?: string
} 