'use client'

import React from 'react'
import { DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import ClientDetailSection from '../ClientDetailSection'

interface ClientDetail {
  companies_house_raw_data?: any
  companies_house_last_sync?: string
  companies_house_number?: string
}

interface ClientDetailCompaniesHouseDataTabProps {
  client: ClientDetail
  onRefresh: () => void
}

export default function ClientDetailCompaniesHouseDataTab({ client, onRefresh }: ClientDetailCompaniesHouseDataTabProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never synced'
    return new Date(dateString).toLocaleString()
  }

  const handleRefreshData = async () => {
    // This would typically call the Companies House API
    try {
      // Placeholder for actual API call
      console.log('Refreshing Companies House data for:', client.companies_house_number)
      await onRefresh()
    } catch (error) {
      console.error('Failed to refresh Companies House data:', error)
    }
  }

  return (
    <div className="max-w-4xl">
      {/* Companies House Data Section */}
      <ClientDetailSection
        title="Companies House RAW Data"
        icon={DocumentTextIcon}
        isInitiallyExpanded={true}
      >
        <div className="space-y-6">
          {/* Sync Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Sync Information</h4>
                <p className="text-xs text-gray-500">Last synced: {formatDate(client.companies_house_last_sync)}</p>
              </div>
              <button
                onClick={handleRefreshData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                data-reactid="refresh-companies-house-data"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Refresh Data
              </button>
            </div>
          </div>

          {/* RAW Data Display */}
          {client.companies_house_raw_data ? (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Raw Companies House Response</h4>
              <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                  {JSON.stringify(client.companies_house_raw_data, null, 2)}
                </pre>
              </div>
              
              {/* Key Information Summary */}
              {typeof client.companies_house_raw_data === 'object' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Key Information</h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Company Status:</span>
                        <span className="ml-2">{client.companies_house_raw_data.company_status || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Date of Creation:</span>
                        <span className="ml-2">{client.companies_house_raw_data.date_of_creation || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Jurisdiction:</span>
                        <span className="ml-2">{client.companies_house_raw_data.jurisdiction || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Accounts Information</h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Next Due:</span>
                        <span className="ml-2">{client.companies_house_raw_data.accounts?.next_due || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Overdue:</span>
                        <span className="ml-2">{client.companies_house_raw_data.accounts?.overdue ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Companies House Data</h3>
              <p className="mt-1 text-sm text-gray-500">
                {client.companies_house_number 
                  ? 'Click "Refresh Data" to fetch information from Companies House'
                  : 'No company number provided'
                }
              </p>
            </div>
          )}
        </div>
      </ClientDetailSection>
    </div>
  )
} 