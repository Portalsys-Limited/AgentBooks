'use client'

import React from 'react'
import { PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import CustomerFormSection from '../CustomerFormSection'

interface CustomerFormData {
  email?: string
  secondary_email?: string
  primary_mobile_number?: string
  secondary_mobile_number?: string
  uk_home_telephone_number?: string
}

interface CustomerContactInfoTabProps {
  customer: CustomerFormData
  onFieldChange: (key: string, value: string | boolean | number) => void
}

export default function CustomerContactInfoTab({ customer, onFieldChange }: CustomerContactInfoTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-4">
        {/* Email Information Section */}
        <CustomerFormSection
          title="Email Information"
          icon={EnvelopeIcon}
          isInitiallyExpanded={true}
        >
          <div className="space-y-4">
            <div data-reactid="field-email">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Email
              </label>
              <input
                type="email"
                value={customer.email || ''}
                onChange={(e) => onFieldChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="customer@example.com"
              />
            </div>
            
            <div data-reactid="field-secondary-email">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Email
              </label>
              <input
                type="email"
                value={customer.secondary_email || ''}
                onChange={(e) => onFieldChange('secondary_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="alternative@example.com"
              />
            </div>
          </div>
        </CustomerFormSection>
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        {/* Phone Information Section */}
        <CustomerFormSection
          title="Phone Information"
          icon={PhoneIcon}
          isInitiallyExpanded={true}
        >
          <div className="space-y-4">
            <div data-reactid="field-primary-mobile-number">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Mobile Number
              </label>
              <input
                type="tel"
                value={customer.primary_mobile_number || ''}
                onChange={(e) => onFieldChange('primary_mobile_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+44 7XXX XXXXXX"
              />
            </div>
            
            <div data-reactid="field-secondary-mobile-number">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Mobile Number
              </label>
              <input
                type="tel"
                value={customer.secondary_mobile_number || ''}
                onChange={(e) => onFieldChange('secondary_mobile_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+44 7XXX XXXXXX"
              />
            </div>
            
            <div data-reactid="field-uk-home-telephone-number">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UK Home Telephone Number
              </label>
              <input
                type="tel"
                value={customer.uk_home_telephone_number || ''}
                onChange={(e) => onFieldChange('uk_home_telephone_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+44 1XXX XXXXXX"
              />
            </div>
          </div>
        </CustomerFormSection>
      </div>
    </div>
  )
} 