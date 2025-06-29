// lib/customers/service.ts
// ==========================================
// CUSTOMER SERVICE FUNCTIONS
// Direct calls to backend customer endpoints
// ==========================================

import { api } from '../api-client'
import { PaginatedResponse } from '../shared/types'
import { 
  Customer, 
  CreateCustomerData, 
  UpdateCustomerData,
  CustomerInfoTabResponse,
  CustomerMLRTabResponse,
  CustomerRelationshipsTabResponse,
  CustomerDocumentsTabResponse
} from './types'

/**
 * Get all customers
 */
export async function getCustomers(): Promise<Customer[]> {
  return api.get<Customer[]>('/customers')
}

/**
 * Get customers with pagination
 */
export async function getCustomersPaginated(
  page: number = 1, 
  perPage: number = 20
): Promise<PaginatedResponse<Customer>> {
  return api.get<PaginatedResponse<Customer>>(`/customers?page=${page}&per_page=${perPage}`)
}

/**
 * Get customer by ID
 */
export async function getCustomer(id: string): Promise<Customer> {
  return api.get<Customer>(`/customers/${id}`)
}

/**
 * Create a new customer
 */
export async function createCustomer(data: CreateCustomerData): Promise<Customer> {
  return api.post<Customer>('/customers', data)
}

/**
 * Update customer
 */
export async function updateCustomer(id: string, data: UpdateCustomerData): Promise<Customer> {
  return api.put<Customer>(`/customers/${id}`, data)
}

/**
 * Partially update customer
 */
export async function patchCustomer(id: string, data: Partial<UpdateCustomerData>): Promise<Customer> {
  return api.patch<Customer>(`/customers/${id}`, data)
}

/**
 * Delete customer
 */
export async function deleteCustomer(id: string): Promise<void> {
  return api.delete<void>(`/customers/${id}`)
}

// ==========================================
// TAB-SPECIFIC ENDPOINTS
// ==========================================

/**
 * Get customer info tab data
 */
export async function getCustomerInfo(id: string): Promise<CustomerInfoTabResponse> {
  return api.get<CustomerInfoTabResponse>(`/customers/${id}/info`)
}

/**
 * Get customer MLR tab data
 */
export async function getCustomerMLR(id: string): Promise<CustomerMLRTabResponse> {
  return api.get<CustomerMLRTabResponse>(`/customers/${id}/mlr`)
}

/**
 * Get customer relationships tab data
 */
export async function getCustomerRelationships(id: string): Promise<CustomerRelationshipsTabResponse> {
  return api.get<CustomerRelationshipsTabResponse>(`/customers/${id}/relationships`)
}

/**
 * Get customer documents tab data
 */
export async function getCustomerDocuments(id: string): Promise<CustomerDocumentsTabResponse> {
  return api.get<CustomerDocumentsTabResponse>(`/customers/${id}/documents`)
} 