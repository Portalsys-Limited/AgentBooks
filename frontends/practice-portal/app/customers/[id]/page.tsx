'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '../../../components/layout/AppLayout'
import { useAuth } from '../../../hooks/useAuth'
import { 
  UserIcon, 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  PencilIcon,
  ArrowLeftIcon,
  IdentificationIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  CurrencyPoundIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

// Import customer detail tab components
import CustomerDetailCoreInfoTab from './components/tabs/CustomerDetailCoreInfoTab'
import CustomerDetailBasicInfoTab from './components/tabs/CustomerDetailBasicInfoTab'
import CustomerDetailContactInfoTab from './components/tabs/CustomerDetailContactInfoTab'
import CustomerDetailAddressTab from './components/tabs/CustomerDetailAddressTab'
import CustomerDetailPracticeInfoTab from './components/tabs/CustomerDetailPracticeInfoTab'
import CustomerDetailMLRInfoTab from './components/tabs/CustomerDetailMLRInfoTab'
import CustomerDetailIncomeInfoTab from './components/tabs/CustomerDetailIncomeInfoTab'
import CustomerLinkedClientsTab from './components/tabs/CustomerLinkedClientsTab'

interface CustomerDetail {
  id: string
  name: string
  first_name?: string
  last_name?: string
  title?: string
  middle_name?: string
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
  
  // Address
  address_line_1?: string
  address_line_2?: string
  town_city?: string
  county?: string
  postcode?: string
  country?: string
  
  // Core Info
  customer_id?: string
  client_code?: string
  status?: string
  setup_date?: string
  last_edited_date?: string
  last_edited_by?: string
  comments?: string
  notes?: string
  relationship_type?: string
  self_assessment_own?: boolean
  self_assessment_client_relation?: string
  
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
  
  // Linked clients
  linked_clients?: Array<{
    id: string
    name: string
    business_type?: string
    status?: string
    created_at?: string
  }>
  
  created_at?: string
  updated_at?: string
}

export default function CustomerDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string
  
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('core-info')
  const [isEditing, setIsEditing] = useState(false)

  const tabs = [
    { id: 'core-info', name: 'Core Info', icon: IdentificationIcon },
    { id: 'basic-info', name: 'Basic Info', icon: UserIcon },
    { id: 'contact-info', name: 'Contact Info', icon: PhoneIcon },
    { id: 'address', name: 'Address', icon: MapPinIcon },
    { id: 'practice-info', name: 'Practice Info', icon: DocumentTextIcon },
    { id: 'mlr-info', name: 'MLR Info', icon: ShieldCheckIcon },
    { id: 'income-info', name: 'Income Info', icon: CurrencyPoundIcon },
    { id: 'linked-clients', name: 'Linked Clients', icon: BuildingOfficeIcon }
  ]

  useEffect(() => {
    if (customerId) {
      fetchCustomer()
    }
  }, [customerId])

  const fetchCustomer = async () => {
    try {
      // ✅ Use new service function
      const { getCustomer } = await import('../../../lib/customers')
      const data = await getCustomer(customerId)
      setCustomer(data)
    } catch (err) {
      console.error('Error fetching customer:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch customer')
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (key: string, value: string | boolean | number) => {
    if (customer) {
      setCustomer(prev => ({
        ...prev!,
        [key]: value,
        last_edited_date: new Date().toISOString(),
        last_edited_by: user?.email || user?.name
      }))
    }
  }

  const handleSave = async () => {
    // TODO: Implement customer update API call
    console.log('Saving customer:', customer)
    setIsEditing(false)
  }

  const renderTabContent = () => {
    if (!customer) return null

    switch (activeTab) {
      case 'core-info':
        return (
          <CustomerDetailCoreInfoTab 
            customer={customer} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'basic-info':
        return (
          <CustomerDetailBasicInfoTab 
            customer={customer} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'contact-info':
        return (
          <CustomerDetailContactInfoTab 
            customer={customer} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'address':
        return (
          <CustomerDetailAddressTab 
            customer={customer} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'practice-info':
        return (
          <CustomerDetailPracticeInfoTab 
            customer={customer} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'mlr-info':
        return (
          <CustomerDetailMLRInfoTab 
            customer={customer} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'income-info':
        return (
          <CustomerDetailIncomeInfoTab 
            customer={customer} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'linked-clients':
        return (
          <CustomerLinkedClientsTab 
            customer={customer} 
            onRefresh={fetchCustomer}
          />
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    )
  }

  if (error || !customer) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Customer</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error || 'Customer not found'}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/search_client_customer')}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Back to Customers & Clients
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
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
                <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                {customer.first_name && customer.last_name && (
                  <p className="text-lg text-gray-500">{customer.first_name} {customer.last_name}</p>
                )}
                <p className="text-sm text-gray-400">Customer ID: {customer.id}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Customer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
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