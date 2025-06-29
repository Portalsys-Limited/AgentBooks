'use client'

import React, { useState, ReactNode } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { 
  UserIcon,
  IdentificationIcon,
  BanknotesIcon,
  HomeIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { CustomerInfoTabResponse } from '../../../../lib/customers/types'

interface CustomerDetailSectionProps {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: ReactNode
  isInitiallyExpanded?: boolean
}

interface CustomerInformationDisplayProps {
  customer: CustomerInfoTabResponse
  editedCustomer: CustomerInfoTabResponse
  isEditing: boolean
  onFieldChange: (path: string, value: any) => void
}

// Helper function to format dates
const formatDate = (dateString?: string) => {
  if (!dateString) return 'Not specified'
  return new Date(dateString).toLocaleDateString('en-GB')
}

// Helper function to format currency
const formatCurrency = (amount?: number) => {
  if (!amount) return 'Not specified'
  return new Intl.NumberFormat('en-GB', { 
    style: 'currency', 
    currency: 'GBP' 
  }).format(amount)
}

// Helper function to capitalize strings
const capitalize = (str?: string) => {
  if (!str) return 'Not specified'
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}

// Helper for empty values (use dash)
const displayValue = (value?: string | number) => {
  if (value === undefined || value === null || value === '') return <span className="text-gray-300">&mdash;</span>
  return value
}

// Improved EditableField
const EditableField = ({ 
  label, 
  value, 
  onChange, 
  type = 'text',
  isEditing 
}: { 
  label: string
  value: string | number | undefined
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'tel' | 'number' | 'date'
  isEditing: boolean
}) => {
  if (isEditing) {
    return (
      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-700 tracking-wide mb-0.5">
          {label}
        </label>
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="mt-0.5 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:text-sm transition-all bg-white hover:border-blue-400"
        />
      </div>
    )
  }
  // View mode: label and value
  return (
    <div className="space-y-0.5">
      <div className="block text-xs text-gray-500 font-medium mb-0.5">{label}</div>
      <div className="text-base font-medium text-gray-900 truncate" title={value ? String(value) : ''}>
        {displayValue(value)}
      </div>
    </div>
  )
}

// Address search component
const AddressSearch = ({ 
  onAddressSelect,
  isEditing 
}: { 
  onAddressSelect: (address: any) => void
  isEditing: boolean
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      // TODO: Implement address search API call
      // const results = await searchAddress(searchQuery)
      // Handle results
    } catch (error) {
      console.error('Error searching address:', error)
    } finally {
      setIsSearching(false)
    }
  }

  if (!isEditing) return null

  return (
    <div className="mb-4">
      <div className="flex space-x-2">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for an address..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>
    </div>
  )
}

// Main collapsible section component
export default function CustomerDetailSection({
  title,
  icon: Icon,
  children,
  isInitiallyExpanded = false
}: CustomerDetailSectionProps) {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl mb-6 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-8 py-4 flex items-center justify-between text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 group"
        data-reactid={`detail-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center space-x-3">
          <Icon className="h-6 w-6 text-blue-600 group-hover:text-blue-700 transition" />
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-8 pb-8 border-t border-gray-100 bg-white">
          <div className="mt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

// Customer Information Display Component
export function CustomerInformationDisplay({
  customer,
  editedCustomer,
  isEditing,
  onFieldChange
}: CustomerInformationDisplayProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Personal Information Section */}
        <CustomerDetailSection
          title="Personal Information"
          icon={UserIcon}
          isInitiallyExpanded={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Basic Details - Left Column (1/3 width) */}
            <div className="md:col-span-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Basic details</h4>
              <div className="space-y-2">
                <EditableField
                  label="First Name"
                  value={editedCustomer.individual.first_name}
                  onChange={(value) => onFieldChange('individual.first_name', value)}
                  isEditing={isEditing}
                />
                <EditableField
                  label="Last Name"
                  value={editedCustomer.individual.last_name}
                  onChange={(value) => onFieldChange('individual.last_name', value)}
                  isEditing={isEditing}
                />
                <EditableField
                  label="Title"
                  value={editedCustomer.individual.title}
                  onChange={(value) => onFieldChange('individual.title', value)}
                  isEditing={isEditing}
                />
                <EditableField
                  label="Gender"
                  value={editedCustomer.individual.gender}
                  onChange={(value) => onFieldChange('individual.gender', value)}
                  isEditing={isEditing}
                />
                <EditableField
                  label="Marital Status"
                  value={editedCustomer.individual.marital_status}
                  onChange={(value) => onFieldChange('individual.marital_status', value)}
                  isEditing={isEditing}
                />
                <EditableField
                  label="Nationality"
                  value={editedCustomer.individual.nationality}
                  onChange={(value) => onFieldChange('individual.nationality', value)}
                  isEditing={isEditing}
                />
                <EditableField
                  label="Date of Birth"
                  value={editedCustomer.individual.date_of_birth}
                  onChange={(value) => onFieldChange('individual.date_of_birth', value)}
                  type="date"
                  isEditing={isEditing}
                />
              </div>
            </div>

            {/* Right Section (2/3 width) */}
            <div className="md:col-span-8 space-y-6">
              {/* Address Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Address</h4>
                <AddressSearch 
                  onAddressSelect={(address) => {
                    // TODO: Handle address selection
                    console.log('Selected address:', address)
                  }}
                  isEditing={isEditing}
                />
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Address Column */}
                  <div className="space-y-2">
                    <EditableField
                      label="Address Line 1"
                      value={editedCustomer.individual.address_line_1}
                      onChange={(value) => onFieldChange('individual.address_line_1', value)}
                      isEditing={isEditing}
                    />
                    <EditableField
                      label="Address Line 2"
                      value={editedCustomer.individual.address_line_2}
                      onChange={(value) => onFieldChange('individual.address_line_2', value)}
                      isEditing={isEditing}
                    />
                    <EditableField
                      label="Town"
                      value={editedCustomer.individual.town}
                      onChange={(value) => onFieldChange('individual.town', value)}
                      isEditing={isEditing}
                    />
                  </div>
                  {/* Right Address Column */}
                  <div className="space-y-2">
                    <EditableField
                      label="County"
                      value={editedCustomer.individual.county}
                      onChange={(value) => onFieldChange('individual.county', value)}
                      isEditing={isEditing}
                    />
                    <EditableField
                      label="Post Code"
                      value={editedCustomer.individual.post_code}
                      onChange={(value) => onFieldChange('individual.post_code', value)}
                      isEditing={isEditing}
                    />
                    <EditableField
                      label="Country"
                      value={editedCustomer.individual.country}
                      onChange={(value) => onFieldChange('individual.country', value)}
                      isEditing={isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Contact Information</h4>
                <div className="space-y-4">
                  {/* Primary Contact Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <EditableField
                      label="Primary Email"
                      value={editedCustomer.individual.email}
                      onChange={(value) => onFieldChange('individual.email', value)}
                      type="email"
                      isEditing={isEditing}
                    />
                    <EditableField
                      label="Primary Mobile"
                      value={editedCustomer.individual.primary_mobile}
                      onChange={(value) => onFieldChange('individual.primary_mobile', value)}
                      type="tel"
                      isEditing={isEditing}
                    />
                  </div>
                  {/* Secondary Contact Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <EditableField
                      label="Secondary Email"
                      value={editedCustomer.individual.secondary_email}
                      onChange={(value) => onFieldChange('individual.secondary_email', value)}
                      type="email"
                      isEditing={isEditing}
                    />
                    <EditableField
                      label="Secondary Mobile"
                      value={editedCustomer.individual.secondary_mobile}
                      onChange={(value) => onFieldChange('individual.secondary_mobile', value)}
                      type="tel"
                      isEditing={isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CustomerDetailSection>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Accounting Information Section */}
        <CustomerDetailSection
          title="Accounting Information"
          icon={IdentificationIcon}
          isInitiallyExpanded={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Tax Information</h4>
              <div className="space-y-3">
                <EditableField
                  label="NI Number"
                  value={editedCustomer.ni_number}
                  onChange={(value) => onFieldChange('ni_number', value)}
                  isEditing={isEditing}
                />
                <EditableField
                  label="UTR Number"
                  value={editedCustomer.personal_utr_number}
                  onChange={(value) => onFieldChange('personal_utr_number', value)}
                  isEditing={isEditing}
                />
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Self Assessment Required</label>
                  <p className="mt-1 text-sm text-gray-900">{editedCustomer.do_they_own_sa ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Compliance Status</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">MLR Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    editedCustomer.mlr_status === 'complete' 
                      ? 'bg-green-100 text-green-800' 
                      : editedCustomer.mlr_status === 'in_progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {capitalize(editedCustomer.mlr_status)}
                  </span>
                </div>
                {/* Add more compliance-related fields here */}
              </div>
            </div>
          </div>
        </CustomerDetailSection>

        {/* Income Information Section */}
        <CustomerDetailSection
          title="Income Information"
          icon={BanknotesIcon}
          isInitiallyExpanded={false}
        >
          {editedCustomer.individual.incomes && editedCustomer.individual.incomes.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {editedCustomer.individual.incomes.map((income) => (
                  <div key={income.id} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900">{capitalize(income.income_type)}</h5>
                      <span className="text-lg font-semibold text-green-600">
                        {formatCurrency(income.income_amount)}
                      </span>
                    </div>
                    {income.description && (
                      <p className="text-sm text-gray-600">{income.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Added: {formatDate(income.created_at)}
                    </p>
                  </div>
                ))}
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                + Add Income Source
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <BanknotesIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No income information available</p>
              <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                + Add Income Source
              </button>
            </div>
          )}
        </CustomerDetailSection>

        {/* Property Information Section */}
        <CustomerDetailSection
          title="Property Information"
          icon={HomeIcon}
          isInitiallyExpanded={false}
        >
          {editedCustomer.individual.property_relationships && editedCustomer.individual.property_relationships.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {editedCustomer.individual.property_relationships.map((relationship) => (
                  <div key={relationship.id} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">{relationship.property.property_name}</h5>
                        <p className="text-sm text-gray-600">{capitalize(relationship.property.property_type)}</p>
                        <p className="text-xs text-blue-600 font-medium">
                          {capitalize(relationship.ownership_type)} - {relationship.ownership_percentage}%
                          {relationship.is_primary_owner && ' (Primary Owner)'}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        relationship.property.property_status === 'owned' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {capitalize(relationship.property.property_status)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{relationship.property.full_address || `${relationship.property.address_line_1}, ${relationship.property.town}, ${relationship.property.post_code}`}</p>
                      {relationship.property.current_value && (
                        <p>Current Value: {formatCurrency(relationship.property.current_value)}</p>
                      )}
                      {relationship.property.monthly_rental_income && (
                        <p>Monthly Rental: {formatCurrency(relationship.property.monthly_rental_income)}</p>
                      )}
                      {relationship.description && (
                        <p className="text-xs text-gray-500 italic">{relationship.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                + Add Property
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <HomeIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No property information available</p>
              <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                + Add Property
              </button>
            </div>
          )}
        </CustomerDetailSection>

        {/* Additional Information Section */}
        <CustomerDetailSection
          title="Additional Information"
          icon={DocumentTextIcon}
          isInitiallyExpanded={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Notes & Comments</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Comments</label>
                  <p className="mt-1 text-sm text-gray-900">{editedCustomer.comments || 'No comments'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
                  <p className="mt-1 text-sm text-gray-900">{editedCustomer.notes || 'No notes'}</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Edit History</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Edited</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(editedCustomer.last_edited)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Edited By</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {editedCustomer.last_edited_by?.full_name || 'System'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CustomerDetailSection>
      </div>
    </div>
  )
} 