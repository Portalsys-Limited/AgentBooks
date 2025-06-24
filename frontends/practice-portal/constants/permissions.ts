import { UserRole, RolePermissions, Permission } from '../types'

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.PRACTICE_OWNER]: {
    'VIEW_DASHBOARD': true,
    'VIEW_CLIENTS': true,
    'CREATE_CLIENTS': true,
    'EDIT_CLIENTS': true,
    'DELETE_CLIENTS': true,
    'VIEW_INVOICES': true,
    'CREATE_INVOICES': true,
    'EDIT_INVOICES': true,
    'DELETE_INVOICES': true,
    'VIEW_USERS': true,
    'CREATE_USERS': true,
    'EDIT_USERS': true,
    'DELETE_USERS': true,
    'VIEW_REPORTS': true,
    'MANAGE_SETTINGS': true,
   
  },
  [UserRole.ACCOUNTANT]: {
    'VIEW_DASHBOARD': true,
    'VIEW_CLIENTS': true,
    'CREATE_CLIENTS': true,
    'EDIT_CLIENTS': true,
    'DELETE_CLIENTS': false,
    'VIEW_INVOICES': true,
    'CREATE_INVOICES': true,
    'EDIT_INVOICES': true,
    'DELETE_INVOICES': false,
    'VIEW_USERS': false,
    'CREATE_USERS': false,
    'EDIT_USERS': false,
    'DELETE_USERS': false,
    'VIEW_REPORTS': true,
    'MANAGE_SETTINGS': false,
 
  },
  [UserRole.BOOKKEEPER]: {
    'VIEW_DASHBOARD': true,
    'VIEW_CLIENTS': true,
    'CREATE_CLIENTS': false,
    'EDIT_CLIENTS': false,
    'DELETE_CLIENTS': false,
    'VIEW_INVOICES': false,
    'CREATE_INVOICES': false,
    'EDIT_INVOICES': false,
    'DELETE_INVOICES': false,
    'VIEW_USERS': false,
    'CREATE_USERS': false,
    'EDIT_USERS': false,
    'DELETE_USERS': false,
    'VIEW_REPORTS': false,
    'MANAGE_SETTINGS': false,
   
  },
  [UserRole.PAYROLL]: {
    'VIEW_DASHBOARD': true,
    'VIEW_CLIENTS': false,
    'CREATE_CLIENTS': false,
    'EDIT_CLIENTS': false,
    'DELETE_CLIENTS': false,
    'VIEW_INVOICES': false,
    'CREATE_INVOICES': false,
    'EDIT_INVOICES': false,
    'DELETE_INVOICES': false,
    'VIEW_USERS': false,
    'CREATE_USERS': false,
    'EDIT_USERS': false,
    'DELETE_USERS': false,
    'VIEW_REPORTS': false,
    'MANAGE_SETTINGS': false,
   
  },
  [UserRole.CLIENT]: {
    'VIEW_DASHBOARD': false,
    'VIEW_CLIENTS': false,
    'CREATE_CLIENTS': false,
    'EDIT_CLIENTS': false,
    'DELETE_CLIENTS': false,
    'VIEW_INVOICES': false,
    'CREATE_INVOICES': false,
    'EDIT_INVOICES': false,
    'DELETE_INVOICES': false,
    'VIEW_USERS': false,
    'CREATE_USERS': false,
    'EDIT_USERS': false,
    'DELETE_USERS': false,
    'VIEW_REPORTS': false,
    'MANAGE_SETTINGS': false,

  },
}

export const getRolePermissions = (role: UserRole): RolePermissions => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[UserRole.CLIENT]
}

export const hasPermission = (
  userRole: UserRole,
  permission: Permission | keyof RolePermissions
): boolean => {
  const permissions = getRolePermissions(userRole)
  return permissions[permission] || false
} 