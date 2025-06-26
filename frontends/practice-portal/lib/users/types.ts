// lib/users/types.ts
// ==========================================
// USER SERVICE TYPES
// ==========================================

import { BaseEntity } from '../shared/types'

// User roles (extending shared types)
export type UserRole = 'practice_owner' | 'accountant' | 'bookkeeper' | 'payroll' | 'client'

// User entity
export interface User extends BaseEntity {
  email: string
  role: UserRole
  practice_id: string | null
  client_ids: string[]
  name?: string
  first_name?: string
  last_name?: string
  is_active: boolean
  last_login?: string
  password_changed_at?: string
}

// User creation data
export interface CreateUserData {
  email: string
  role: UserRole
  practice_id?: string
  client_ids?: string[]
  name?: string
  first_name?: string
  last_name?: string
  password?: string
}

// User update data
export interface UpdateUserData extends Partial<CreateUserData> {
  is_active?: boolean
}

// User authentication data
export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  practiceId: string
  clientIds: string[]
  accessToken: string
}

// User statistics
export interface UserStats {
  total_users: number
  practice_staff: number
  client_users: number
  admins: number
  active_users: number
  inactive_users: number
}

// User role permissions
export interface UserPermissions {
  can_view_users: boolean
  can_create_users: boolean
  can_edit_users: boolean
  can_delete_users: boolean
  can_view_clients: boolean
  can_create_clients: boolean
  can_edit_clients: boolean
  can_delete_clients: boolean
} 