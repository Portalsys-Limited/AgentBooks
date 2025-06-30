// lib/customers/types.ts
// ==========================================
// CUSTOMER SERVICE TYPES
// ==========================================

import { BaseEntity } from '../shared/types'

// Income type - expanded with all backend fields
export interface Income {
  id: string
  income_type: string
  income_amount: number
  description?: string
  created_at: string
  updated_at?: string
}

// Property type - expanded with all backend fields
export interface Property {
  id: string
  property_name: string
  property_type: string
  property_status: string
  address_line_1: string
  address_line_2?: string
  town: string
  county?: string
  country?: string
  post_code: string
  purchase_price?: number
  current_value?: number
  monthly_rental_income?: number
  annual_rental_income?: number
  bedrooms?: string
  bathrooms?: string
  property_size?: string
  is_rental_property?: boolean
  tenant_name?: string
  lease_start_date?: string
  lease_end_date?: string
  description?: string
  notes?: string
  full_address?: string
  created_at: string
  updated_at?: string
}

// Property Individual Relationship type
export interface PropertyIndividualRelationship {
  id: string
  ownership_type: string
  ownership_percentage: number
  is_primary_owner: boolean
  start_date: string
  end_date?: string
  description?: string
  notes?: string
  property_id: string
  individual_id: string
  property?: Property  // Made optional to handle backend loading issues
  created_at: string
  updated_at?: string
}

// Individual type - expanded with all backend fields
export interface Individual {
  id: string
  first_name: string
  last_name: string
  full_name: string
  title?: string
  middle_name?: string
  
  // Personal details
  date_of_birth?: string
  deceased_date?: string
  is_deceased?: boolean
  marital_status?: string
  gender?: string
  nationality?: string
  
  // Contact information
  email?: string
  secondary_email?: string
  primary_mobile?: string
  secondary_mobile?: string
  
  // Address
  address_line_1?: string
  address_line_2?: string
  town?: string
  county?: string
  country?: string
  post_code?: string
  
  // System fields
  setup_date?: string
  last_edited?: string
  last_edited_by_id?: string
  last_edited_by?: UserSummary
  
  // Related data
  incomes?: Income[]
  property_relationships?: PropertyIndividualRelationship[]
}

// Client type
export interface Client {
  id: string
  business_name: string
  trading_name?: string
  business_type?: string
  main_phone?: string
  main_email?: string
}

// User summary type
export interface UserSummary {
  id: string
  email: string
  first_name?: string
  last_name?: string
  full_name: string
}

// Customer entity
export interface Customer extends BaseEntity {
  practice_id: string
  
  // Individual relationship
  individual_id: string
  individual: Individual
  
  // Basic info
  ni_number?: string
  personal_utr_number?: string
  status: string
  do_they_own_sa: boolean
  sa_client_relation_id?: string
  sa_client_relation?: Client
  
  // Practice info
  primary_accounting_contact_id?: string
  primary_accounting_contact?: UserSummary
  acting_from?: string
  
  // MLR info
  mlr_status: string
  mlr_date_complete?: string
  passport_number?: string
  driving_license?: string
  uk_home_telephone?: string
  
  // Additional info
  comments?: string
  notes?: string
  setup_date?: string
  last_edited?: string
  last_edited_by_id?: string
  last_edited_by?: UserSummary
  
  // Related data
  client_associations: Array<{
    id: string
    client: Client
  }>
}

// Customer creation data
export interface CreateCustomerData {
  individual_id?: string
  individual_data?: {
    personal_info: {
      first_name: string
      last_name: string
      email?: string
    }
    contact_info?: {
      // Add contact fields as needed
    }
    address?: {
      // Add address fields as needed
    }
    personal_details?: {
      // Add personal details fields as needed
    }
  }
  ni_number?: string
  personal_utr_number?: string
  status?: string
  do_they_own_sa?: boolean
  sa_client_relation_id?: string
  practice_info?: {
    primary_accounting_contact_id?: string
    acting_from?: string
  }
  mlr_info?: {
    status?: string
    date_complete?: string
    passport_number?: string
    driving_license?: string
    uk_home_telephone?: string
  }
  comments?: string
  notes?: string
}

// Customer update data
export interface UpdateCustomerData extends Partial<Omit<CreateCustomerData, 'individual_id' | 'individual_data'>> {}

// ==========================================
// TAB-SPECIFIC RESPONSE TYPES
// ==========================================

// Document response type
export interface DocumentResponse {
  id: string
  filename: string
  original_filename?: string
  document_url: string
  file_size?: string
  mime_type?: string
  document_type: string
  document_source: string
  document_category?: string
  title?: string
  description?: string
  tags?: string[]
  agent_state: string
  created_at: string
  updated_at?: string
  uploaded_by_user_id?: string
}

// Individual relationship response
export interface RelatedIndividualSummary {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email?: string
}

export interface IndividualRelationshipResponse {
  id: string
  from_individual_id: string
  to_individual_id: string
  relationship_type: string
  description?: string
  from_individual: RelatedIndividualSummary
  to_individual: RelatedIndividualSummary
  created_at: string
  updated_at?: string
}

// Customer client association with client
export interface CustomerClientAssociationWithClient {
  id: string
  customer_id: string
  client_id: string
  relationship_type: string
  percentage_ownership?: string
  appointment_date?: string
  resignation_date?: string
  is_active?: string
  is_primary_contact?: boolean
  notes?: string
  created_at: string
  updated_at?: string
  client: Client
}

// Individual summary for tab responses - expanded with all backend fields
export interface IndividualSummary {
  id: string
  first_name: string
  last_name: string
  full_name: string
  title?: string
  middle_name?: string
  
  // Personal details
  date_of_birth?: string
  deceased_date?: string
  is_deceased?: boolean
  marital_status?: string
  gender?: string
  nationality?: string
  
  // Contact information
  email?: string
  secondary_email?: string
  primary_mobile?: string
  secondary_mobile?: string
  
  // Address
  address_line_1?: string
  address_line_2?: string
  town?: string
  county?: string
  country?: string
  post_code?: string
  
  // System fields
  setup_date?: string
  last_edited?: string
  last_edited_by_id?: string
  last_edited_by?: UserSummary
  
  // Related data
  incomes?: Income[]
  property_relationships?: PropertyIndividualRelationship[]
}

// Customer Info Tab Response
export interface CustomerInfoTabResponse {
  id: string
  practice_id: string
  individual_id: string
  individual: IndividualSummary
  ni_number?: string
  personal_utr_number?: string
  status: string
  do_they_own_sa: boolean
  primary_accounting_contact_id?: string
  primary_accounting_contact?: UserSummary
  acting_from?: string
  
  // MLR info
  mlr_status: string
  mlr_date_complete?: string
  passport_number?: string
  driving_license?: string
  uk_home_telephone?: string
  
  comments?: string
  notes?: string
  setup_date?: string
  last_edited?: string
  last_edited_by_id?: string
  last_edited_by?: UserSummary
  created_at: string
  updated_at?: string
}

// Customer MLR Tab Response
export interface CustomerMLRTabResponse {
  id: string
  mlr_status: string
  mlr_date_complete?: string
  passport_number?: string
  driving_license?: string
  uk_home_telephone?: string
  last_edited?: string
  last_edited_by_id?: string
  last_edited_by?: UserSummary
}

// Customer Relationships Tab Response
export interface CustomerRelationshipsTabResponse {
  id: string
  client_associations: CustomerClientAssociationWithClient[]
  individual_relationships: IndividualRelationshipResponse[]
}

// Customer Documents Tab Response
export interface CustomerDocumentsTabResponse {
  id: string
  documents: DocumentResponse[]
} 