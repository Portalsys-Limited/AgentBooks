// lib/clients/types.ts
// ==========================================
// CLIENT SERVICE TYPES
// ==========================================

import { BaseEntity, ContactFields, AddressFields } from '../shared/types'

// Client entity
export interface Client extends BaseEntity, ContactFields, AddressFields {
  name: string
  trading_name?: string
  business_type?: string
  type: 'client'
  customer_name?: string
  customer_id?: string
  services?: ClientService[]
  associations?: ClientAssociation[]
}

// Client Services
export interface ClientService {
  service_id: string
  service_code: string
  name: string
  description?: string
  is_enabled: boolean
  assigned_at?: string
  updated_at?: string
}

// Service entity
export interface Service {
  id: string
  service_code: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

// Client creation data
export interface CreateClientData extends ContactFields, AddressFields {
  name: string
  trading_name?: string
  business_type?: string
}

// Client update data
export interface UpdateClientData extends Partial<CreateClientData> {
  services?: Array<{
    service_id: string
    is_enabled: boolean
  }>
}

// Association reference for clients
export interface ClientAssociation {
  id: string
  customer_id: string
  client_id: string
  relationship_type: string
  is_primary_contact: boolean
  notes?: string
  created_at?: string
  updated_at?: string
  customer_name?: string
  customer_email?: string
} 