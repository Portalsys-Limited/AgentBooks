import { UserRole, RolePermissions } from '../types'

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.PRACTICE_OWNER]: {
    canViewDashboard: true,
    canViewClients: true,
    canManageClients: true,
    canViewInvoices: true,
    canManageInvoices: true,
    canViewUsers: true,
    canManageUsers: true,
    canViewReports: true,
    canManageSettings: true,
  },
  [UserRole.ACCOUNTANT]: {
    canViewDashboard: true,
    canViewClients: true,
    canManageClients: true,
    canViewInvoices: true,
    canManageInvoices: true,
    canViewUsers: false,
    canManageUsers: false,
    canViewReports: true,
    canManageSettings: false,
  },
  [UserRole.BOOKKEEPER]: {
    canViewDashboard: true,
    canViewClients: true,
    canManageClients: false,
    canViewInvoices: false,
    canManageInvoices: false,
    canViewUsers: false,
    canManageUsers: false,
    canViewReports: false,
    canManageSettings: false,
  },
  [UserRole.PAYROLL]: {
    canViewDashboard: true,
    canViewClients: false,
    canManageClients: false,
    canViewInvoices: false,
    canManageInvoices: false,
    canViewUsers: false,
    canManageUsers: false,
    canViewReports: false,
    canManageSettings: false,
  },
  [UserRole.CLIENT]: {
    canViewDashboard: false,
    canViewClients: false,
    canManageClients: false,
    canViewInvoices: false,
    canManageInvoices: false,
    canViewUsers: false,
    canManageUsers: false,
    canViewReports: false,
    canManageSettings: false,
  },
}

export const getRolePermissions = (role: UserRole): RolePermissions => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[UserRole.CLIENT]
}

export const hasPermission = (
  userRole: UserRole,
  permission: keyof RolePermissions
): boolean => {
  const permissions = getRolePermissions(userRole)
  return permissions[permission]
} 