'use client'

import React from 'react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import ClientDetailSection from '../ClientDetailSection'

interface ClientDetail {
  trading_address?: {
    line_1?: string
    line_2?: string
    town?: string
    county?: string
    country?: string
    postcode?: string
  }
}

interface ClientDetailTradingAddressTabProps {
  client: ClientDetail
  onFieldChange: (key: string, value: string | boolean | number | string[]) => void
  isEditing: boolean
}

export default function ClientDetailTradingAddressTab({ client, onFieldChange, isEditing }: ClientDetailTradingAddressTabProps) {
  const handleAddressFieldChange = (field: string, value: string) => {
    const updatedAddress = {
      ...client.trading_address,
      [field]: value
    }
    onFieldChange('trading_address', updatedAddress as any)
  }

  return (
    <div className="max-w-4xl">
      {/* Trading Address Section */}
      <ClientDetailSection
        title="Trading Address"
        icon={MapPinIcon}
        isInitiallyExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2" data-reactid="field-trading-address-line-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1
            </label>
            {isEditing ? (
              <input
                type="text"
                value={client.trading_address?.line_1 || ''}
                onChange={(e) => handleAddressFieldChange('line_1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Street address, P.O. box, company name, c/o"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.trading_address?.line_1 || 'Not provided'}</p>
            )}
          </div>
          
          <div className="md:col-span-2" data-reactid="field-trading-address-line-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            {isEditing ? (
              <input
                type="text"
                value={client.trading_address?.line_2 || ''}
                onChange={(e) => handleAddressFieldChange('line_2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Apartment, suite, unit, building, floor, etc."
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.trading_address?.line_2 || 'Not provided'}</p>
            )}
          </div>
          
          <div data-reactid="field-trading-address-town">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Town
            </label>
            {isEditing ? (
              <input
                type="text"
                value={client.trading_address?.town || ''}
                onChange={(e) => handleAddressFieldChange('town', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.trading_address?.town || 'Not provided'}</p>
            )}
          </div>
          
          <div data-reactid="field-trading-address-county">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              County
            </label>
            {isEditing ? (
              <input
                type="text"
                value={client.trading_address?.county || ''}
                onChange={(e) => handleAddressFieldChange('county', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.trading_address?.county || 'Not provided'}</p>
            )}
          </div>
          
          <div data-reactid="field-trading-address-postcode">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Post Code
            </label>
            {isEditing ? (
              <input
                type="text"
                value={client.trading_address?.postcode || ''}
                onChange={(e) => handleAddressFieldChange('postcode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="SW1A 1AA"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.trading_address?.postcode || 'Not provided'}</p>
            )}
          </div>
          
          <div data-reactid="field-trading-address-country">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            {isEditing ? (
              <select
                value={client.trading_address?.country || 'United Kingdom'}
                onChange={(e) => handleAddressFieldChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="United Kingdom">United Kingdom</option>
                <option value="Ireland">Ireland</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.trading_address?.country || 'Not provided'}</p>
            )}
          </div>
        </div>
      </ClientDetailSection>
    </div>
  )
} 