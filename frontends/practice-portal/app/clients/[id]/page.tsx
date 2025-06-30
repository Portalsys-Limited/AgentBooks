'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '../../../components/layout/AppLayout'
import SecondaryTopNavBar, { CLIENT_TABS } from '../../../components/navigation/SecondaryTopNavBar'
import { useAuth } from '../../../hooks/useAuth'
import { 
  CheckIcon,
  PencilIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

// Import client detail tab components
import ClientDetailBasicInfoTab from './components/tabs/ClientDetailBasicInfoTab'
import ClientDetailCompanyDataTab from './components/tabs/ClientDetailCompanyDataTab'
import ClientDetailBusinessAddressTab from './components/tabs/ClientDetailBusinessAddressTab'
import ClientDetailTradingAddressTab from './components/tabs/ClientDetailTradingAddressTab'
import ClientDetailMLRTab from './components/tabs/ClientDetailMLRTab'
import ClientDetailServicesTab from './components/tabs/ClientDetailServicesTab'
import ClientDetailAccountingSoftwareTab from './components/tabs/ClientDetailAccountingSoftwareTab'
import ClientDetailBillingTab from './components/tabs/ClientDetailBillingTab'
import ClientDetailPracticeInfoTab from './components/tabs/ClientDetailPracticeInfoTab'
import ClientDetailEngagementLetterTab from './components/tabs/ClientDetailEngagementLetterTab'
import ClientDetailCompaniesHouseDataTab from './components/tabs/ClientDetailCompaniesHouseDataTab'
import ClientDetailCompanyDetailsTab from './components/tabs/ClientDetailCompanyDetailsTab'
import ClientDetailEmailsTab from './components/tabs/ClientDetailEmailsTab'
import ClientLinkedCustomersTab from './components/tabs/ClientLinkedCustomersTab'
import TaskTimeline from './components/TaskTimeline'

interface ClientDetail {
  id: string
  
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
  
  // Services (many-to-many relationship)
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
  
  // Companies House RAW Data
  companies_house_raw_data?: any
  companies_house_last_sync?: string
  
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
  last_edited_date?: string
  last_edited_by?: string
  notes?: string
  
  // Linked Customers
  linked_customers?: Array<{
    id: string
    name: string
    email?: string
    phone?: string
    created_at?: string
  }>
  
  created_at?: string
  updated_at?: string
}

export default function ClientDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('basic-info')
  const [isEditing, setIsEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)



  useEffect(() => {
    if (clientId) {
      fetchClient()
    }
  }, [clientId])

  const fetchClient = async () => {
    try {
      // ✅ Use new service function
      const { getClient } = await import('../../../lib/clients')
      const data = await getClient(clientId)
      setClient(data)
    } catch (err) {
      console.error('Error fetching client:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch client')
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (key: string, value: string | boolean | number | string[]) => {
    if (client) {
      setClient(prev => ({
        ...prev!,
        [key]: value,
        last_edited_date: new Date().toISOString(),
        last_edited_by: user?.email || 'Unknown'
      }))
      setHasUnsavedChanges(true)
    }
  }

  const handleSave = async () => {
    if (!client || !hasUnsavedChanges) return
    
    setIsSaving(true)
    try {
      // TODO: Fix type compatibility - needs to convert between ClientDetail and UpdateClientData
      console.log('Save would be called here with client:', client)
      setHasUnsavedChanges(false)
      setIsEditing(false)
      // Show success message (you could add a toast notification here)
    } catch (err) {
      console.error('Error saving client:', err)
      // Show error message (you could add a toast notification here)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    fetchClient() // Reset to original data
    setIsEditing(false)
    setHasUnsavedChanges(false)
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  const renderTabContent = () => {
    if (!client) return null

    switch (activeTab) {
      case 'basic-info':
        return (
          <ClientDetailBasicInfoTab 
            client={client} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'company-data':
        return (
          <ClientDetailCompanyDataTab 
            client={client} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'business-address':
        return (
          <ClientDetailBusinessAddressTab 
            client={client} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'trading-address':
        return (
          <ClientDetailTradingAddressTab 
            client={client} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'mlr':
        return (
          <ClientDetailMLRTab 
            client={client} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'services':
        return (
          <ClientDetailServicesTab 
            client={client} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'accounting-software':
        return (
          <ClientDetailAccountingSoftwareTab 
            client={client} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'billing':
        return (
          <ClientDetailBillingTab 
            client={client} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'practice-info':
        return (
          <ClientDetailPracticeInfoTab 
            client={client} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'engagement-letter':
        return (
          <ClientDetailEngagementLetterTab 
            client={client} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'companies-house-data':
        return (
          <ClientDetailCompaniesHouseDataTab 
            client={client} 
            onRefresh={fetchClient}
          />
        )
      case 'company-details':
        return (
          <ClientDetailCompanyDetailsTab 
            client={client} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'emails':
        return (
          <ClientDetailEmailsTab 
            client={client} 
            onFieldChange={handleFieldChange}
            isEditing={isEditing}
          />
        )
      case 'linked-customers':
        return (
          <ClientLinkedCustomersTab 
            client={client} 
            onRefresh={fetchClient}
          />
        )
      case 'tasks':
        return (
          <div className="space-y-6">
            <TaskTimeline />
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading client details...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !client) {
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
                <h3 className="text-sm font-medium text-red-800">Error Loading Client</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error || 'Client not found'}</p>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={fetchClient}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push('/clients')}
                    className="bg-white px-3 py-2 rounded-md text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Back to Clients
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Create client initials from business name
  const getClientInitials = (businessName: string) => {
    return businessName
      .split(' ')
      .slice(0, 2)
      .map(word => word[0]?.toUpperCase())
      .join('') || 'CL'
  }

  return (
    <AppLayout>
      {/* Secondary Navigation */}
      <SecondaryTopNavBar
        tabs={CLIENT_TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        clientProfile={{
          initials: getClientInitials(client.business_name),
          name: client.business_name,
          id: client.id,
          email: client.emails?.find(e => e.is_primary)?.email,
          business_type: client.business_type?.replace('_', ' '),
          status: 'Active'
        }}
        actions={
          <>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4 mr-1.5" />
                  {isSaving ? 'Saving...' : 'Save'}
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