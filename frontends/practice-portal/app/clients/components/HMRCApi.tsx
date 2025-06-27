'use client'

import React, { useState } from 'react'
import { MagnifyingGlassIcon, BuildingOfficeIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface CompanySearchResult {
  company_name: string
  company_number: string
  company_status: string
  company_type: string
  date_of_creation?: string
  registered_office_address?: {
    address_line_1?: string
    address_line_2?: string
    locality?: string
    region?: string
    postal_code?: string
    country?: string
  }
  description?: string
}

interface HMRCApiProps {
  onCompanySelect: (company: CompanySearchResult) => void
  onCreateManually: () => void
  onClose: () => void
}

export default function HMRCApi({ onCompanySelect, onCreateManually, onClose }: HMRCApiProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CompanySearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      // Call Companies House API search endpoint
      const response = await fetch(`/api/companies-house/search?q=${encodeURIComponent(searchQuery.trim())}&items_per_page=20`)
      
      if (!response.ok) {
        throw new Error('Failed to search companies')
      }

      const data = await response.json()
      
      if (data.success && data.results?.items) {
        setSearchResults(data.results.items)
      } else {
        setSearchResults([])
      }
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address?: any) => {
    if (!address) return ''
    const parts = [
      address.address_line_1,
      address.locality,
      address.postal_code
    ].filter(Boolean)
    return parts.join(', ')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Search Companies House
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Search for a company to auto-populate client details, or create a client manually.
              </p>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="mt-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search by company name or number..."
                    />
                    {loading && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !searchQuery.trim()}
                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Create Manually Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onCreateManually}
                  className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Client Manually
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
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
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    {searchResults.length === 0 ? 'No companies found' : `${searchResults.length} companies found`}
                  </h4>
                  
                  {searchResults.length > 0 && (
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {searchResults.map((company) => (
                          <li key={company.company_number}>
                            <button
                              onClick={() => onCompanySelect(company)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0 mt-1">
                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                      <BuildingOfficeIcon className="h-4 w-4 text-green-600" />
                                    </div>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium text-gray-900">
                                      {company.company_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {company.company_number} • {company.company_type}
                                    </div>
                                    {company.registered_office_address && (
                                      <div className="text-sm text-gray-500 mt-1">
                                        {formatAddress(company.registered_office_address)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-shrink-0 text-right">
                                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    company.company_status === 'active' 
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {company.company_status}
                                  </div>
                                  {company.date_of_creation && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Est. {new Date(company.date_of_creation).getFullYear()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {searchResults.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No companies found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search terms.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Initial State */}
              {!hasSearched && !loading && (
                <div className="text-center py-8">
                  <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Search Companies House Database</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Find a company to automatically populate client details with official data.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
