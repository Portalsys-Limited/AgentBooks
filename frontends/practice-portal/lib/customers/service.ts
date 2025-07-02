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
  CustomerDocumentsTabResponse,
  CustomerAccountingInfoUpdate,
  CustomerMLRInfoUpdate,
  CustomerClientAssociationCreate,
  CustomerClientAssociationUpdate,
  CustomerClientAssociationResponse,
  IndividualRelationshipCreate,
  IndividualRelationshipUpdate,
  IndividualRelationshipResponse,
  AvailableClient,
  AvailableIndividual,
  EnumOption
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
  const response = await api.get<CustomerInfoTabResponse>(`/customers/${id}/info`)
  
  // Ensure arrays are initialized
  if (!response.individual.incomes) {
    response.individual.incomes = []
  }
  if (!response.individual.property_relationships) {
    response.individual.property_relationships = []
  }
  
  return response
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

/**
 * Update customer accounting and additional information
 */
export async function updateCustomerAccountingInfo(
  id: string, 
  data: CustomerAccountingInfoUpdate
): Promise<CustomerInfoTabResponse> {
  return api.put<CustomerInfoTabResponse>(`/customers/${id}/accounting-info`, data)
}

/**
 * Update customer MLR information
 */
export async function updateCustomerMLRInfo(
  id: string, 
  data: CustomerMLRInfoUpdate
): Promise<CustomerMLRTabResponse> {
  return api.put<CustomerMLRTabResponse>(`/customers/${id}/mlr-info`, data)
}

// ==========================================
// CUSTOMER-CLIENT ASSOCIATION FUNCTIONS
// ==========================================

/**
 * Create customer-client association
 */
export async function createCustomerClientAssociation(
  customerId: string,
  data: CustomerClientAssociationCreate
): Promise<CustomerClientAssociationResponse> {
  return api.post<CustomerClientAssociationResponse>(`/customers/${customerId}/client-associations`, data)
}

/**
 * Update customer-client association
 */
export async function updateCustomerClientAssociation(
  customerId: string,
  associationId: string,
  data: CustomerClientAssociationUpdate
): Promise<CustomerClientAssociationResponse> {
  return api.put<CustomerClientAssociationResponse>(`/customers/${customerId}/client-associations/${associationId}`, data)
}

/**
 * Delete customer-client association
 */
export async function deleteCustomerClientAssociation(
  customerId: string,
  associationId: string
): Promise<void> {
  return api.delete<void>(`/customers/${customerId}/client-associations/${associationId}`)
}

// ==========================================
// INDIVIDUAL RELATIONSHIP FUNCTIONS
// ==========================================

/**
 * Create individual relationship
 */
export async function createCustomerIndividualRelationship(
  customerId: string,
  data: IndividualRelationshipCreate
): Promise<IndividualRelationshipResponse> {
  return api.post<IndividualRelationshipResponse>(`/customers/${customerId}/individual-relationships`, data)
}

/**
 * Update individual relationship
 */
export async function updateCustomerIndividualRelationship(
  customerId: string,
  relationshipId: string,
  data: IndividualRelationshipUpdate
): Promise<IndividualRelationshipResponse> {
  return api.put<IndividualRelationshipResponse>(`/customers/${customerId}/individual-relationships/${relationshipId}`, data)
}

/**
 * Delete individual relationship
 */
export async function deleteCustomerIndividualRelationship(
  customerId: string,
  relationshipId: string
): Promise<void> {
  return api.delete<void>(`/customers/${customerId}/individual-relationships/${relationshipId}`)
}

// ==========================================
// HELPER FUNCTIONS FOR DROPDOWNS
// ==========================================

/**
 * Get available clients for customer association
 */
export async function getAvailableClientsForCustomer(customerId: string): Promise<AvailableClient[]> {
  return api.get<AvailableClient[]>(`/customers/${customerId}/available-clients`)
}

/**
 * Get available individuals for relationship
 */
export async function getAvailableIndividualsForCustomer(customerId: string): Promise<AvailableIndividual[]> {
  return api.get<AvailableIndividual[]>(`/customers/${customerId}/available-individuals`)
}

/**
 * Get client relationship types
 */
export async function getClientRelationshipTypes(): Promise<EnumOption[]> {
  return api.get<EnumOption[]>('/customers/enums/client-relationship-types')
}

/**
 * Get individual relationship types
 */
export async function getIndividualRelationshipTypes(): Promise<EnumOption[]> {
  return api.get<EnumOption[]>('/customers/enums/individual-relationship-types')
} 