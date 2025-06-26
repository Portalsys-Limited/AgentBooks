// lib/users/service.ts
// ==========================================
// USER SERVICE FUNCTIONS
// Direct calls to backend user endpoints
// ==========================================

import { api } from '../api-client'
import { PaginatedResponse } from '../shared/types'
import { User, CreateUserData, UpdateUserData, UserStats, UserPermissions, UserRole } from './types'

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
  return api.get<User[]>('/users')
}

/**
 * Get users with pagination
 */
export async function getUsersPaginated(
  page: number = 1, 
  perPage: number = 20
): Promise<PaginatedResponse<User>> {
  return api.get<PaginatedResponse<User>>(`/users?page=${page}&per_page=${perPage}`)
}

/**
 * Get user by ID
 */
export async function getUser(id: string): Promise<User> {
  return api.get<User>(`/users/${id}`)
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserData): Promise<User> {
  return api.post<User>('/users', data)
}

/**
 * Update user
 */
export async function updateUser(id: string, data: UpdateUserData): Promise<User> {
  return api.put<User>(`/users/${id}`, data)
}

/**
 * Partially update user
 */
export async function patchUser(id: string, data: Partial<UpdateUserData>): Promise<User> {
  return api.patch<User>(`/users/${id}`, data)
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<void> {
  return api.delete<void>(`/users/${id}`)
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User> {
  return api.get<User>('/users/me')
}

/**
 * Update current user profile
 */
export async function updateCurrentUser(data: Partial<UpdateUserData>): Promise<User> {
  return api.put<User>('/users/me', data)
}

/**
 * Change user password
 */
export async function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
  return api.post<void>(`/users/${userId}/change-password`, {
    old_password: oldPassword,
    new_password: newPassword
  })
}

/**
 * Deactivate user (soft delete)
 */
export async function deactivateUser(id: string): Promise<User> {
  return api.patch<User>(`/users/${id}`, { is_active: false })
}

/**
 * Activate user
 */
export async function activateUser(id: string): Promise<User> {
  return api.patch<User>(`/users/${id}`, { is_active: true })
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: UserRole): Promise<User[]> {
  return api.get<User[]>(`/users?role=${role}`)
}

/**
 * Get practice staff (excluding clients)
 */
export async function getPracticeStaff(): Promise<User[]> {
  return api.get<User[]>('/users?exclude_role=client')
}

/**
 * Get client users only
 */
export async function getClientUsers(): Promise<User[]> {
  return api.get<User[]>('/users?role=client')
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<UserStats> {
  return api.get<UserStats>('/users/stats')
}

/**
 * Get user permissions based on role
 */
export async function getUserPermissions(role: UserRole): Promise<UserPermissions> {
  return api.get<UserPermissions>(`/users/permissions?role=${role}`)
}

/**
 * Reset user password (admin only)
 */
export async function resetUserPassword(userId: string): Promise<{ temporary_password: string }> {
  return api.post<{ temporary_password: string }>(`/users/${userId}/reset-password`)
}

/**
 * Assign user to clients
 */
export async function assignUserToClients(userId: string, clientIds: string[]): Promise<User> {
  return api.patch<User>(`/users/${userId}`, { client_ids: clientIds })
}

/**
 * Remove user from clients
 */
export async function removeUserFromClients(userId: string, clientIds: string[]): Promise<User> {
  const user = await getUser(userId)
  const updatedClientIds = user.client_ids.filter(id => !clientIds.includes(id))
  return api.patch<User>(`/users/${userId}`, { client_ids: updatedClientIds })
} 