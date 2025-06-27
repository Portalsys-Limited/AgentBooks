'use client'

import React, { useState } from 'react'
import { MagnifyingGlassIcon, BuildingOfficeIcon, XMarkIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { 
  searchCompaniesHouse, 
  formatCompaniesHouseAddress, 
  formatCompanyStatus,
  type CompaniesHouseSearchResult,
  type CompanySelectionData
} from '../../../lib/companies_house'

interface HMRCApiProps {
  onCompanySelect: (company: CompanySelectionData) => void
  onCreateManually: () => void
  onClose: () => void
}

export default function HMRCApi({ onCompanySelect, onCreateManually, onClose }: HMRCApiProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CompaniesHouseSearchResult[]>([])
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
      // Use the proper Companies House service function
      const response = await searchCompaniesHouse(searchQuery.trim(), 20, 0)
      
      if (response.success && response.results?.items) {
        // Ensure we have all required fields in the search results
        const validatedResults = response.results.items.map(item => ({
          ...item,
          company_name: item.company_name || '',
          company_number: item.company_number || '',
          company_status: item.company_status || 'unknown',
          company_type: item.company_type || 'unknown'
        }))
        setSearchResults(validatedResults)
      } else {
        setSearchResults([])
      }
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleCompanySelect = (company: CompaniesHouseSearchResult) => {
    // Add selection metadata to the company data
    const selectionData: CompanySelectionData = {
      ...company,
      company_name: company.company_name || '',  // Ensure required fields are present
      company_number: company.company_number || '',
      company_status: company.company_status || 'unknown',
      company_type: company.company_type || 'unknown',
      selected_at: new Date().toISOString(),
      auto_fill_requested: true
    }
    
    console.log('Selected company data:', selectionData)  // Debug log
    onCompanySelect(selectionData)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
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
                Search the official UK government database to find a company and auto-populate client details, or create a client manually.
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
                        {searchResults.map((company) => {
                          const statusFormat = formatCompanyStatus(company.company_status)
                          const companyName = company.company_name || 'Unknown Company'
                          const companyNumber = company.company_number
                          const incorporationDate = company.date_of_creation
                            ? `Incorporated on ${new Date(company.date_of_creation).toLocaleDateString('en-GB')}`
                            : ''
                          
                          return (
                            <li key={company.company_number}>
                              <button
                                onClick={() => handleCompanySelect(company)}
                                className="w-full text-left px-4 py-4 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                                    statusFormat.variant === 'success' ? 'bg-green-100' :
                                    statusFormat.variant === 'warning' ? 'bg-yellow-100' :
                                    statusFormat.variant === 'error' ? 'bg-red-100' :
                                    'bg-gray-100'
                                  }`}>
                                    <BuildingOfficeIcon className={`h-5 w-5 ${
                                      statusFormat.variant === 'success' ? 'text-green-600' :
                                      statusFormat.variant === 'warning' ? 'text-yellow-600' :
                                      statusFormat.variant === 'error' ? 'text-red-600' :
                                      'text-gray-600'
                                    }`} />
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        {/* Company Name */}
                                        <div className="text-base font-medium text-gray-900">
                                          {companyName}
                                        </div>
                                        
                                        {/* Company Number and Status */}
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <span className="font-mono">{companyNumber}</span>
                                          <span>•</span>
                                          <span>Ltd</span>
                                          {company.date_of_creation && (
                                            <>
                                              <span>•</span>
                                              <span>Est. {new Date(company.date_of_creation).getFullYear()}</span>
                                            </>
                                          )}
                                        </div>
                                        
                                        {/* Incorporation Date */}
                                        <div className="text-sm text-gray-500">
                                          {incorporationDate}
                                        </div>
                                      </div>
                                      
                                      {/* Status Badge */}
                                      <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        statusFormat.variant === 'success' ? 'bg-green-100 text-green-800' :
                                        statusFormat.variant === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                        statusFormat.variant === 'error' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {statusFormat.label}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                  
                  {searchResults.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No companies found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search terms or check the spelling.
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
                    Find a company to automatically populate client details with official government data.
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
