// lib/companies_house/service.ts
// ==========================================
// COMPANIES HOUSE SERVICE FUNCTIONS
// Direct calls to backend Companies House endpoints
// ==========================================
// This file contains all the functions that communicate with our backend server
// to search and manage Companies House data

import { api } from '../api-client'
import { 
  CompaniesHouseSearchResponse,
  CompaniesHouseSearchParams,
  CompaniesHouseAutoFillResponse
} from './types'

// ==========================================
// COMPANIES HOUSE SEARCH FUNCTIONS
// ==========================================

/**
 * SEARCH COMPANIES HOUSE DATABASE
 * Searches for companies using the official UK government database
 * 📋 Use this for: finding companies before creating clients, verifying company details
 * 👥 Who can use: Practice owners, accountants, bookkeepers
 * 
 * How it works:
 * 1. You provide a search term (company name or number)
 * 2. We search the official Companies House database
 * 3. Returns a list of matching companies with basic details
 * 
 * @param query - What to search for (company name, number, etc.)
 * @param itemsPerPage - How many results per page (default: 20, max: 100)
 * @param startIndex - Starting position for results (default: 0)
 * @returns Search results from Companies House
 */
export async function searchCompaniesHouse(
  query: string,
  itemsPerPage: number = 20,
  startIndex: number = 0
): Promise<CompaniesHouseSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    items_per_page: itemsPerPage.toString(),
    start_index: startIndex.toString()
  })
  
  return api.get<CompaniesHouseSearchResponse>(`/companies-house/search?${params}`)
}

/**
 * SEARCH COMPANIES HOUSE WITH PARAMS
 * Alternative search function that accepts a params object
 * 📋 Use this for: more complex search scenarios with multiple parameters
 * 
 * @param params - Search parameters object
 * @returns Search results from Companies House
 */
export async function searchCompaniesHouseWithParams(
  params: CompaniesHouseSearchParams
): Promise<CompaniesHouseSearchResponse> {
  return searchCompaniesHouse(
    params.query,
    params.items_per_page,
    params.start_index
  )
}

// ==========================================
// CLIENT AUTO-FILL FUNCTIONS
// ==========================================

/**
 * AUTO-FILL CLIENT FROM COMPANIES HOUSE
 * Automatically fills in business client details using official government data
 * 📋 Use this for: quickly setting up UK limited companies with official data
 * 👥 Who can use: Practice owners, accountants, bookkeepers
 * 
 * How it works:
 * 1. You provide a client ID (client must already exist)
 * 2. Client must have a companies_house_number set
 * 3. We fetch official business details from Companies House
 * 4. Client information is automatically updated with official data
 * 
 * @param clientId - Which client to auto-fill (must exist and have companies_house_number)
 * @returns Success/failure message and updated client data
 */
export async function triggerCompaniesHouseAutoFill(
  clientId: string
): Promise<CompaniesHouseAutoFillResponse> {
  return api.post<CompaniesHouseAutoFillResponse>(`/companies-house/clients/${clientId}/auto-fill`)
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * FORMAT COMPANY ADDRESS
 * Formats a Companies House address object into a readable string
 * 📋 Use this for: displaying addresses in UI components
 * 
 * @param address - Address object from Companies House
 * @returns Formatted address string
 */
export function formatCompaniesHouseAddress(address?: any): string {
  if (!address) return ''
  
  const parts = [
    address.address_line_1,
    address.address_line_2,
    address.locality,
    address.region,
    address.postal_code
  ].filter(Boolean)
  
  return parts.join(', ')
}

/**
 * FORMAT COMPANY STATUS
 * Formats company status for display with appropriate styling hints
 * 📋 Use this for: displaying company status with proper formatting
 * 
 * @param status - Company status from Companies House
 * @returns Object with formatted status and styling information
 */
export function formatCompanyStatus(status: string): {
  label: string
  variant: 'success' | 'warning' | 'error' | 'neutral'
} {
  const normalizedStatus = status.toLowerCase()
  
  switch (normalizedStatus) {
    case 'active':
      return { label: 'Active', variant: 'success' }
    case 'dissolved':
      return { label: 'Dissolved', variant: 'error' }
    case 'liquidation':
      return { label: 'In Liquidation', variant: 'warning' }
    case 'administration':
      return { label: 'In Administration', variant: 'warning' }
    case 'receivership':
      return { label: 'In Receivership', variant: 'warning' }
    default:
      return { label: status, variant: 'neutral' }
  }
}

/**
 * VALIDATE COMPANIES HOUSE NUMBER
 * Validates that a Companies House number is in the correct format
 * 📋 Use this for: form validation before searching or creating clients
 * 
 * @param companyNumber - Company number to validate
 * @returns Whether the number is valid
 */
export function validateCompaniesHouseNumber(companyNumber: string): boolean {
  if (!companyNumber) return false
  
  // Remove any spaces and convert to uppercase
  const cleaned = companyNumber.replace(/\s/g, '').toUpperCase()
  
  // UK company numbers are typically 8 digits, sometimes with letters
  // Format: 12345678 or AB123456 or OC123456 (for various company types)
  const companyNumberRegex = /^([A-Z]{0,2}\d{6,8}|\d{8})$/
  
  return companyNumberRegex.test(cleaned)
}

/**
 * CLEAN COMPANIES HOUSE NUMBER
 * Cleans and formats a Companies House number
 * 📋 Use this for: preparing company numbers before API calls
 * 
 * @param companyNumber - Raw company number input
 * @returns Cleaned company number
 */
export function cleanCompaniesHouseNumber(companyNumber: string): string {
  if (!companyNumber) return ''
  
  // Remove spaces, convert to uppercase, and pad with leading zeros if needed
  const cleaned = companyNumber.replace(/\s/g, '').toUpperCase()
  
  // If it's all digits and less than 8 characters, pad with leading zeros
  if (/^\d+$/.test(cleaned) && cleaned.length < 8) {
    return cleaned.padStart(8, '0')
  }
  
  return cleaned
}

