'use client'

import React from 'react'
import { UserIcon, IdentificationIcon } from '@heroicons/react/24/outline'
import CustomerFormSection from '../CustomerFormSection'

interface CustomerFormData {
  first_name?: string
  title?: string
  middle_name?: string
  last_name?: string
  date_of_birth?: string
  deceased_date?: string
  marital_status?: string
  gender?: string
  nationality?: string
  national_insurance_number?: string
  personal_utr_number?: string
}

interface CustomerBasicInfoTabProps {
  customer: CustomerFormData
  onFieldChange: (key: string, value: string | boolean | number) => void
}

export default function CustomerBasicInfoTab({ customer, onFieldChange }: CustomerBasicInfoTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-4">
        {/* Basic Personal Info Section */}
        <CustomerFormSection
          title="Basic Personal Info"
          icon={UserIcon}
          isInitiallyExpanded={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div data-reactid="field-title">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <select
                value={customer.title || ''}
                onChange={(e) => onFieldChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Title</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Miss">Miss</option>
                <option value="Ms">Ms</option>
                <option value="Dr">Dr</option>
                <option value="Prof">Prof</option>
                <option value="Rev">Rev</option>
                <option value="Sir">Sir</option>
                <option value="Dame">Dame</option>
                <option value="Lord">Lord</option>
                <option value="Lady">Lady</option>
              </select>
            </div>
            
            <div data-reactid="field-first-name">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={customer.first_name || ''}
                onChange={(e) => onFieldChange('first_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div data-reactid="field-middle-name">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name
              </label>
              <input
                type="text"
                value={customer.middle_name || ''}
                onChange={(e) => onFieldChange('middle_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div data-reactid="field-last-name">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={customer.last_name || ''}
                onChange={(e) => onFieldChange('last_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div data-reactid="field-date-of-birth">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={customer.date_of_birth || ''}
                onChange={(e) => onFieldChange('date_of_birth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div data-reactid="field-deceased-date">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deceased Date
              </label>
              <input
                type="date"
                value={customer.deceased_date || ''}
                onChange={(e) => onFieldChange('deceased_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </CustomerFormSection>
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        {/* Additional Personal Details Section */}
        <CustomerFormSection
          title="Additional Personal Details"
          icon={IdentificationIcon}
          isInitiallyExpanded={true}
        >
          <div className="space-y-4">
            <div data-reactid="field-marital-status">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status
              </label>
              <select
                value={customer.marital_status || ''}
                onChange={(e) => onFieldChange('marital_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
                <option value="separated">Separated</option>
                <option value="civil_partnership">Civil Partnership</option>
              </select>
            </div>
            
            <div data-reactid="field-gender">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={customer.gender || ''}
                onChange={(e) => onFieldChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            
            <div data-reactid="field-nationality">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationality
              </label>
              <input
                type="text"
                value={customer.nationality || ''}
                onChange={(e) => onFieldChange('nationality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., British, American, etc."
              />
            </div>
            
            <div data-reactid="field-national-insurance-number">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                National Insurance Number (NI Number)
              </label>
              <input
                type="text"
                value={customer.national_insurance_number || ''}
                onChange={(e) => onFieldChange('national_insurance_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="AB 12 34 56 C"
              />
            </div>
            
            <div data-reactid="field-personal-utr-number">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal UTR Number
              </label>
              <input
                type="text"
                value={customer.personal_utr_number || ''}
                onChange={(e) => onFieldChange('personal_utr_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="10 digit UTR number"
              />
            </div>
          </div>
        </CustomerFormSection>
      </div>
    </div>
  )
} 