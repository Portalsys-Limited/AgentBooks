// lib/customers/types.ts
// ==========================================
// CUSTOMER SERVICE TYPES
// ==========================================

import { BaseEntity, ContactFields, AddressFields } from '../shared/types'

// Customer entity
export interface Customer extends BaseEntity, ContactFields, AddressFields {
  name: string
  first_name?: string
  last_name?: string
  type: 'customer'
  client_count: number
}

// Customer creation data
export interface CreateCustomerData extends ContactFields, AddressFields {
  name: string
  first_name?: string
  last_name?: string
}

// Customer update data
export interface UpdateCustomerData extends Partial<CreateCustomerData> {} 