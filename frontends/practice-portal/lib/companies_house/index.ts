// lib/companies_house/index.ts
// ==========================================
// COMPANIES HOUSE MODULE EXPORTS
// ==========================================
// This file exports all Companies House related functions and types
// Import from here to get everything you need for Companies House operations

// Export all types
export type {
  CompaniesHouseSearchResult,
  CompaniesHouseSearchResponse,
  CompaniesHouseProfile,
  CompaniesHouseAutoFillResponse,
  CompaniesHouseSearchParams,
  CompanySelectionData
} from './types'

// Export all service functions
export {
  searchCompaniesHouse,
  searchCompaniesHouseWithParams,
  triggerCompaniesHouseAutoFill,
  formatCompaniesHouseAddress,
  formatCompanyStatus,
  validateCompaniesHouseNumber,
  cleanCompaniesHouseNumber
} from './service' 