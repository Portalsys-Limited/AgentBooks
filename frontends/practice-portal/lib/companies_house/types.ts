// lib/companies_house/types.ts
// ==========================================
// COMPANIES HOUSE SERVICE TYPES
// ==========================================
// This file defines all the data structures used when working with Companies House
// Companies House is the UK government database of company information

/**
 * COMPANIES HOUSE SEARCH RESULT
 * Individual company from search results
 * This represents one company found when searching the government database
 */
export interface CompaniesHouseSearchResult {
  company_name: string         // Official company name (e.g., "ABC Limited")
  company_number: string       // Companies House reference number (e.g., "12345678")
  company_status: string       // "active", "dissolved", "liquidation", etc.
  company_type: string         // "private-limited-company", "plc", "partnership", etc.
  date_of_creation?: string    // When the company was incorporated (YYYY-MM-DD)
  registered_office_address?: {
    address_line_1?: string    // First line of registered address
    address_line_2?: string    // Second line of registered address
    locality?: string          // Town/city
    region?: string            // County/region
    postal_code?: string       // Postcode
    country?: string           // Country (usually "England", "Wales", etc.)
  }
  description?: string         // Brief description of the company's business
  sic_codes?: string[]        // Standard Industrial Classification codes
}

/**
 * COMPANIES HOUSE SEARCH RESPONSE
 * Response from searching the Companies House database
 * This is what we get back when someone searches for companies
 */
export interface CompaniesHouseSearchResponse {
  success: boolean             // Did the search work?
  results?: {                  // Search results (if successful)
    items: CompaniesHouseSearchResult[]  // Array of companies found
    total_results: number      // Total number of companies matching the search
    start_index: number        // Which result number we started from
    items_per_page: number     // How many results per page
  }
  query: string               // What was searched for
  pagination: {               // Information about pagination
    items_per_page: number
    start_index: number
    total_results: number
  }
}

/**
 * COMPANIES HOUSE COMPANY PROFILE
 * Detailed information about a specific company
 * This is the complete official data from Companies House
 */
export interface CompaniesHouseProfile {
  id: string                   // Our internal ID for this profile
  company_name: string         // Official registered company name
  company_number: string       // Companies House reference number
  company_status: string       // Current status (active, dissolved, etc.)
  company_type: string         // Type of company structure
  is_active: boolean          // Is the company still operating?
  registered_office_address?: {
    address_line_1?: string
    address_line_2?: string
    locality?: string
    region?: string
    postal_code?: string
    country?: string
  }
  sic_codes?: string[]        // Business activity codes
  last_synced: string         // When we last updated this from Companies House
  linking_status: string      // How well our data matches Companies House
  date_of_creation?: string   // Incorporation date
  date_of_cessation?: string  // Date company stopped trading (if applicable)
  accounts?: {                // Filing information
    next_due?: string
    last_made_up_to?: string
    overdue?: boolean
  }
  confirmation_statement?: {  // Annual confirmation statement info
    next_due?: string
    last_made_up_to?: string
    overdue?: boolean
  }
  officers?: Array<{          // Company directors and officers
    name: string
    officer_role: string
    appointed_on?: string
    resigned_on?: string
  }>
}

/**
 * COMPANIES HOUSE AUTO-FILL RESPONSE
 * When we automatically fill in business details from the government database
 * This is what gets returned when auto-fill is successful
 */
export interface CompaniesHouseAutoFillResponse {
  success: boolean             // Did the auto-fill work?
  message: string             // What happened (success or error message)
  client: {                   // Updated client information
    id: string
    business_name: string
    companies_house_number: string
    last_updated: string | null
  }
  companies_house_profile: CompaniesHouseProfile  // Complete official government data
}

/**
 * COMPANIES HOUSE SEARCH PARAMS
 * Parameters for searching Companies House
 */
export interface CompaniesHouseSearchParams {
  query: string               // What to search for
  items_per_page?: number     // How many results per page (default: 20, max: 100)
  start_index?: number        // Starting position for results (default: 0)
}

/**
 * COMPANY SELECTION DATA
 * Data that gets passed when a user selects a company from search results
 * This contains all the information needed to create a client
 */
export interface CompanySelectionData extends CompaniesHouseSearchResult {
  // All the fields from CompaniesHouseSearchResult, plus any additional processing
  selected_at?: string        // When this company was selected
  auto_fill_requested?: boolean  // Whether user wants to auto-fill from this data
}