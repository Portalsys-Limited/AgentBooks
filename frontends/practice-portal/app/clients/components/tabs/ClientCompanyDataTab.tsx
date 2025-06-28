'use client'

import React from 'react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import ClientFormSection from '../ClientFormSection'

interface ClientFormData {
  companies_house_number?: string
  date_of_incorporation?: string
  companies_house_auth_code?: string
  is_currently_dormant?: boolean
  registered_at_practice_address?: boolean
  registered_address_different_from_trading?: boolean
}

interface ClientCompanyDataTabProps {
  client: ClientFormData
  onFieldChange: (key: string, value: string | boolean | number | string[] | any) => void
}

export default function ClientCompanyDataTab({ client, onFieldChange }: ClientCompanyDataTabProps) {
  return (
    <div className="max-w-4xl">
      <ClientFormSection
        title="Company Data"
        icon={DocumentTextIcon}
        isInitiallyExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div data-reactid="field-companies-house-number">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Number
            </label>
            <input
              type="text"
              value={client.companies_house_number || ''}
              onChange={(e) => onFieldChange('companies_house_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 12345678"
            />
          </div>
          
          <div data-reactid="field-date-of-incorporation">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Incorporation
            </label>
            <input
              type="date"
              value={client.date_of_incorporation || ''}
              onChange={(e) => onFieldChange('date_of_incorporation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div data-reactid="field-is-currently-dormant">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Is Currently Dormant?
            </label>
            <select
              value={client.is_currently_dormant ? 'true' : 'false'}
              onChange={(e) => onFieldChange('is_currently_dormant', e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>
      </ClientFormSection>
    </div>
  )
} 