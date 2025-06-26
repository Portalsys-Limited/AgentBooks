// lib/associations/service.ts
// ==========================================
// CUSTOMER-CLIENT ASSOCIATION SERVICE FUNCTIONS
// Direct calls to backend association endpoints
// ==========================================

import { api } from '../api-client'
import { CustomerClientAssociation, CreateAssociationData, UpdateAssociationData } from './types'

/**
 * Create customer-client association
 */
export async function createAssociation(data: CreateAssociationData): Promise<CustomerClientAssociation> {
  return api.post<CustomerClientAssociation>('/customer-client-associations', data)
}

/**
 * Update customer-client association
 */
export async function updateAssociation(
  id: string, 
  data: UpdateAssociationData
): Promise<CustomerClientAssociation> {
  return api.put<CustomerClientAssociation>(`/customer-client-associations/${id}`, data)
}

/**
 * Delete customer-client association
 */
export async function deleteAssociation(id: string): Promise<void> {
  return api.delete<void>(`/customer-client-associations/${id}`)
}

/**
 * Get associations for a specific client
 */
export async function getClientAssociations(clientId: string): Promise<CustomerClientAssociation[]> {
  return api.get<CustomerClientAssociation[]>(`/clients/${clientId}/associations`)
}

/**
 * Get associations for a specific customer
 */
export async function getCustomerAssociations(customerId: string): Promise<CustomerClientAssociation[]> {
  return api.get<CustomerClientAssociation[]>(`/customers/${customerId}/associations`)
} 