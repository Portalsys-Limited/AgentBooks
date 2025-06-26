// lib/search/service.ts
// ==========================================
// SEARCH SERVICE FUNCTIONS
// Direct calls to backend search endpoints
// ==========================================

import { api } from '../api-client'
import { SearchResult, SearchParams } from './types'

/**
 * Search for customers and clients with optional filtering
 */
export async function searchCustomersAndClients(params: SearchParams): Promise<SearchResult> {
  const {
    q,
    limit = 20,
    search_customers = true,
    search_clients = true
  } = params

  if (!q || q.trim().length < 2) {
    return { customers: [], clients: [], total: 0 }
  }

  const searchParams = new URLSearchParams({
    q: q.trim(),
    limit: limit.toString(),
    search_customers: search_customers.toString(),
    search_clients: search_clients.toString()
  })

  return api.get<SearchResult>(`/search/?${searchParams}`)
}

/**
 * Search only customers
 */
export async function searchCustomers(query: string, limit: number = 20): Promise<SearchResult> {
  return searchCustomersAndClients({
    q: query,
    limit,
    search_customers: true,
    search_clients: false
  })
}

/**
 * Search only clients
 */
export async function searchClients(query: string, limit: number = 20): Promise<SearchResult> {
  return searchCustomersAndClients({
    q: query,
    limit,
    search_customers: false,
    search_clients: true
  })
}

/**
 * Simple search function with just query and limit
 * Most commonly used version
 */
export async function search(query: string, limit: number = 20): Promise<SearchResult> {
  return searchCustomersAndClients({ q: query, limit })
} 