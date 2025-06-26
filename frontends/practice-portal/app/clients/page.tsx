'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../../components/layout/AppLayout'
import { useAuth } from '../../hooks/useAuth'
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

// Simple debounce implementation
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

interface SearchResult {
  customers: Customer[]
  clients: Client[]
  total: number
}

interface Customer {
  id: string
  name: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  type: 'customer'
  client_count: number
  created_at?: string
}

interface Client {
  id: string
  name: string
  trading_name?: string
  business_type?: string
  email?: string
  phone?: string
  type: 'client'
  customer_name?: string
  customer_id?: string
  created_at?: string
}

export default function ClientsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult>({ customers: [], clients: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [showCustomers, setShowCustomers] = useState(true)
  const [showClients, setShowClients] = useState(true)

  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.trim().length < 2) {
        setSearchResults({ customers: [], clients: [], total: 0 })
        setHasSearched(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/search/?q=${encodeURIComponent(query.trim())}&limit=20`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`)
        }

        const data = await response.json()
        setSearchResults(data)
        setHasSearched(true)
      } catch (err) {
        console.error('Search error:', err)
        setError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  useEffect(() => {
    performSearch(searchQuery)
  }, [searchQuery, performSearch])

  const handleResultClick = (result: Customer | Client) => {
    if (result.type === 'customer') {
      router.push(`/customers/${result.id}`)
    } else {
      router.push(`/clients/${result.id}`)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Customers & Clients
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Search and manage your customers and clients:
          </p>
        </div>

        {/* Search Bar and Filters */}
        <div className="mb-8 flex items-center space-x-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-lg"
              placeholder="Search for customers or clients..."
            />
            {loading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          
          {/* Filter Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setShowCustomers(!showCustomers)}
              className={`inline-flex items-center px-4 py-2 rounded-lg border ${
                showCustomers 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              } transition-colors duration-200`}
            >
              <UserIcon className={`h-5 w-5 ${showCustomers ? 'text-blue-600' : 'text-gray-400'} mr-2`} />
              Customers
            </button>
            <button
              onClick={() => setShowClients(!showClients)}
              className={`inline-flex items-center px-4 py-2 rounded-lg border ${
                showClients 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              } transition-colors duration-200`}
            >
              <BuildingOfficeIcon className={`h-5 w-5 ${showClients ? 'text-green-600' : 'text-gray-400'} mr-2`} />
              Clients
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Search Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <div>
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {searchResults.total === 0 ? 'No results found' : `${searchResults.total} results found`}
              </h3>
              {searchResults.total > 0 && (
                <div className="text-sm text-gray-500">
                  {searchResults.customers.length} customers • {searchResults.clients.length} clients
                </div>
              )}
            </div>

            {/* Two-Column Results Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Clients Column */}
              {showClients && searchResults.clients.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 mr-2 text-green-600" />
                    Clients ({searchResults.clients.length})
                  </h4>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {searchResults.clients.map((client) => (
                        <li key={client.id}>
                          <button
                            onClick={() => handleResultClick(client)}
                            className="w-full text-left px-6 py-4 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
                                </div>
                              </div>
                              <div className="ml-4 flex-grow">
                                <div className="text-sm font-medium text-gray-900">
                                  {client.name}
                                  {client.trading_name && client.trading_name !== client.name && (
                                    <span className="text-gray-500 ml-2">
                                      (Trading as: {client.trading_name})
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-1">
                                  {client.business_type && (
                                    <div className="capitalize">
                                      {client.business_type.replace('_', ' ')}
                                    </div>
                                  )}
                                  {client.email && (
                                    <div className="flex items-center">
                                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                                      {client.email}
                                    </div>
                                  )}
                                  {client.phone && (
                                    <div className="flex items-center">
                                      <PhoneIcon className="h-4 w-4 mr-1" />
                                      {client.phone}
                                    </div>
                                  )}
                                </div>
                                {client.customer_name && (
                                  <div className="text-sm text-gray-500 mt-1">
                                    Customer: {client.customer_name}
                                  </div>
                                )}
                                {client.created_at && (
                                  <div className="text-sm text-gray-500 mt-1 flex items-center">
                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                    {formatDate(client.created_at)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Customers Column */}
              {showCustomers && searchResults.customers.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Customers ({searchResults.customers.length})
                  </h4>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {searchResults.customers.map((customer) => (
                        <li key={customer.id}>
                          <button
                            onClick={() => handleResultClick(customer)}
                            className="w-full text-left px-6 py-4 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <UserIcon className="h-6 w-6 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4 flex-grow">
                                <div className="text-sm font-medium text-gray-900">
                                  {customer.name}
                                  {customer.first_name && customer.last_name && (
                                    <span className="text-gray-500 ml-2">
                                      ({customer.first_name} {customer.last_name})
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-1">
                                  {customer.email && (
                                    <div className="flex items-center">
                                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                                      {customer.email}
                                    </div>
                                  )}
                                  {customer.phone && (
                                    <div className="flex items-center">
                                      <PhoneIcon className="h-4 w-4 mr-1" />
                                      {customer.phone}
                                    </div>
                                  )}
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                  <div className="text-sm text-gray-900">
                                    {customer.client_count} {customer.client_count === 1 ? 'client' : 'clients'}
                                  </div>
                                  {customer.created_at && (
                                    <div className="text-sm text-gray-500 flex items-center">
                                      <CalendarIcon className="h-4 w-4 mr-1" />
                                      {formatDate(customer.created_at)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Empty State */}
            {((searchResults.total === 0 && hasSearched) || 
              (!showCustomers && !showClients) ||
              (showCustomers && !searchResults.customers.length && !showClients) ||
              (showClients && !searchResults.clients.length && !showCustomers)) && !loading && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {!showCustomers && !showClients 
                    ? 'Please enable at least one filter to see results'
                    : 'Try adjusting your search terms or check for typos'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && !loading && (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Search for customers and clients</h3>
            <p className="mt-1 text-sm text-gray-500">
              Enter at least 2 characters to search by name, email, phone, or other details
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  )
} 