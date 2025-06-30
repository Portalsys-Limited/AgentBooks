'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '../../types'
import { getNavigationForRole } from '../../constants/navigation'
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline'

interface SidebarProps {
  user: User
}

export default function Sidebar({ user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const navigationItems = getNavigationForRole(user.role)

  // Persist collapsed state in localStorage
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebar-collapsed')
    if (savedCollapsedState !== null) {
      setIsCollapsed(JSON.parse(savedCollapsedState))
    }
  }, [])

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed
    setIsCollapsed(newCollapsedState)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsedState))
  }

  const isActive = (href: string) => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      return pathname === href || pathname.startsWith(href + '/')
    }
    return false
  }

  return (
    <div 
      className={`flex flex-col bg-white border-r border-gray-200 min-h-screen transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top padding to account for fixed nav bar */}
      <div className="h-16"></div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActiveItem = isActive(item.href)

          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`w-full group flex items-center text-sm font-medium rounded-md transition-all duration-200 ease-in-out ${
                isCollapsed 
                  ? 'px-2 py-3 justify-center' 
                  : 'px-3 py-2'
              } ${
                isActiveItem
                  ? 'bg-blue-50 text-[#0077b6]'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-[#0077b6] hover:shadow-sm'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                {React.createElement(item.icon as any, {
                  className: `h-5 w-5 flex-shrink-0 transition-colors duration-200 ease-in-out ${
                    isActiveItem ? 'text-[#0077b6]' : 'text-gray-500 group-hover:text-[#0077b6]'
                  }`
                })}
                {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
              </div>
              {!isCollapsed && item.badge && (
                <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-red-100 text-red-600">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <div className="border-t border-gray-200 p-2">
        <button
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-[#0077b6] hover:bg-blue-50 rounded-md transition-all duration-200 ease-in-out hover:shadow-sm"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronDoubleRightIcon className="h-5 w-5" />
          ) : (
            <ChevronDoubleLeftIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  )
} 