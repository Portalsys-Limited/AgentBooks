// lib/customers/types.ts
// ==========================================
// CUSTOMER SERVICE TYPES
// ==========================================

import { BaseEntity } from '../shared/types'

// Income type
export interface Income {
  id: string
  income_type: string
  income_amount: number
  description?: string
  created_at: string
  updated_at?: string
}

// Property type
export interface Property {
  id: string
  // Add property fields as needed
}

// Individual type
export interface Individual {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email?: string
  incomes: Income[]
  properties: Property[]
}

// Client type
export interface Client {
  id: string
  business_name: string
  trading_name?: string
  status?: string
  created_at?: string
}

// User summary type
export interface UserSummary {
  id: string
  email: string
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