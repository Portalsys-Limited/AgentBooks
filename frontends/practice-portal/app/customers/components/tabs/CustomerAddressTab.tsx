'use client'

import React from 'react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import CustomerFormSection from '../CustomerFormSection'

interface CustomerFormData {
  address_line_1?: string
  address_line_2?: string
  town_city?: string
  county?: string
  country?: string
  postcode?: string
}

interface CustomerAddressTabProps {
  customer: CustomerFormData
  onFieldChange: (key: string, value: string | boolean | number) => void
}

export default function CustomerAddressTab({ customer, onFieldChange }: CustomerAddressTabProps) {
  return (
    <div className="max-w-4xl">
      {/* Personal Address Section */}
      <CustomerFormSection
        title="Personal Address"
        icon={MapPinIcon}
        isInitiallyExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2" data-reactid="field-address-line-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              value={customer.address_line_1 || ''}
              onChange={(e) => onFieldChange('address_line_1', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Street address, P.O. box, company name, c/o"
            />
          </div>
          
          <div className="md:col-span-2" data-reactid="field-address-line-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              value={customer.address_line_2 || ''}
              onChange={(e) => onFieldChange('address_line_2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Apartment, suite, unit, building, floor, etc."
            />
          </div>
          
          <div data-reactid="field-town-city">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Town / City
            </label>
            <input
              type="text"
              value={customer.town_city || ''}
              onChange={(e) => onFieldChange('town_city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div data-reactid="field-county">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              County
            </label>
            <input
              type="text"
              value={customer.county || ''}
              onChange={(e) => onFieldChange('county', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div data-reactid="field-postcode">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postcode
            </label>
            <input
              type="text"
              value={customer.postcode || ''}
              onChange={(e) => onFieldChange('postcode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="SW1A 1AA"
            />
          </div>
          
          <div data-reactid="field-country">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              value={customer.country || 'United Kingdom'}
              onChange={(e) => onFieldChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="United Kingdom">United Kingdom</option>
              <option value="Ireland">Ireland</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="New Zealand">New Zealand</option>
              <option value="France">France</option>
              <option value="Germany">Germany</option>
              <option value="Spain">Spain</option>
              <option value="Italy">Italy</option>
              <option value="Netherlands">Netherlands</option>
              <option value="Belgium">Belgium</option>
              <option value="Switzerland">Switzerland</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </CustomerFormSection>
    </div>
  )
} 