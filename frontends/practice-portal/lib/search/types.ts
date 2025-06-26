// lib/search/types.ts
// ==========================================
// SEARCH SERVICE TYPES
// ==========================================

// Import types from their respective modules
import type { Customer } from '../customers/types'
import type { Client } from '../clients/types'

// Search result container
export interface SearchResult {
  customers: Customer[]
  clients: Client[]
  total: number
}

// Search parameters
export interface SearchParams {
  q: string
  limit?: number
  search_customers?: boolean
  search_clients?: boolean
} 