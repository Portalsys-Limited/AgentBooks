'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '../../../components/layout/AppLayout'
import SecondaryTopNavBar, { CUSTOMER_TABS } from '../../../components/navigation/SecondaryTopNavBar'
import { useAuth } from '../../../hooks/useAuth'
import { 
  ArrowLeftIcon,
  UserIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

// Import tab components
import CustomerInformationTab from './components/CustomerInformationTab'
import CustomerTasksTab from './components/CustomerTasksTab'
import CustomerCommunicationTab from './components/CustomerCommunicationTab'
import CustomerDocumentsTab from './components/CustomerDocumentsTab'
import CustomerMLRTab from './components/CustomerMLRTab'
import CustomerRelationshipsTab from './components/CustomerRelationshipsTab'

// Import customer service
import { getCustomerInfo } from '../../../lib/customers/service'
import { CustomerInfoTabResponse } from '../../../lib/customers/types'

export default function CustomerDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string
  
  const [customer, setCustomer] = useState<CustomerInfoTabResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('information')

  useEffect(() => {
    if (customerId) {
      fetchCustomer()
    }
  }, [customerId])

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

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  const renderTabContent = () => {
    if (!customer) return null

    switch (activeTab) {
      case 'information':
        return <CustomerInformationTab customerId={customerId} />
      case 'tasks':
        return <CustomerTasksTab customerId={customerId} />
      case 'communication':
        return <CustomerCommunicationTab customerId={customerId} />
      case 'documents':
        return <CustomerDocumentsTab customerId={customerId} />
      case 'mlr':
        return <CustomerMLRTab customerId={customerId} />
      case 'relationships':
        return <CustomerRelationshipsTab customerId={customerId} />
      default:
        return <CustomerInformationTab customerId={customerId} />
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

  if (error || !customer) {
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
      <div className="min-h-screen bg-gray-50">
        {/* Customer Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back
              </button>
              <span className="text-gray-300">/</span>
              <span className="text-sm text-gray-500">Customers</span>
              <span className="text-gray-300">/</span>
              <span className="text-sm font-medium text-gray-900">{customer.individual.full_name}</span>
            </div>
            
            {/* Customer Profile Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {customer.individual.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{customer.individual.full_name}</h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">Customer ID: {customer.id}</span>
                    {customer.individual.email && (
                      <span className="text-sm text-gray-500">{customer.individual.email}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab('information')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Customer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Navigation */}
        <SecondaryTopNavBar
          tabs={CUSTOMER_TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderTabContent()}
        </div>
      </div>
    </AppLayout>
  )
} 