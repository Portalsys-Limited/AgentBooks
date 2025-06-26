// lib/associations/types.ts
// ==========================================
// CUSTOMER-CLIENT ASSOCIATION TYPES
// ==========================================

import { BaseEntity } from '../shared/types'

// Customer-Client Association entity
export interface CustomerClientAssociation extends BaseEntity {
  customer_id: string
  client_id: string
  relationship_type: string
  is_primary_contact: boolean
  notes?: string
  customer_name?: string
  customer_email?: string
}

// Association creation data
export interface CreateAssociationData {
  customer_id: string
  client_id: string
  relationship_type: string
  is_primary_contact?: boolean
  notes?: string
}

// Association update data
export interface UpdateAssociationData extends Partial<CreateAssociationData> {} 