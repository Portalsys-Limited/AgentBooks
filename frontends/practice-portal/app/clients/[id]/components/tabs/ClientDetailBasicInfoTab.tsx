'use client'

import React from 'react'
import { IdentificationIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import ClientDetailSection from '../ClientDetailSection'

interface ClientDetail {
  client_code?: string
  business_name: string
  business_type?: string
  nature_of_business?: string
}

interface ClientDetailBasicInfoTabProps {
  client: ClientDetail
  onFieldChange: (key: string, value: string | boolean | number | string[]) => void
  isEditing: boolean
}

export default function ClientDetailBasicInfoTab({ client, onFieldChange, isEditing }: ClientDetailBasicInfoTabProps) {
  return (
    <div className="max-w-4xl">
      {/* Basic Information Section */}
      <ClientDetailSection
        title="Basic Information"
        icon={IdentificationIcon}
        isInitiallyExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div data-reactid="field-client-code">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Code
            </label>
            {isEditing ? (
              <input
                type="text"
                value={client.client_code || ''}
                onChange={(e) => onFieldChange('client_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Auto-generated"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.client_code || 'Not provided'}</p>
            )}
          </div>
          
          <div data-reactid="field-business-name">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name *
            </label>
            {isEditing ? (
              <input
                type="text"
                value={client.business_name || ''}
                onChange={(e) => onFieldChange('business_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.business_name || 'Not provided'}</p>
            )}
          </div>
          
          <div data-reactid="field-business-type">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Type
            </label>
            {isEditing ? (
              <select
                value={client.business_type || ''}
                onChange={(e) => onFieldChange('business_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Type</option>
                <option value="limited_company">Limited Company</option>
                <option value="public_limited_company">Public Limited Company</option>
                <option value="sole_trader">Sole Trader</option>
                <option value="partnership">Partnership</option>
                <option value="limited_liability_partnership">Limited Liability Partnership</option>
                <option value="charity">Charity</option>
                <option value="trust">Trust</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className="mt-1 text-sm text-gray-900 capitalize">{client.business_type?.replace('_', ' ') || 'Not provided'}</p>
            )}
          </div>
          
          <div className="md:col-span-2" data-reactid="field-nature-of-business">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nature of Business
            </label>
            {isEditing ? (
              <textarea
                value={client.nature_of_business || ''}
                onChange={(e) => onFieldChange('nature_of_business', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the nature of the business..."
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{client.nature_of_business || 'Not provided'}</p>
            )}
          </div>
        </div>
      </ClientDetailSection>
    </div>
  )
} 