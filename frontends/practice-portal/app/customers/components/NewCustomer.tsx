'use client'

import React, { useState } from 'react'
import { PlusIcon, UserIcon, ArrowLeftIcon, IdentificationIcon, PhoneIcon, MapPinIcon, BanknotesIcon, ShieldCheckIcon, CurrencyPoundIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import AppLayout from '../../../components/layout/AppLayout'
import { useAuth } from '../../../hooks/useAuth'

// Import tab components (we'll create these)
import CustomerCoreInfoTab from './tabs/CustomerCoreInfoTab'
import CustomerBasicInfoTab from './tabs/CustomerBasicInfoTab'
import CustomerContactInfoTab from './tabs/CustomerContactInfoTab'
import CustomerAddressTab from './tabs/CustomerAddressTab'
import CustomerMLRInfoTab from './tabs/CustomerMLRInfoTab'
import CustomerIncomeInfoTab from './tabs/CustomerIncomeInfoTab'
import CustomerPracticeInfoTab from './tabs/CustomerPracticeInfoTab'

interface CustomerFormData {
  // Core Info
  customer_id?: string
  client_code?: string
  status?: string
  setup_date?: string
  last_edited_date?: string
  last_edited_by?: string
  comments?: string
  notes?: string
  
  // Relationship Info
  relationship_type?: string
  self_assessment_own?: boolean
  self_assessment_client_relation?: string
  
  // Basic Info
  first_name?: string
  title?: string
  middle_name?: string
  last_name?: string
  name?: string
  date_of_birth?: string
  deceased_date?: string
  marital_status?: string
  gender?: string
  nationality?: string
  national_insurance_number?: string
  personal_utr_number?: string
  
  // Contact Info
  email?: string
  secondary_email?: string
  primary_mobile_number?: string
  secondary_mobile_number?: string
  uk_home_telephone_number?: string
  
  // Personal Address
  address_line_1?: string
  address_line_2?: string
  town_city?: string
  county?: string
  country?: string
  postcode?: string
  
  // Practice Info
  primary_accounting_contact?: string
  acting_from_date?: string
  
  // MLR Info
  mlr_status?: string
  mlr_date_completed?: string
  passport_number?: string
  driving_licence_number?: string
  
  // Income Info
  rental_property?: boolean
  income_relation?: string
  self_employment_income_relation?: string
  employment_income_relation?: string
  rental_income?: number
  dividend_income?: number
  pension_income?: number
  foreign_income?: number
  state_benefit_income?: number
  child_benefit?: number
  tax_universal_credits?: number
  capital_gains_income?: number
}

interface NewCustomerProps {
  onCancel?: () => void
}

export default function NewCustomer({ onCancel }: NewCustomerProps) {
  const { user } = useAuth()
  const router = useRouter()
  
  const [customer, setCustomer] = useState<CustomerFormData>({
    status: 'active',
    setup_date: new Date().toISOString().split('T')[0],
    country: 'United Kingdom',
    relationship_type: 'individual',
    self_assessment_own: false,
    rental_property: false
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('core-info')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const tabs = [
    { id: 'core-info', name: 'Core Info', icon: IdentificationIcon },
    { id: 'basic-info', name: 'Basic Info', icon: UserIcon },
    { id: 'contact-info', name: 'Contact Info', icon: PhoneIcon },
    { id: 'address', name: 'Address', icon: MapPinIcon },
    { id: 'practice-info', name: 'Practice Info', icon: DocumentTextIcon },
    { id: 'mlr-info', name: 'MLR Info', icon: ShieldCheckIcon },
    { id: 'income-info', name: 'Income Info', icon: CurrencyPoundIcon }
  ]

  const handleFieldChange = (key: string, value: string | boolean | number) => {
    setCustomer(prev => ({
      ...prev,
      [key]: value
    }))
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    if (!customer.first_name || !customer.last_name) {
      setError('First name and last name are required')
      return
    }
    
    setIsSaving(true)
    setError(null)
    
    try {
      // Generate full name
      const fullName = `${customer.first_name} ${customer.last_name}`.trim()
      const customerData = {
        ...customer,
        name: fullName,
        last_edited_date: new Date().toISOString(),
        last_edited_by: user?.email || user?.name
      }
      
      // TODO: Implement customer creation API call
      console.log('Creating customer:', customerData)
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Navigate to customer detail or search page
      router.push('/search_client_customer')
      
    } catch (err) {
      console.error('Error creating customer:', err)
      setError(err instanceof Error ? err.message : 'Failed to create customer')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        if (onCancel) {
          onCancel()
        } else {
          router.push('/search_client_customer')
        }
      }
    } else {
      if (onCancel) {
        onCancel()
      } else {
        router.push('/search_client_customer')
      }
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'core-info':
        return (
          <CustomerCoreInfoTab 
            customer={customer} 
            onFieldChange={handleFieldChange}
          />
        )
      case 'basic-info':
        return (
          <CustomerBasicInfoTab 
            customer={customer} 
            onFieldChange={handleFieldChange}
          />
        )
      case 'contact-info':
        return (
          <CustomerContactInfoTab 
            customer={customer} 
            onFieldChange={handleFieldChange}
          />
        )
      case 'address':
        return (
          <CustomerAddressTab 
            customer={customer} 
            onFieldChange={handleFieldChange}
          />
        )
      case 'practice-info':
        return (
          <CustomerPracticeInfoTab 
            customer={customer} 
            onFieldChange={handleFieldChange}
          />
        )
      case 'mlr-info':
        return (
          <CustomerMLRInfoTab 
            customer={customer} 
            onFieldChange={handleFieldChange}
          />
        )
      case 'income-info':
        return (
          <CustomerIncomeInfoTab 
            customer={customer} 
            onFieldChange={handleFieldChange}
          />
        )
      default:
        return null
    }
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">New Customer</h1>
                <p className="text-lg text-gray-500">Create a new customer profile</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Creating...' : 'Create Customer'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                    data-reactid={`tab-${tab.id}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
