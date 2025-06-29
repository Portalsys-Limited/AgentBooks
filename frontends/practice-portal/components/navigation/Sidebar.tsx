'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '../../types'
import { getNavigationForRole } from '../../constants/navigation'
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, MagnifyingGlassIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { search } from '../../lib/search/service'
import { SearchResult } from '../../lib/search/types'

interface SidebarProps {
  user: User
}

export default function Sidebar({ user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showFloatingSearch, setShowFloatingSearch] = useState(false)
  const router = useRouter()
  const navigationItems = getNavigationForRole(user.role)
  const searchRef = useRef<HTMLDivElement>(null)

  // Persist collapsed state in localStorage
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebar-collapsed')
    if (savedCollapsedState !== null) {
      setIsCollapsed(JSON.parse(savedCollapsedState))
    }
  }, [])

  // Handle search
  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true)
        try {
          const results = await search(searchQuery, 10)
          setSearchResults(results)
          setShowResults(true)
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults(null)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults(null)
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery])

  // Handle click outside to close search results and floating search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setShowFloatingSearch(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const handleSearchResultClick = (type: 'client' | 'customer', id: string) => {
    setSearchQuery('')
    setShowResults(false)
    setShowFloatingSearch(false)
    const path = type === 'client' ? `/clients/${id}` : `/customers/${id}`
    router.push(path)
  }

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed
    setIsCollapsed(newCollapsedState)
    setShowFloatingSearch(false)
    setSearchQuery('')
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
    <>
      <div 
        className={`flex flex-col bg-white border-r border-gray-200 min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo and Brand */}
        <div className={`flex items-center h-16 px-4 border-b border-gray-200 ${
          isCollapsed ? 'justify-center' : 'justify-start'
        }`}>
          <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
            {/* Logo */}
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <img
                src="/LogoOnly.png"
                alt="AgentBooks Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            {/* Brand Name - Only show when not collapsed */}
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-base font-bold text-gray-900 truncate">AgentBooks</h1>
                <p className="text-xs text-gray-500 truncate">AI Accounting</p>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {isCollapsed ? (
          <div className="px-2 py-4 border-b border-gray-200 flex justify-center">
            <button
              onClick={() => setShowFloatingSearch(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-all duration-200 ease-in-out"
              title="Search clients & customers"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="px-4 py-4 border-b border-gray-200" ref={searchRef}>
            <div className="relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clients & customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && searchResults && setShowResults(true)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && searchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                  {searchResults.clients.length === 0 && searchResults.customers.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No results found
                    </div>
                  ) : (
                    <>
                      {/* Clients */}
                      {searchResults.clients.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                            Clients
                          </div>
                          {searchResults.clients.map((client) => (
                            <button
                              key={`client-${client.id}`}
                              onClick={() => handleSearchResultClick('client', client.id)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <BuildingOfficeIcon className="w-4 h-4 text-green-600" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {client.name}
                                  </div>
                                  {client.business_type && (
                                    <div className="text-xs text-gray-400 truncate">
                                      {client.business_type.replace('_', ' ')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Customers */}
                      {searchResults.customers.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                            Customers
                          </div>
                          {searchResults.customers.map((customer) => (
                            <button
                              key={`customer-${customer.id}`}
                              onClick={() => handleSearchResultClick('customer', customer.id)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <UserIcon className="w-4 h-4 text-blue-600" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {customer.name}
                                  </div>
                                  {customer.email && (
                                    <div className="text-xs text-gray-400 truncate">
                                      {customer.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

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
                    ? 'bg-gray-100 text-gray-900 border-r-2 border-gray-800'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                  {React.createElement(item.icon as any, {
                    className: `h-5 w-5 flex-shrink-0 transition-colors duration-200 ease-in-out ${
                      isActiveItem ? 'text-gray-700' : 'text-gray-500 group-hover:text-gray-700'
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
            className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-all duration-200 ease-in-out hover:shadow-sm"
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

      {/* Floating Search Bar */}
      {isCollapsed && showFloatingSearch && (
        <div 
          className="fixed left-20 top-0 mt-4 ml-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          ref={searchRef}
        >
          <div className="p-4 w-96">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients & customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {showResults && searchResults && (
              <div className="mt-2 bg-white rounded-md max-h-96 overflow-y-auto">
                {searchResults.clients.length === 0 && searchResults.customers.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No results found
                  </div>
                ) : (
                  <>
                    {/* Clients */}
                    {searchResults.clients.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                          Clients
                        </div>
                        {searchResults.clients.map((client) => (
                          <button
                            key={`client-${client.id}`}
                            onClick={() => handleSearchResultClick('client', client.id)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <BuildingOfficeIcon className="w-4 h-4 text-green-600" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {client.name}
                                </div>
                                {client.business_type && (
                                  <div className="text-xs text-gray-400 truncate">
                                    {client.business_type.replace('_', ' ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Customers */}
                    {searchResults.customers.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                          Customers
                        </div>
                        {searchResults.customers.map((customer) => (
                          <button
                            key={`customer-${customer.id}`}
                            onClick={() => handleSearchResultClick('customer', customer.id)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <UserIcon className="w-4 h-4 text-blue-600" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {customer.name}
                                </div>
                                {customer.email && (
                                  <div className="text-xs text-gray-400 truncate">
                                    {customer.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
} 