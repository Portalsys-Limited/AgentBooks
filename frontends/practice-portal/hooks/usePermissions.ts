import { useMemo } from 'react'
import { UserRole, Permission } from '../types'
import { ROLE_PERMISSIONS } from '../constants/permissions'

export function usePermissions(role?: UserRole) {
  const permissions = useMemo(() => {
    if (!role) return {}
    return ROLE_PERMISSIONS[role] || {}
  }, [role])

  const checkPermission = (permission: Permission): boolean => {
    return permissions[permission] || false
  }

  const hasPermission = (permission: Permission): boolean => {
    return checkPermission(permission)
  }

  return {
    permissions,
    checkPermission,
    hasPermission,

  }
} 