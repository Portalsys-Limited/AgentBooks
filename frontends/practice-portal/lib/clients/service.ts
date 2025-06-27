// lib/clients/service.ts
// ==========================================
// CLIENT SERVICE FUNCTIONS
// Direct calls to backend client endpoints
// ==========================================
// This file contains all the functions that communicate with our backend server
// to manage business clients and their information

import { api } from '../api-client'
import { PaginatedResponse } from '../shared/types'
import { 
  Client, 
  CreateClientData, 
  UpdateClientData, 
  DetailedClientResponse,
  CreateAssociationData,
  UpdateAssociationData,
  ClientAssociation
} from './types'

// ==========================================
// BASIC CLIENT OPERATIONS
// ==========================================

/**
 * GET ALL CLIENTS
 * Retrieves a simple list of all business clients
 * 📋 Use this for: dropdown lists, quick overviews
 * 👥 Who can use: Practice owners, accountants, bookkeepers
 */
export async function getClients(): Promise<Client[]> {
  return api.get<Client[]>('/clients')
}

/**
 * GET CLIENTS WITH PAGINATION
 * Retrieves clients in chunks (pages) - useful for large client lists
 * 📋 Use this for: main client listing pages with "Next/Previous" buttons
 * 👥 Who can use: Practice owners, accountants, bookkeepers
 * 
 * @param page - Which page to get (starts at 1)
 * @param perPage - How many clients per page (default: 20)
 */
export async function getClientsPaginated(
  page: number = 1, 
  perPage: number = 20
): Promise<PaginatedResponse<Client>> {
  return api.get<PaginatedResponse<Client>>(`/clients?page=${page}&per_page=${perPage}`)
}

/**
 * GET SINGLE CLIENT WITH FULL DETAILS
 * Retrieves complete information about one specific business client
 * 📋 Use this for: client profile pages, detailed client views
 * 👥 Who can use: Practice owners, accountants, bookkeepers
 * 
 * @param id - The unique identifier of the client
 * @returns Complete client information including services, associations, and Companies House data
 */
export async function getClient(id: string): Promise<DetailedClientResponse> {
  return api.get<DetailedClientResponse>(`/clients/${id}`)
}

/**
 * CREATE NEW CLIENT
 * Adds a new business client to the system
 * 📋 Use this for: "Add New Client" forms
 * 👥 Who can use: Practice owners, accountants, bookkeepers
 * 
 * @param data - Client information (business name, contact details, etc.)
 * @param autoFillCompaniesHouse - Should we automatically fill details from Companies House?
 * @returns The newly created client with full details
 */
export async function createClient(
  data: CreateClientData, 
  autoFillCompaniesHouse: boolean = false
): Promise<Client> {
  const url = autoFillCompaniesHouse 
    ? '/clients?auto_fill_companies_house=true' 
    : '/clients'
  return api.post<Client>(url, data)
}

/**
 * UPDATE EXISTING CLIENT
 * Modifies information for an existing business client
 * 📋 Use this for: "Edit Client" forms, updating client details
 * 👥 Who can use: Practice owners, accountants, bookkeepers
 * 
 * @param id - Which client to update
 * @param data - What information to change (only provide fields you want to update)
 * @returns The updated client with full details
 */
export async function updateClient(id: string, data: UpdateClientData): Promise<Client> {
  return api.put<Client>(`/clients/${id}`, data)
}

/**
 * PARTIALLY UPDATE CLIENT
 * Makes small changes to a client without affecting other information
 * 📋 Use this for: quick updates, single field changes
 * 👥 Who can use: Practice owners, accountants, bookkeepers
 * 
 * @param id - Which client to update
 * @param data - Small changes to make
 * @returns The updated client
 */
export async function patchClient(id: string, data: Partial<UpdateClientData>): Promise<Client> {
  return api.patch<Client>(`/clients/${id}`, data)
}

/**
 * DELETE CLIENT
 * Permanently removes a business client from the system
 * ⚠️ Warning: This cannot be undone!
 * 📋 Use this for: removing clients who are no longer with the practice
 * 👥 Who can use: Practice owners only (usually)
 * 
 * @param id - Which client to delete
 */
export async function deleteClient(id: string): Promise<void> {
  return api.delete<void>(`/clients/${id}`)
}

// ==========================================
// SERVICE MANAGEMENT
// ==========================================

/**
 * UPDATE CLIENT SERVICES
 * Changes which services we provide to a specific client
 * 📋 Use this for: enabling/disabling services, setting prices
 * 👥 Who can use: Practice owners, accountants, bookkeepers
 * 
 * @param clientId - Which client to update
 * @param services - List of services and whether they should be enabled
 * @returns Updated client information
 */
export async function updateClientServices(
  clientId: string, 
  services: Array<{ service_id: string; is_enabled: boolean; price?: number }>
): Promise<Client> {
  return updateClient(clientId, { services })
}



// ==========================================
// CLIENT-CUSTOMER ASSOCIATIONS
// ==========================================
// These functions manage relationships between people (customers) and businesses (clients)
// Examples: "John Smith is a Director of ABC Limited"

/**
 * CREATE CLIENT-CUSTOMER ASSOCIATION
 * Links a person to a business with a specific relationship
 * 📋 Use this for: adding directors, shareholders, partners to a business
 * 👥 Who can use: Practice owners, accountants, bookkeepers
 * 
 * Examples of relationships:
 * - John Smith is a Director of ABC Limited
 * - Sarah Jones is a 50% Shareholder of XYZ Trading
 * - Mike Brown is the Company Secretary of DEF Corp
 * 
 * @param clientId - Which business
 * @param associationData - Details of the relationship
 * @returns The created association with full details
 */
export async function createClientCustomerAssociation(
  clientId: string,
  associationData: CreateAssociationData
): Promise<ClientAssociation> {
  return api.post<ClientAssociation>(`/clients/${clientId}/associations`, associationData)
}

/**
 * UPDATE CLIENT-CUSTOMER ASSOCIATION
 * Changes details of an existing relationship between a person and business
 * 📋 Use this for: updating ownership percentages, changing contact status, adding resignation dates
 * 👥 Who can use: Practice owners, accountants, bookkeepers
 * 
 * @param clientId - Which business
 * @param associationId - Which relationship to update
 * @param associationData - What changes to make
 * @returns The updated association with full details
 */
export async function updateClientCustomerAssociation(
  clientId: string,
  associationId: string,
  associationData: UpdateAssociationData
): Promise<ClientAssociation> {
  return api.put<ClientAssociation>(`/clients/${clientId}/associations/${associationId}`, associationData)
}

/**
 * DELETE CLIENT-CUSTOMER ASSOCIATION
 * Removes a relationship between a person and business
 * 📋 Use this for: when someone leaves the business, resigns from director role, etc.
 * 👥 Who can use: Practice owners, accountants (usually restricted)
 * ⚠️ Warning: This removes the relationship record entirely
 * 
 * @param clientId - Which business
 * @param associationId - Which relationship to remove
 * @returns Success message
 */
export async function deleteClientCustomerAssociation(
  clientId: string,
  associationId: string
): Promise<{ success: boolean; message: string }> {
  return api.delete<{ success: boolean; message: string }>(`/clients/${clientId}/associations/${associationId}`)
}

// ==========================================
// CUSTOMER-RELATED QUERIES
// ==========================================

/**
 * GET CLIENTS BY CUSTOMER
 * Finds all businesses associated with a specific person
 * 📋 Use this for: viewing all businesses a person is connected to
 * 👥 Who can use: Practice owners, accountants, bookkeepers
 * 
 * Example: Show me all businesses that John Smith is involved with
 * 
 * @param customerId - Which person to look up
 * @returns List of clients connected to this person
 */
export async function getClientsByCustomer(customerId: string): Promise<Client[]> {
  return api.get<Client[]>(`/customers/${customerId}/clients`)
} 