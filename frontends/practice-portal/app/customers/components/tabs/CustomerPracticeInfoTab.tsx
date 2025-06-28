'use client'

import React from 'react'
import { DocumentTextIcon, CalendarIcon } from '@heroicons/react/24/outline'
import CustomerFormSection from '../CustomerFormSection'

interface CustomerFormData {
  primary_accounting_contact?: string
  acting_from_date?: string
}

interface CustomerPracticeInfoTabProps {
  customer: CustomerFormData
  onFieldChange: (key: string, value: string | boolean | number) => void
}

export default function CustomerPracticeInfoTab({ customer, onFieldChange }: CustomerPracticeInfoTabProps) {
  return (
    <div className="max-w-4xl">
      {/* Practice Information Section */}
      <CustomerFormSection
        title="Practice Information"
        icon={DocumentTextIcon}
        isInitiallyExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div data-reactid="field-primary-accounting-contact">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Accounting Contact
            </label>
            <input
              type="text"
              value={customer.primary_accounting_contact || ''}
              onChange={(e) => onFieldChange('primary_accounting_contact', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Name of primary contact"
            />
          </div>
          
          <div data-reactid="field-acting-from-date">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acting From Date
            </label>
            <input
              type="date"
              value={customer.acting_from_date || ''}
              onChange={(e) => onFieldChange('acting_from_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </CustomerFormSection>
    </div>
  )
} 