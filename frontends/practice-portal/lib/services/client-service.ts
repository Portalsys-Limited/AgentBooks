// lib/services/client-service.ts
// ==========================================
// CLIENT SERVICE FUNCTIONS
// Direct calls to backend client endpoints
// ==========================================

import { api } from '../api-client'
import { 
  Client, 
  CreateClientData, 
  UpdateClientData,
  PaginatedResponse 
} from '../types'

/**
 * Get all clients
 */
export async function getClients(): Promise<Client[]> {
  return api.get<Client[]>('/clients')
}

/**
 * Get clients with pagination
 */
export async function getClientsPaginated(
  page: number = 1, 
  perPage: number = 20
): Promise<PaginatedResponse<Client>> {
  return api.get<PaginatedResponse<Client>>(`/clients?page=${page}&per_page=${perPage}`)
}

/**
 * Get client by ID with full details (including services and associations)
 */
export async function getClient(id: string): Promise<Client> {
  return api.get<Client>(`/clients/${id}`)
}

/**
 * Create a new client
 */
export async function createClient(data: CreateClientData): Promise<Client> {
  return api.post<Client>('/clients', data)
}

/**
 * Update client (including services)
 */
export async function updateClient(id: string, data: UpdateClientData): Promise<Client> {
  return api.put<Client>(`/clients/${id}`, data)
}

/**
 * Partially update client
 */
export async function patchClient(id: string, data: Partial<UpdateClientData>): Promise<Client> {
  return api.patch<Client>(`/clients/${id}`, data)
}

/**
 * Delete client
 */
export async function deleteClient(id: string): Promise<void> {
  return api.delete<void>(`/clients/${id}`)
}

/**
 * Update client services only
 */
export async function updateClientServices(
  clientId: string, 
  services: Array<{ service_id: string; is_enabled: boolean }>
): Promise<Client> {
  return updateClient(clientId, { services })
}

/**
 * Get clients by customer ID
 */
export async function getClientsByCustomer(customerId: string): Promise<Client[]> {
  return api.get<Client[]>(`/customers/${customerId}/clients`)
} 