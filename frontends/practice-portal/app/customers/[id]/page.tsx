'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '../../../components/layout/AppLayout'
import SecondaryTopNavBar, { CUSTOMER_TABS } from '../../../components/navigation/SecondaryTopNavBar'
import { CustomerInformationDisplay } from './components/CustomerDetailSection'
import CustomerDocumentsTab from './components/CustomerDocumentsTab'
import CustomerRelationshipsTab from './components/CustomerRelationshipsTab'
import CustomerTasksTab from './components/CustomerTasksTab'
import CustomerMLRTab from './components/CustomerMLRTab'
import { useAuth } from '../../../hooks/useAuth'
import { 
  ArrowLeftIcon,
  PencilIcon,
  EnvelopeIcon,
  IdentificationIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

// Import customer service
import { getCustomerInfo, updateCustomer } from '../../../lib/customers/service'
import { CustomerInfoTabResponse } from '../../../lib/customers/types'

// Helper function to capitalize strings
const capitalize = (str?: string) => {
  if (!str) return 'Not specified'
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}

export default function CustomerDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string
  
  const [customer, setCustomer] = useState<CustomerInfoTabResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('information')
  const [isEditing, setIsEditing] = useState(false)
  const [editedCustomer, setEditedCustomer] = useState<CustomerInfoTabResponse | null>(null)

  useEffect(() => {
    if (customerId) {
      fetchCustomer()
    }
  }, [customerId])

  useEffect(() => {
    if (customer) {
      setEditedCustomer(JSON.parse(JSON.stringify(customer))) // Deep copy
    }
  }, [customer])

  const fetchCustomer = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCustomerInfo(customerId)
      setCustomer(data)
    } catch (err) {
      console.error('Error fetching customer:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch customer')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (!editedCustomer) return
      // Prepare the update payload (remove fields not needed by backend if necessary)
      const updatePayload = {
        ...editedCustomer,
        individual: undefined, // Remove nested objects if backend expects flat structure
      }
      await updateCustomer(customerId, updatePayload)
      // Re-fetch the customer info to ensure we have the correct type and latest data
      await fetchCustomer()
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving changes:', error)
    }
  }

  const handleCancel = () => {
    setEditedCustomer(customer) // Reset to original
    setIsEditing(false)
  }

  const handleFieldChange = (path: string, value: any) => {
    if (!editedCustomer) return

    const pathArray = path.split('.')
    let current: any = { ...editedCustomer }
    
    // Navigate to the nested property
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]]
    }
    
    // Update the value
    current[pathArray[pathArray.length - 1]] = value
    setEditedCustomer({ ...editedCustomer })
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  const renderTabContent = () => {
    if (!customer || !editedCustomer) return null

    switch (activeTab) {
      case 'information':
        return (
          <CustomerInformationDisplay
            customer={customer}
            editedCustomer={editedCustomer}
            isEditing={isEditing}
            onFieldChange={handleFieldChange}
          />
        )
      case 'tasks':
        return <CustomerTasksTab customerId={customerId} />
      case 'documents':
        return <CustomerDocumentsTab customerId={customerId} />
      case 'mlr':
        return <CustomerMLRTab customerId={customerId} />
      case 'relationships':
        return <CustomerRelationshipsTab customerId={customerId} />
      default:
        return (
          <CustomerInformationDisplay
            customer={customer}
            editedCustomer={editedCustomer}
            isEditing={isEditing}
            onFieldChange={handleFieldChange}
          />
        )
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading customer details...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !customer || !editedCustomer) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error Loading Customer</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error || 'Customer not found'}</p>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={fetchCustomer}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push('/customers')}
                    className="bg-white px-3 py-2 rounded-md text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Back to Customers
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
      {/* Secondary Navigation */}
      <SecondaryTopNavBar
        tabs={CUSTOMER_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        customerProfile={{
          initials: customer.individual.first_name?.[0]?.toUpperCase() + customer.individual.last_name?.[0]?.toUpperCase() || 'NA',
          name: customer.individual.full_name,
          id: customer.id,
          email: customer.individual.email,
          status: 'Active',
          individual_id: customer.individual_id
        }}
        actions={
          <>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <CheckIcon className="h-4 w-4 mr-1.5" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <XMarkIcon className="h-4 w-4 mr-1.5" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PencilIcon className="h-4 w-4 mr-1.5" />
                Edit
              </button>
            )}
          </>
        }
      />

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderTabContent()}
        </div>
      </div>
    </AppLayout>
  )
} 