// lib/individuals/types.ts
// ==========================================
// INDIVIDUAL SERVICE TYPES
// ==========================================

import { BaseEntity } from '../shared/types'

// Personal Info
export interface PersonalInfo {
  first_name: string
  last_name: string
  title?: string
  middle_name?: string
}

// Contact Info
export interface ContactInfo {
  email?: string
  secondary_email?: string
  primary_mobile?: string
  secondary_mobile?: string
}

// Address Info
export interface AddressInfo {
  line_1?: string
  line_2?: string
  town?: string
  county?: string
  country?: string
  post_code?: string
}

// Personal Details
export interface PersonalDetails {
  date_of_birth?: string
  deceased_date?: string
  marital_status?: string
  gender?: string
  nationality?: string
}

// Individual Update Request
export interface IndividualUpdateRequest {
  personal_info?: PersonalInfo
  contact_info?: ContactInfo
  address?: AddressInfo
  personal_details?: PersonalDetails
}

// Individual Response
export interface Individual extends BaseEntity {
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
  last_edited_by?: {
    id: string
    email: string
    first_name?: string
    last_name?: string
    full_name: string
  }
}

// ==========================================
// INCOME TYPES
// ==========================================

export interface IncomeCreateRequest {
  income_type: string
  income_amount: number
  description?: string
}

export interface IncomeUpdateRequest {
  income_type?: string
  income_amount?: number
  description?: string
}

export interface IncomeResponse {
  id: string
  individual_id: string
  income_type: string
  income_amount: number
  description?: string
  created_at: string
  updated_at?: string
}

// ==========================================
// PROPERTY TYPES
// ==========================================

export interface PropertyCreateRequest {
  property_name: string
  property_type: string
  property_status?: string
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
}

export interface PropertyRelationshipCreateRequest {
  ownership_type: string
  ownership_percentage: number
  is_primary_owner?: boolean
  start_date: string
  end_date?: string
  description?: string
  notes?: string
}

export interface PropertyResponse {
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
  individual_relationships?: IndividualRelationshipSummary[]
}

export interface IndividualRelationshipSummary {
  id: string
  ownership_type: string
  ownership_percentage: number
  is_primary_owner: boolean
  start_date: string
  end_date?: string
  description?: string
  individual_id: string
  individual: {
    id: string
    first_name: string
    last_name: string
    full_name: string
    email?: string
  }
}

export interface PropertyRelationshipResponse {
  id: string
  property_id: string
  individual_id: string
  ownership_type: string
  ownership_percentage: number
  is_primary_owner: boolean
  start_date: string
  end_date?: string
  description?: string
  notes?: string
  created_at: string
  updated_at?: string
  property?: PropertyResponse
}
