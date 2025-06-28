'use client'

import React from 'react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import ClientDetailSection from '../ClientDetailSection'

interface ClientDetail {
  companies_house_number?: string
  date_of_incorporation?: string
  companies_house_auth_code?: string
  is_currently_dormant?: boolean
  registered_at_practice_address?: boolean
  registered_address_different_from_trading?: boolean
}

interface ClientDetailCompanyDataTabProps {
  client: ClientDetail
  onFieldChange: (key: string, value: string | boolean | number | string[]) => void
  isEditing: boolean
}

export default function ClientDetailCompanyDataTab({ client, onFieldChange, isEditing }: ClientDetailCompanyDataTabProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="max-w-4xl">
      {/* Company Data Section */}
      <ClientDetailSection
        title="Company Data"
        icon={DocumentTextIcon}
        isInitiallyExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div data-reactid="field-companies-house-number">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Number
            </label>
            {isEditing ? (
              <input
                type="text"
                value={client.companies_house_number || ''}
                onChange={(e) => onFieldChange('companies_house_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 12345678"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.companies_house_number || 'Not provided'}</p>
            )}
          </div>
          
          <div data-reactid="field-date-of-incorporation">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Incorporation
            </label>
            {isEditing ? (
              <input
                type="date"
                value={client.date_of_incorporation || ''}
                onChange={(e) => onFieldChange('date_of_incorporation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{formatDate(client.date_of_incorporation)}</p>
            )}
          </div>
          
          <div data-reactid="field-companies-house-auth-code">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Companies House Authentication Code
            </label>
            {isEditing ? (
              <input
                type="text"
                value={client.companies_house_auth_code || ''}
                onChange={(e) => onFieldChange('companies_house_auth_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Authentication code"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.companies_house_auth_code || 'Not provided'}</p>
            )}
          </div>
          
          <div data-reactid="field-is-currently-dormant">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Is Currently Dormant?
            </label>
            {isEditing ? (
              <select
                value={client.is_currently_dormant ? 'true' : 'false'}
                onChange={(e) => onFieldChange('is_currently_dormant', e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.is_currently_dormant ? 'Yes' : 'No'}</p>
            )}
          </div>
          
          <div data-reactid="field-registered-at-practice-address">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registered at practice address?
            </label>
            {isEditing ? (
              <select
                value={client.registered_at_practice_address ? 'true' : 'false'}
                onChange={(e) => onFieldChange('registered_at_practice_address', e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.registered_at_practice_address ? 'Yes' : 'No'}</p>
            )}
          </div>
          
          <div data-reactid="field-registered-address-different-from-trading">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registered address different from trading address?
            </label>
            {isEditing ? (
              <select
                value={client.registered_address_different_from_trading ? 'true' : 'false'}
                onChange={(e) => onFieldChange('registered_address_different_from_trading', e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.registered_address_different_from_trading ? 'Yes' : 'No'}</p>
            )}
          </div>
        </div>
      </ClientDetailSection>
    </div>
  )
} 