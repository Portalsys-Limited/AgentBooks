'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '../../types'
import { 
  BellIcon, 
  Cog6ToothIcon, 
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  SparklesIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline'
import { search } from '../../lib/search/service'
import { SearchResult } from '../../lib/search/types'

interface TopNavBarProps {
  user: User
  onLogout: () => void
}

// Memoize the entire component to prevent unnecessary re-renders
const TopNavBar = React.memo(({ user, onLogout }: TopNavBarProps) => {
  const router = useRouter()
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isMaxMode, setIsMaxMode] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  
  // Cache user display name
  const userDisplayName = user.email.split('@')[0]
  
  // Format role once since it won't change during component lifecycle
  const formattedRole = user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())

  // Typing animation logic
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const placeholders = [
    "Search for 'John Smith'...",
    "Try 'ABC Corp'...",
    "Search 'Tax Services'...",
    "Find 'Recent Invoices'...",
    "Ask 'Show overdue payments'..."
  ]

  useEffect(() => {
    let currentText = placeholders[placeholderIndex]
    let currentIndex = 0
    let typingTimer: NodeJS.Timeout
    let deletingTimer: NodeJS.Timeout

    const typeText = () => {
      if (currentIndex < currentText.length) {
        setDisplayedPlaceholder(prev => currentText.slice(0, currentIndex + 1))
        currentIndex++
        typingTimer = setTimeout(typeText, 50) // Typing speed
      } else {
        setTimeout(() => setIsTyping(false), 2000) // Pause at the end
      }
    }

    const deleteText = () => {
      if (currentIndex > 0) {
        setDisplayedPlaceholder(prev => currentText.slice(0, currentIndex - 1))
        currentIndex--
        deletingTimer = setTimeout(deleteText, 30) // Deleting speed
      } else {
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
        setIsTyping(true)
      }
    }

    if (isTyping) {
      typeText()
    } else {
      deleteText()
    }

    return () => {
      clearTimeout(typingTimer)
      clearTimeout(deletingTimer)
    }
  }, [placeholderIndex, isTyping])

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

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchResultClick = (type: 'client' | 'customer', id: string) => {
    setSearchQuery('')
    setShowResults(false)
    const path = type === 'client' ? `/clients/${id}` : `/customers/${id}`
    router.push(path)
  }

  return (
    <>
      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes subtleSearchGlow {
          0%, 100% {
            box-shadow: 
              0 0 0 1px rgba(255, 255, 255, 0.2),
              0 0 2px rgba(255, 255, 255, 0.2),
              0 0 4px rgba(59, 130, 246, 0.1);
          }
          50% {
            box-shadow: 
              0 0 0 1px rgba(255, 255, 255, 0.3),
              0 0 4px rgba(255, 255, 255, 0.25),
              0 0 8px rgba(59, 130, 246, 0.15);
          }
        }

        @keyframes maxSearchGlow {
          0% {
            box-shadow: 
              0 0 0 2px #ff6b6b,
              0 0 8px rgba(255, 107, 107, 0.3),
              0 0 12px rgba(255, 107, 107, 0.1);
          }
          25% {
            box-shadow: 
              0 0 0 2px #4ecdc4,
              0 0 8px rgba(78, 205, 196, 0.3),
              0 0 12px rgba(78, 205, 196, 0.1);
          }
          50% {
            box-shadow: 
              0 0 0 2px #45b7d1,
              0 0 8px rgba(69, 183, 209, 0.3),
              0 0 12px rgba(69, 183, 209, 0.1);
          }
          75% {
            box-shadow: 
              0 0 0 2px #96ceb4,
              0 0 8px rgba(150, 206, 180, 0.3),
              0 0 12px rgba(150, 206, 180, 0.1);
          }
          100% {
            box-shadow: 
              0 0 0 2px #ffeaa7,
              0 0 8px rgba(255, 234, 167, 0.3),
              0 0 12px rgba(255, 234, 167, 0.1);
          }
        }

        .search-container {
          border-radius: 9999px;
          animation: subtleSearchGlow 3s ease-in-out infinite;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
        }

        .search-container.max-mode {
          animation: maxSearchGlow 4s ease-in-out infinite;
        }

        .search-input {
          background: transparent;
          transition: all 0.3s ease;
        }

        .max-toggle {
          transition: all 0.3s ease;
        }

        .max-toggle:hover {
          transform: scale(1.05);
        }

        .max-toggle.active {
          background: transparent;
        }

        .max-text {
          color: white;
          transition: all 0.3s ease;
        }

        .max-text.active {
          background: linear-gradient(
            45deg,
            #ff6b6b 0%,
            #4ecdc4 25%,
            #45b7d1 50%,
            #96ceb4 75%,
            #ffeaa7 100%
          );
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.3));
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .sparkles-icon {
          transition: all 0.3s ease;
        }

        .sparkles-icon.active {
          color: rgba(255, 255, 255, 0.9);
          filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.5));
        }
      `}</style>
      
      <nav className="bg-gradient-to-r from-blue-700/95 via-blue-600/80 to-blue-700/95 shadow-sm border-b border-blue-600/40 px-2 sm:px-4 lg:px-6">
        <div className="grid grid-cols-3 h-16 relative">
          {/* Left side - Logo, Brand, and Back button */}
          <div className="flex items-center space-x-4 justify-start">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center flex-shrink-0 relative group">
              <span className="text-4xl font-extrabold text-white/90 tracking-wide transition-all duration-300 group-hover:scale-110 group-hover:text-opacity-80 filter drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]" style={{ fontFamily: 'Inter, sans-serif' }}>
                A
              </span>
            </div>
          </div>
        
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="p-2 text-blue-100 hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-white/25 transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm relative before:absolute before:inset-0 before:rounded-full before:bg-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Center - Search Bar */}
        <div className="flex items-center justify-center col-span-1" ref={searchRef}>
          <div className="w-[33.333vw] relative">
                          <div className={`relative search-container ${isMaxMode ? 'max-mode' : ''}`}>
              {/* Left icon */}
              {isMaxMode ? (
                <SparklesIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-white/80 sparkles-icon active animate-pulse z-20" />
              ) : (
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-white/80 z-20" />
              )}
              
              {/* Search input */}
              <input
                type="text"
                placeholder={isMaxMode ? "Chat with MAX..." : displayedPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-20 py-1.5 text-sm rounded-full border border-white/20 focus:outline-none focus:border-white/40 search-input text-white placeholder-white/60"
              />

              {/* Right side buttons */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                  {/* MAX toggle button */}
                                    <button
                    onClick={() => setIsMaxMode(!isMaxMode)}
                    className={`max-toggle p-1.5 rounded-full flex items-center justify-center transition-all ${
                      isMaxMode ? 'active' : ''
                    }`}
                  >
                    <span className={`text-xs font-medium max-text ${isMaxMode ? 'active' : ''}`}>
                      MAX
                    </span>
                  </button>

                {/* Loading spinner */}
                {isSearching && (
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                )}
              </div>
            </div>

            {/* Search Results Dropdown */}
            {!isMaxMode && showResults && searchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {searchResults.clients.length === 0 && searchResults.customers.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No results found
                  </div>
                ) : (
                  <>
                    {/* Clients */}
                    {searchResults.clients.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-blue-50 border-b border-gray-100">
                          Clients
                        </div>
                        {searchResults.clients.map((client) => (
                          <button
                            key={`client-${client.id}`}
                            onClick={() => handleSearchResultClick('client', client.id)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {client.name}
                                </div>
                                {client.business_type && (
                                  <div className="text-xs text-gray-500 truncate">
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
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-blue-50 border-b border-gray-100">
                          Customers
                        </div>
                        {searchResults.customers.map((customer) => (
                          <button
                            key={`customer-${customer.id}`}
                            onClick={() => handleSearchResultClick('customer', customer.id)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                  <UserIcon className="w-4 h-4 text-slate-600" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {customer.name}
                                </div>
                                {customer.email && (
                                  <div className="text-xs text-gray-500 truncate">
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

        {/* Right side - User menu and notifications */}
        <div className="flex items-center space-x-4 justify-end">
          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 text-blue-100 hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-white/25 transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm relative before:absolute before:inset-0 before:rounded-full before:bg-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-blue-600"></span>
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => router.push('/settings')}
            className="p-2 text-blue-100 hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-white/25 transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm relative before:absolute before:inset-0 before:rounded-full before:bg-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
          >
            <span className="sr-only">Settings</span>
            <Cog6ToothIcon className="h-6 w-6" />
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-3 p-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-white/25 transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm relative before:absolute before:inset-0 before:rounded-lg before:bg-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
            >
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-white">
                    {userDisplayName}
                  </div>
                  <div className="text-xs text-blue-100">
                    {formattedRole}
                  </div>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-blue-100" />
              </div>
            </button>

            {/* Dropdown menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">
                      {userDisplayName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {user.email}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formattedRole}
                    </div>
                  </div>

                  {/* Menu items */}
                  <button
                    onClick={() => {
                      router.push('/profile')
                      setIsProfileDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 flex items-center transition-colors"
                  >
                    <UserCircleIcon className="h-4 w-4 mr-3 text-gray-500" />
                    Your Profile
                  </button>

                  <button
                    onClick={() => {
                      router.push('/settings')
                      setIsProfileDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 flex items-center transition-colors"
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-3 text-gray-500" />
                    Settings
                  </button>

                  <div className="border-t border-gray-100"></div>

                  <button
                    onClick={() => {
                      onLogout()
                      setIsProfileDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-900 flex items-center transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-gray-500" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
    </>
  )
})

export default TopNavBar