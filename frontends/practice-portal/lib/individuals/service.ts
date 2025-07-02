// lib/individuals/service.ts
// ==========================================
// INDIVIDUAL SERVICE FUNCTIONS
// Direct calls to backend individual endpoints
// ==========================================

import { api } from '../api-client'
import { PaginatedResponse } from '../shared/types'
import { 
  Individual, 
  IndividualUpdateRequest,
  IncomeCreateRequest,
  IncomeUpdateRequest,
  IncomeResponse,
  PropertyCreateRequest,
  PropertyRelationshipCreateRequest,
  PropertyResponse,
  PropertyRelationshipResponse
} from './types'

/**
 * Get all individuals
 */
export async function getIndividuals(): Promise<Individual[]> {
  return api.get<Individual[]>('/individuals')
}

/**
 * Get individual by ID
 */
export async function getIndividual(id: string): Promise<Individual> {
  return api.get<Individual>(`/individuals/${id}`)
}

/**
 * Update individual
 */
export async function updateIndividual(id: string, data: IndividualUpdateRequest): Promise<Individual> {
  return api.put<Individual>(`/individuals/${id}`, data)
}

/**
 * Partially update individual
 */
export async function patchIndividual(id: string, data: Partial<IndividualUpdateRequest>): Promise<Individual> {
  return api.patch<Individual>(`/individuals/${id}`, data)
}

// ==========================================
// INCOME MANAGEMENT
// ==========================================

/**
 * Get all incomes for an individual
 */
export async function getIndividualIncomes(individualId: string): Promise<IncomeResponse[]> {
  return api.get<IncomeResponse[]>(`/incomes/individuals/${individualId}/incomes`)
}

/**
 * Create a new income for an individual
 */
export async function createIncome(individualId: string, data: IncomeCreateRequest): Promise<IncomeResponse> {
  return api.post<IncomeResponse>(`/incomes/individuals/${individualId}/incomes`, data)
}

/**
 * Update an existing income
 */
export async function updateIncome(incomeId: string, data: IncomeUpdateRequest): Promise<IncomeResponse> {
  return api.put<IncomeResponse>(`/incomes/incomes/${incomeId}`, data)
}

/**
 * Delete an income
 */
export async function deleteIncome(incomeId: string): Promise<void> {
  return api.delete<void>(`/incomes/incomes/${incomeId}`)
}

// ==========================================
// PROPERTY MANAGEMENT
// ==========================================

/**
 * Get all property relationships for an individual
 */
export async function getIndividualProperties(individualId: string): Promise<PropertyRelationshipResponse[]> {
  return api.get<PropertyRelationshipResponse[]>(`/properties/individuals/${individualId}/relationships`)
}

/**
 * Create a new property for an individual
 */
export async function createPropertyForIndividual(
  individualId: string, 
  propertyData: PropertyCreateRequest,
  relationshipData: PropertyRelationshipCreateRequest
): Promise<PropertyResponse> {
  const payload = {
    property_data: propertyData,
    relationship_data: relationshipData
  }
  return api.post<PropertyResponse>(`/properties/individuals/${individualId}/properties`, payload)
}

/**
 * Update a property relationship
 */
export async function updatePropertyRelationship(
  propertyId: string,
  relationshipId: string,
  data: Partial<PropertyRelationshipCreateRequest>
): Promise<PropertyRelationshipResponse> {
  return api.put<PropertyRelationshipResponse>(`/properties/${propertyId}/relationships/${relationshipId}`, data)
}

/**
 * Delete a property relationship
 */
export async function deletePropertyRelationship(propertyId: string, relationshipId: string): Promise<void> {
  return api.delete<void>(`/properties/${propertyId}/relationships/${relationshipId}`)
}
