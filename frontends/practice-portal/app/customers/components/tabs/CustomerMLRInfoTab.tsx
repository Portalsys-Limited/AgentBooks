'use client'

import React from 'react'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import CustomerFormSection from '../CustomerFormSection'

interface CustomerFormData {
  mlr_status?: string
  mlr_date_completed?: string
  passport_number?: string
  driving_licence_number?: string
}

interface CustomerMLRInfoTabProps {
  customer: CustomerFormData
  onFieldChange: (key: string, value: string | boolean | number) => void
}

export default function CustomerMLRInfoTab({ customer, onFieldChange }: CustomerMLRInfoTabProps) {
  return (
    <div className="max-w-4xl">
      {/* Money Laundering Regulation (MLR) Information Section */}
      <CustomerFormSection
        title="Money Laundering (MLR) Information"
        icon={ShieldCheckIcon}
        isInitiallyExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div data-reactid="field-mlr-status">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MLR Status
            </label>
            <select
              value={customer.mlr_status || ''}
              onChange={(e) => onFieldChange('mlr_status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
              <option value="not_required">Not Required</option>
            </select>
          </div>
          
          <div data-reactid="field-mlr-date-completed">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MLR Date Completed
            </label>
            <input
              type="date"
              value={customer.mlr_date_completed || ''}
              onChange={(e) => onFieldChange('mlr_date_completed', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div data-reactid="field-passport-number">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passport Number
            </label>
            <input
              type="text"
              value={customer.passport_number || ''}
              onChange={(e) => onFieldChange('passport_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Passport number for identification"
            />
          </div>
          
          <div data-reactid="field-driving-licence-number">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Driving Licence Number
            </label>
            <input
              type="text"
              value={customer.driving_licence_number || ''}
              onChange={(e) => onFieldChange('driving_licence_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="UK driving licence number"
            />
          </div>
        </div>
      </CustomerFormSection>
    </div>
  )
} 