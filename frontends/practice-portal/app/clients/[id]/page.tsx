'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '../../../components/layout/AppLayout'
import { useAuth } from '../../../hooks/useAuth'
import { 
  BuildingOfficeIcon, 
  EnvelopeIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  ArrowLeftIcon,
  IdentificationIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyPoundIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  UsersIcon,
  FolderIcon,
  CheckIcon,
  PencilIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ClipboardDocumentListIcon
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
  
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('basic-info')
  const [isEditing, setIsEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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
    { id: 'companies-house-data', name: 'Companies House Data', icon: DocumentTextIcon },
    { id: 'company-details', name: 'Company Details', icon: GlobeAltIcon },
    { id: 'emails', name: 'Emails', icon: EnvelopeIcon },
    { id: 'linked-customers', name: 'Linked Customers', icon: UserIcon },
    { id: 'tasks', name: 'Tasks', icon: ClipboardDocumentListIcon }
  ]

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
        last_edited_by: user?.email || user?.name
      }))
      setHasUnsavedChanges(true)
    }
  }

  const handleSave = async () => {
    if (!client || !hasUnsavedChanges) return
    
    setIsSaving(true)
    try {
      // ✅ Use new service function
      const { updateClient } = await import('../../../lib/clients')
      await updateClient(clientId, client)
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
            <TaskTimeline clientId={clientId} />
          </div>
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

  if (error || !client) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Client</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error || 'Client not found'}</p>
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
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <BuildingOfficeIcon className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{client.business_name}</h1>
                <p className="text-lg text-gray-500">{client.business_type?.replace('_', ' ')}</p>
                <p className="text-sm text-gray-400">Client ID: {client.id}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setHasUnsavedChanges(false)
                      fetchClient() // Reset changes
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !hasUnsavedChanges}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Client
                </button>
              )}
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