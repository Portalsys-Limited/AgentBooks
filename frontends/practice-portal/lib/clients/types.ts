// lib/clients/types.ts
// ==========================================
// CLIENT SERVICE TYPES
// ==========================================
// This file defines all the data structures used when working with business clients
// Think of these as templates that describe what information we store about clients

import { BaseEntity, ContactFields, AddressFields } from '../shared/types'

// ==========================================
// CORE CLIENT TYPES
// ==========================================

/**
 * CLIENT - The main business entity
 * This represents a business that we provide accounting/tax services to
 * Examples: ABC Limited, Smith & Sons Trading, Jane's Coffee Shop
 */
export interface Client extends BaseEntity, ContactFields, AddressFields {
  name: string                    // The official business name (e.g., "ABC Limited")
  trading_name?: string          // What they're known as publicly (e.g., "ABC Coffee")
  business_type?: string         // Type of business (e.g., "Limited Company", "Sole Trader")
  type: 'client'                // Internal marker to identify this as a client record
  customer_name?: string        // Legacy field - name of associated customer
  customer_id?: string          // Legacy field - ID of associated customer
  services?: ClientService[]    // List of services we provide to this client
  associations?: ClientAssociation[]  // People connected to this business (directors, shareholders, etc.)
}

/**
 * CLIENT SERVICES - Services we provide to each client
 * Examples: "Annual Accounts", "VAT Returns", "Payroll", "Tax Planning"
 */
export interface ClientService {
  service_id: string            // Unique identifier for this service
  service_code: string          // Short code (e.g., "VAT", "PAYE", "ACCOUNTS")
  name: string                  // Human-readable name (e.g., "VAT Return Preparation")
  description?: string          // Detailed explanation of what this service includes
  is_enabled: boolean           // Whether this client receives this service
  price?: number               // How much we charge this client for this service
  assigned_at?: string         // When we started providing this service
  updated_at?: string          // When this service assignment was last changed
}

/**
 * SERVICE - Available services our practice offers
 * This is the master list of all services we can provide
 */
export interface Service {
  id: string                    // Unique identifier
  service_code: string          // Short code for the service
  name: string                  // Service name
  description?: string          // What this service involves
  created_at?: string          // When this service was added to our offerings
  updated_at?: string          // When this service was last modified
}

// ==========================================
// CLIENT CREATION & UPDATES
// ==========================================

/**
 * CREATE CLIENT DATA - Information needed to add a new business client
 * This is what you fill out on the "Add New Client" form
 */
export interface CreateClientData extends ContactFields, AddressFields {
  name: string                  // Business name (required)
  trading_name?: string        // Trading name (optional)
  business_type?: string       // Business structure (optional)
  auto_fill_companies_house?: boolean  // Should we try to get info from Companies House?
}

/**
 * UPDATE CLIENT DATA - Information that can be changed for existing clients
 * Any field can be updated, or you can just update specific fields
 */
export interface UpdateClientData extends Partial<CreateClientData> {
  services?: Array<{           // Update which services this client receives
    service_id: string         // Which service
    is_enabled: boolean        // Should they receive it?
    price?: number            // How much do we charge?
  }>
}

// ==========================================
// CLIENT-CUSTOMER ASSOCIATIONS
// ==========================================

/**
 * RELATIONSHIP TYPES - How people can be connected to a business
 * These define the legal/business relationship between a person and a company
 */
export type RelationshipType = 
  | 'director'           // Company director (makes business decisions)
  | 'shareholder'        // Owns shares in the company
  | 'partner'           // Business partner (in partnerships)
  | 'son'               // Family member - son
  | 'daughter'          // Family member - daughter
  | 'spouse'            // Family member - spouse/partner
  | 'parent'            // Family member - parent
  | 'sibling'           // Family member - brother/sister
  | 'investor'          // Someone who has invested money
  | 'employee'          // Works for the business
  | 'consultant'        // Provides specialist advice
  | 'secretary'         // Company secretary (legal role)
  | 'accountant'        // External accountant
  | 'solicitor'         // Legal advisor
  | 'beneficial_owner'  // Actually owns/controls the business (may be hidden)
  | 'trustee'           // Manages assets in trust
  | 'guarantor'         // Guarantees business debts
  | 'other'             // Any other relationship

/**
 * CLIENT ASSOCIATION - Links between people (customers) and businesses (clients)
 * Example: "John Smith is a Director of ABC Limited"
 */
export interface ClientAssociation {
  id: string                    // Unique identifier for this relationship
  customer_id: string          // The person's ID
  client_id: string            // The business's ID
  relationship_type: RelationshipType  // How they're connected
  percentage_ownership?: string // If shareholder/partner, what % do they own?
  appointment_date?: string    // When did this relationship start?
  resignation_date?: string    // When did this relationship end?
  is_active: boolean           // Is this relationship still current?
  is_primary_contact: boolean  // Is this the main person we contact about this business?
  notes?: string               // Any additional information
  created_at?: string         // When we recorded this relationship
  updated_at?: string         // When this relationship was last updated
  customer_name?: string      // The person's name (for display)
  customer_email?: string     // The person's email (for display)
}

/**
 * CREATE ASSOCIATION DATA - Information needed to link a person to a business
 */
export interface CreateAssociationData {
  customer_id: string          // Which person
  client_id: string            // Which business
  relationship_type: RelationshipType  // How they're connected
  percentage_ownership?: string // Ownership percentage if applicable
  appointment_date?: string    // When this relationship started
  resignation_date?: string    // When this relationship ended (if applicable)
  is_active?: boolean         // Is this relationship current? (default: true)
  is_primary_contact?: boolean // Is this the main contact? (default: false)
  notes?: string              // Additional notes
}

/**
 * UPDATE ASSOCIATION DATA - Changes that can be made to existing relationships
 */
export interface UpdateAssociationData {
  relationship_type?: RelationshipType
  percentage_ownership?: string
  appointment_date?: string
  resignation_date?: string
  is_active?: boolean
  is_primary_contact?: boolean
  notes?: string
}



/**
 * DETAILED CLIENT RESPONSE
 * Complete information about a client including all related data
 * This is what you get when viewing a client's full profile
 */
export interface DetailedClientResponse {
  // Basic business information
  id: string
  business_name: string
  trading_name?: string
  business_type?: string
  companies_house_number?: string
  vat_number?: string
  corporation_tax_utr?: string
  paye_reference?: string
  nature_of_business?: string
  sic_code?: string
  incorporation_date?: string
  accounting_period_end?: string
  
  // Contact information
  main_email?: string
  main_phone?: string
  
  // Addresses
  registered_address: {
    line_1?: string
    line_2?: string
    city?: string
    county?: string
    postcode?: string
    country?: string
  }
  trading_address: {
    line_1?: string
    line_2?: string
    city?: string
    county?: string
    postcode?: string
    country?: string
  }
  
  // Banking details
  banking: {
    name?: string
    sort_code?: string
    account_number?: string
    account_name?: string
  }
  
  // System information
  notes?: string
  created_at?: string
  updated_at?: string
  
  // Related data
  customer_associations: Array<{
    customer_id: string
    relationship_type: string
    percentage_ownership?: number
    is_active: boolean
    is_primary_contact: boolean
  }>
  services: ClientService[]
  companies_house_profile?: any  // Official government data (if available)
} 