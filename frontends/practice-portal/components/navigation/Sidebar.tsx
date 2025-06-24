'use client'

import React from 'react'
import { User } from '../../types'
import { getNavigationForRole } from '../../constants/navigation'
import { redirectTo } from '../../utils/navigation'

interface SidebarProps {
  user: User
  onLogout: () => void
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const navigationItems = getNavigationForRole(user.role)

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'practice_owner': 'Practice Owner',
      'accountant': 'Accountant',
      'bookkeeper': 'Bookkeeper',
      'payroll': 'Payroll Staff'
    }
    return roleMap[role] || role
  }

  const getRoleColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      'practice_owner': 'bg-purple-500',
      'accountant': 'bg-blue-500',
      'bookkeeper': 'bg-green-500',
      'payroll': 'bg-orange-500'
    }
    return colorMap[role] || 'bg-gray-500'
  }

  const handleNavigation = (href: string) => {
    redirectTo(href)
  }

  const isActive = (href: string) => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      return pathname === href || pathname.startsWith(href + '/')
    }
    return false
  }

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
      {/* Logo and Brand */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">AgentBooks</h1>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || user.email.split('@')[0]}
            </p>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${getRoleColor(user.role)}`}>
                {getRoleDisplayName(user.role)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigationItems.map((item) => {
          const isActiveItem = isActive(item.href)
          const Icon = item.icon

          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out ${
                isActiveItem
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 transition-colors duration-150 ease-in-out ${
                  isActiveItem ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
              {item.badge && (
                <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-red-100 text-red-600">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 ease-in-out"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  )
} 