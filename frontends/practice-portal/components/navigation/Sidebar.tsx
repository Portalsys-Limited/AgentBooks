'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { User } from '../../types'
import { getNavigationForRole } from '../../constants/navigation'
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline'

interface SidebarProps {
  user: User
}

export default function Sidebar({ user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const navigationItems = getNavigationForRole(user.role)

  // Initialize collapsed state from localStorage only once
  useEffect(() => {
    if (!isInitialized) {
      const savedCollapsedState = localStorage.getItem('sidebar-collapsed')
      if (savedCollapsedState !== null) {
        setIsCollapsed(JSON.parse(savedCollapsedState))
      }
      setIsInitialized(true)
    }
  }, [isInitialized])

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed
    setIsCollapsed(newCollapsedState)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsedState))
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  // Don't render until initialized to prevent flashing
  if (!isInitialized) {
    return (
      <div className={`flex flex-col bg-gradient-to-b from-white via-white to-gray-50/30 border-r border-gray-200/60 backdrop-blur-md min-h-screen transition-all duration-300 ease-in-out w-64`}>
        <div className="h-16"></div>
      </div>
    )
  }

  return (
    <div 
      className={`flex flex-col bg-gradient-to-b from-white via-white to-gray-50/30 border-r border-gray-200/60 backdrop-blur-md min-h-screen transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top padding to account for fixed nav bar */}
      <div className="h-16"></div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActiveItem = isActive(item.href)

          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`w-full group flex items-center text-sm font-medium rounded-xl transition-all duration-300 ease-out ${
                isCollapsed 
                  ? 'px-2 py-3 justify-center' 
                  : 'px-4 py-3'
              } ${
                isActiveItem
                  ? 'bg-gradient-to-r from-gray-500/10 via-gray-400/10 to-gray-500/10 text-gray-800 backdrop-blur-xl backdrop-filter border border-gray-200/50 shadow-[0_8px_16px_-4px_rgba(75,85,99,0.15)] hover:shadow-[0_12px_20px_-4px_rgba(75,85,99,0.20)] scale-[1.02] relative before:absolute before:inset-0 before:bg-gray-400/10 before:rounded-xl before:blur-xl before:-z-10'
                  : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-500/5 hover:via-gray-400/5 hover:to-gray-500/5 hover:backdrop-blur-lg hover:text-gray-800 hover:scale-[1.01] hover:shadow-[0_4px_12px_-2px_rgba(75,85,99,0.1)] hover:border hover:border-gray-200/30 relative before:absolute before:inset-0 before:bg-transparent hover:before:bg-gray-400/5 before:rounded-xl before:blur-lg before:-z-10'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                {React.createElement(item.icon as any, {
                  className: `h-5 w-5 flex-shrink-0 transition-all duration-300 ease-out ${
                    isActiveItem ? 'text-gray-800 scale-110' : 'text-gray-500 group-hover:text-gray-700 group-hover:scale-105'
                  }`
                })}
                {!isCollapsed && <span className="ml-3 truncate font-medium">{item.name}</span>}
              </div>
              {!isCollapsed && item.badge && (
                <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-600 border border-red-100/50">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <div className="border-t border-gray-200/60 p-2">
        <button
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center p-2.5 text-gray-500 hover:text-gray-800 rounded-xl transition-all duration-300 ease-out hover:bg-gradient-to-r hover:from-gray-500/5 hover:via-gray-400/5 hover:to-gray-500/5 hover:backdrop-blur-lg hover:scale-[1.02] hover:shadow-[0_4px_12px_-2px_rgba(75,85,99,0.1)] hover:border hover:border-gray-200/30"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronDoubleRightIcon className="h-5 w-5 transition-transform duration-300 ease-out hover:scale-110" />
          ) : (
            <ChevronDoubleLeftIcon className="h-5 w-5 transition-transform duration-300 ease-out hover:scale-110" />
          )}
        </button>
      </div>
    </div>
  )
} 