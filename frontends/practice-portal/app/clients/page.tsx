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
  CalendarIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import NewClient from './components/NewClient'

// ✅ CLEAN: Import from organized lib structure
import { 
  searchCustomersAndClients,
  type SearchResult,
  ApiError
} from '../../lib'

// Import specific types from their modules
import type { Customer } from '../../lib/customers'
import type { Client } from '../../lib/clients'

// Simple debounce implementation
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
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
  const [showNewClient, setShowNewClient] = useState(false)

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
        // ✅ CLEAN: Use service function instead of raw fetch
        const data = await searchCustomersAndClients({
          q: query.trim(),
          limit: 20,
          search_customers: showCustomers,
          search_clients: showClients
        })
        setSearchResults(data)
        setHasSearched(true)
      } catch (err) {
        console.error('Search error:', err)
        if (err instanceof ApiError) {
          setError(`Search failed: ${err.message}`)
        } else {
          setError(err instanceof Error ? err.message : 'Search failed')
        }
      } finally {
        setLoading(false)
      }
    }, 300),
    [showCustomers, showClients]
  )

  useEffect(() => {
    performSearch(searchQuery)
  }, [searchQuery, performSearch, showCustomers, showClients])

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

  if (showNewClient) {
    return (
      <AppLayout>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <NewClient onCancel={() => setShowNewClient(false)} />
        </main>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Customers & Clients
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Search and manage your customers (people) and clients (companies)
                </p>
              </div>
              <button
                onClick={() => setShowNewClient(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add New Client
              </button>
            </div>
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
            <div className="space-y-6">
              {/* Results Summary */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {searchResults.total === 0 ? 'No results found' : `${searchResults.total} results found`}
                </h3>
                {searchResults.total > 0 && (
                  <div className="text-sm text-gray-500">
                    {searchResults.customers.length} customers • {searchResults.clients.length} clients
                  </div>
                )}
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Clients Column */}
                <div className={`${!showClients && 'hidden'}`}>
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                    Clients ({searchResults.clients.length})
                  </h4>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md h-full">
                    {searchResults.clients.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {searchResults.clients.map((client) => (
                          <li key={client.id}>
                            <button
                              onClick={() => handleResultClick(client)}
                              className="w-full text-left px-6 py-4 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                      <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {client.name}
                                      {client.trading_name && client.trading_name !== client.name && (
                                        <span className="text-gray-500 ml-2">
                                          (Trading as: {client.trading_name})
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                                    </div>
                                    {client.customer_name && (
                                      <div className="text-sm text-gray-500 mt-1">
                                        Customer: {client.customer_name}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  {client.created_at && (
                                    <div className="text-sm text-gray-500 flex items-center">
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
                    ) : (
                      <div className="p-6 text-center text-gray-500">No clients found</div>
                    )}
                  </div>
                </div>

                {/* Customers Column */}
                <div className={`${!showCustomers && 'hidden'}`}>
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Customers ({searchResults.customers.length})
                  </h4>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md h-full">
                    {searchResults.customers.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {searchResults.customers.map((customer) => (
                          <li key={customer.id}>
                            <button
                              onClick={() => handleResultClick(customer)}
                              className="w-full text-left px-6 py-4 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      <UserIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {customer.name}
                                      {customer.first_name && customer.last_name && (
                                        <span className="text-gray-500 ml-2">
                                          ({customer.first_name} {customer.last_name})
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                                  </div>
                                </div>
                                <div className="text-right">
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
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-6 text-center text-gray-500">No customers found</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Empty State */}
              {((searchResults.total === 0 && hasSearched) || 
                (!showCustomers && !showClients)) && !loading && (
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
      </main>
    </AppLayout>
  )
} 