'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '../../../components/layout/AppLayout'
import { 
  IdentificationIcon, 
  DocumentTextIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  CurrencyPoundIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  CheckIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

// Import client form tab components
import ClientBasicInfoTab from './tabs/ClientBasicInfoTab'
import ClientCompanyDataTab from './tabs/ClientCompanyDataTab'
import ClientBusinessAddressTab from './tabs/ClientBusinessAddressTab'
import ClientTradingAddressTab from './tabs/ClientTradingAddressTab'
import ClientMLRTab from './tabs/ClientMLRTab'
import ClientServicesTab from './tabs/ClientServicesTab'
import ClientAccountingSoftwareTab from './tabs/ClientAccountingSoftwareTab'
import ClientBillingTab from './tabs/ClientBillingTab'
import ClientPracticeInfoTab from './tabs/ClientPracticeInfoTab'
import ClientEngagementLetterTab from './tabs/ClientEngagementLetterTab'
import ClientCompanyDetailsTab from './tabs/ClientCompanyDetailsTab'
import ClientEmailsTab from './tabs/ClientEmailsTab'

interface ClientFormData {
  // Basic Info
  client_code?: string
  business_name: string
  business_type?: string
  nature_of_business?: string
  
  // Company Data
  companies_house_number?: string
  date_of_incorporation?: string
  companies_house_auth_code?: string
  is_currently_dormant?: boolean
  registered_at_practice_address?: boolean
  registered_address_different_from_trading?: boolean
  
  // Business Address
  registered_address?: {
    line_1?: string
    line_2?: string
    town?: string
    county?: string
    country?: string
    postcode?: string
  }
  
  // Trading Address
  trading_address?: {
    line_1?: string
    line_2?: string
    town?: string
    county?: string
    country?: string
    postcode?: string
  }
  
  // MLR
  mlr_status?: string
  
  // Services
  services?: Array<{
    id: string
    name: string
    category: string
    enabled: boolean
  }>
  
  // Accounting Software
  accounting_software?: string[]
  
  // Billing
  billing_frequency?: string
  payment_method?: string
  max_credit_allowance?: number
  debt_credit_amount?: number
  
  // Practice Info
  client_manager?: string
  outsource_manager?: string
  payroll_manager?: string
  client_source?: string
  client_primary_contact?: string
  
  // Engagement Letter
  engagement_letter_status?: string
  engagement_letter_last_review_date?: string
  
  // Company Details
  website?: string
  instagram?: string
  facebook?: string
  
  // Emails
  emails?: Array<{
    id: string
    email: string
    type: string
    is_primary: boolean
  }>
  
  // Other
  setup_date?: string
  notes?: string
}

export default function NewClient() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('basic-info')
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<ClientFormData>({
    business_name: '',
    setup_date: new Date().toISOString().split('T')[0],
    registered_address: {
      country: 'United Kingdom'
    },
    trading_address: {
      country: 'United Kingdom'
    },
    is_currently_dormant: false,
    registered_at_practice_address: false,
    registered_address_different_from_trading: false,
    accounting_software: [],
    services: [],
    emails: []
  })

  const tabs = [
    { id: 'basic-info', name: 'Basic Info', icon: IdentificationIcon },
    { id: 'company-data', name: 'Company Data', icon: DocumentTextIcon },
    { id: 'business-address', name: 'Business Address', icon: MapPinIcon },
    { id: 'trading-address', name: 'Trading Address', icon: MapPinIcon },
    { id: 'mlr', name: 'MLR', icon: ShieldCheckIcon },
    { id: 'services', name: 'Services', icon: ChartBarIcon },
    { id: 'accounting-software', name: 'Accounting Software', icon: ComputerDesktopIcon },
    { id: 'billing', name: 'Billing', icon: CurrencyPoundIcon },
    { id: 'practice-info', name: 'Practice Info', icon: UsersIcon },
    { id: 'engagement-letter', name: 'Engagement Letter', icon: ClipboardDocumentListIcon },
    { id: 'company-details', name: 'Company Details', icon: GlobeAltIcon },
    { id: 'emails', name: 'Emails', icon: EnvelopeIcon }
  ]

  const handleFieldChange = (key: string, value: string | boolean | number | string[] | any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    if (!formData.business_name.trim()) {
      alert('Please enter a business name')
      return
    }

    setIsSaving(true)
    try {
      // ✅ Use new service function
      const { createClient } = await import('../../../lib/clients')
      const newClient = await createClient(formData)
      
      // Redirect to the new client's detail page
      router.push(`/clients/${newClient.id}`)
    } catch (error) {
      console.error('Error creating client:', error)
      alert('Failed to create client. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic-info':
        return (
          <ClientBasicInfoTab 
            client={formData} 
            onFieldChange={handleFieldChange}
          />
        )
      case 'company-data':
        return (
          <ClientCompanyDataTab 
            client={formData} 
            onFieldChange={handleFieldChange}
          />
        )
      case 'business-address':
        return (
          <ClientBusinessAddressTab 
            client={formData} 
            onFieldChange={handleFieldChange}
          />
        )
      case 'trading-address':
        return (
          <ClientTradingAddressTab 
            client={formData} 
            onFieldChange={handleFieldChange}
          />
        )
      case 'mlr':
        return (
          <ClientMLRTab 
            client={formData} 
            onFieldChange={handleFieldChange}
          />
        )
      case 'services':
        return (
          <ClientServicesTab 
            client={formData} 
            onFieldChange={handleFieldChange}
          />
        )
      case 'accounting-software':
        return (
          <ClientAccountingSoftwareTab 
            client={formData} 
            onFieldChange={handleFieldChange}
          />
        )
      case 'billing':
        return (
          <ClientBillingTab 
            client={formData} 
            onFieldChange={handleFieldChange}
          />
        )
      case 'practice-info':
        return (
          <ClientPracticeInfoTab 
            client={formData} 
            onFieldChange={handleFieldChange}
          />
        )
      case 'engagement-letter':
        return (
          <ClientEngagementLetterTab 
            client={formData} 
            onFieldChange={handleFieldChange}
          />
        )
      case 'company-details':
        return (
          <ClientCompanyDetailsTab 
            client={formData} 
            onFieldChange={handleFieldChange}
          />
        )
      case 'emails':
        return (
          <ClientEmailsTab 
            client={formData} 
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
              onClick={() => router.back()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <BuildingOfficeIcon className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Client</h1>
                <p className="text-lg text-gray-500">Add a new client company to your practice</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !formData.business_name?.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                data-reactid="save-client-button"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Create Client
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto" aria-label="Tabs">
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
                    data-reactid={`new-client-tab-${tab.id}`}
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
