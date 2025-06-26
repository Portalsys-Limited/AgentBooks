// lib/types.ts
// ==========================================
// CENTRALIZED TYPESCRIPT TYPES
// Shared across all service functions and components
// ==========================================

// Search related types
export interface SearchResult {
  customers: Customer[]
  clients: Client[]
  total: number
}

export interface SearchParams {
  q: string
  limit?: number
  search_customers?: boolean
  search_clients?: boolean
}

// Customer types
export interface Customer {
  id: string
  name: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  type: 'customer'
  client_count: number
  created_at?: string
  updated_at?: string
}

export interface CreateCustomerData {
  name: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {}

// Client types
export interface Client {
  id: string
  name: string
  trading_name?: string
  business_type?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  type: 'client'
  customer_name?: string
  customer_id?: string
  created_at?: string
  updated_at?: string
  services?: ClientService[]
  associations?: CustomerClientAssociation[]
}

export interface CreateClientData {
  name: string
  trading_name?: string
  business_type?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
}

export interface UpdateClientData extends Partial<CreateClientData> {
  services?: Array<{
    service_id: string
    is_enabled: boolean
  }>
}

// Client Services
export interface ClientService {
  service_id: string
  service_code: string
  name: string
  description?: string
  is_enabled: boolean
  assigned_at?: string
  updated_at?: string
}

export interface Service {
  id: string
  service_code: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

// Customer-Client Associations
export interface CustomerClientAssociation {
  id: string
  customer_id: string
  client_id: string
  relationship_type: string
  is_primary_contact: boolean
  notes?: string
  created_at?: string
  updated_at?: string
  customer_name?: string
  customer_email?: string
}

export interface CreateAssociationData {
  customer_id: string
  client_id: string
  relationship_type: string
  is_primary_contact?: boolean
  notes?: string
}

export interface UpdateAssociationData extends Partial<CreateAssociationData> {}

// User and Auth types
export type UserRole = 'practice_owner' | 'accountant' | 'bookkeeper' | 'payroll'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  practiceId: string
  clientIds: string[]
  accessToken: string
}

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