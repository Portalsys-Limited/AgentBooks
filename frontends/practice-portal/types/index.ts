import { ReactNode } from 'react'

// User and Authentication Types
export interface User {
  id: string
  email: string
  role: UserRole
  practice_id: string | null
  practiceId: string | null // Keep both for compatibility
  client_ids: string[]
  created_at: string
  updated_at: string | null
}

export enum UserRole {
  PRACTICE_OWNER = 'practice_owner',
  ACCOUNTANT = 'accountant',
  BOOKKEEPER = 'bookkeeper',
  PAYROLL = 'payroll',
  CLIENT = 'client'
}

// Practice Types
export interface Practice {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  logo?: string
  createdAt: Date
  updatedAt: Date
}

// Client Types
export interface Client {
  id: string
  name: string
  practice_id: string
  created_at: string
  updated_at: string | null
  client_companies: Array<{
    id: string
    name: string
    created_at: string
    updated_at: string | null
  }>
  // Keep old properties for backward compatibility
  email?: string
  phone?: string
  address?: string
  practiceId?: string
  status?: string
  createdAt?: Date
  updatedAt?: Date
  companies?: any[]
}

// Invoice Types
export interface Invoice {
  id: string
  number: string
  clientId: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  dueDate: Date
  createdAt: Date
  updatedAt: Date
}

// Navigation Types
export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  roles: UserRole[]
}

// Dashboard Types
export interface DashboardStats {
  totalClients: number
  totalInvoices: number
  totalRevenue: number
  pendingTasks: number
  overdueInvoices: number
  monthlyRevenue: number
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface CreateClientForm {
  name: string
  email?: string
  phone?: string
  address?: string
}

export interface CreateUserForm {
  email: string
  role: UserRole
}

// Permission Types
export type Permission = 
  | 'VIEW_DASHBOARD'
  | 'VIEW_CLIENTS'
  | 'CREATE_CLIENTS'
  | 'EDIT_CLIENTS'
  | 'DELETE_CLIENTS'
  | 'VIEW_INVOICES'
  | 'CREATE_INVOICES'
  | 'EDIT_INVOICES'
  | 'DELETE_INVOICES'
  | 'VIEW_USERS'
  | 'CREATE_USERS'
  | 'EDIT_USERS'
  | 'DELETE_USERS'
  | 'VIEW_REPORTS'
  | 'MANAGE_SETTINGS'

export interface RolePermissions {
  [key: string]: boolean
} 