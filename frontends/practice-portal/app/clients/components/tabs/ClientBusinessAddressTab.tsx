'use client'

import React from 'react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import ClientFormSection from '../ClientFormSection'

interface ClientFormData {
  registered_address?: {
    line_1?: string
    line_2?: string
    town?: string
    county?: string
    country?: string
    postcode?: string
  }
}

interface ClientBusinessAddressTabProps {
  client: ClientFormData
  onFieldChange: (key: string, value: string | boolean | number | string[] | any) => void
}

export default function ClientBusinessAddressTab({ client, onFieldChange }: ClientBusinessAddressTabProps) {
  const handleAddressFieldChange = (field: string, value: string) => {
    const updatedAddress = {
      ...client.registered_address,
      [field]: value
    }
    onFieldChange('registered_address', updatedAddress)
  }

  return (
    <div className="max-w-4xl">
      <ClientFormSection
        title="Business Address (Registered Address)"
        icon={MapPinIcon}
        isInitiallyExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2" data-reactid="field-registered-address-line-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              value={client.registered_address?.line_1 || ''}
              onChange={(e) => handleAddressFieldChange('line_1', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Street address, P.O. box, company name, c/o"
            />
          </div>
          
          <div className="md:col-span-2" data-reactid="field-registered-address-line-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              value={client.registered_address?.line_2 || ''}
              onChange={(e) => handleAddressFieldChange('line_2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Apartment, suite, unit, building, floor, etc."
            />
          </div>
          
          <div data-reactid="field-registered-address-town">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Town
            </label>
            <input
              type="text"
              value={client.registered_address?.town || ''}
              onChange={(e) => handleAddressFieldChange('town', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div data-reactid="field-registered-address-postcode">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Post Code
            </label>
            <input
              type="text"
              value={client.registered_address?.postcode || ''}
              onChange={(e) => handleAddressFieldChange('postcode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="SW1A 1AA"
            />
          </div>
        </div>
      </ClientFormSection>
    </div>
  )
} 