'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '../../../components/layout/AppLayout'
import { useAuth } from '../../../hooks/useAuth'
import TaskTimeline from './components/TaskTimeline'
import InformationTab from './components/tabs/InformationTab'
import ServicesTab from './components/tabs/ServicesTab'
import BillingTab from './components/tabs/BillingTab'
import CommunicationTab from './components/tabs/CommunicationTab'
import MLRTab from './components/tabs/MLRTab'
import AssignedStaffTab from './components/tabs/AssignedStaffTab'
import DocumentsTab from './components/tabs/DocumentsTab'
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
  CheckIcon
} from '@heroicons/react/24/outline'

interface ClientDetail {
  id: string
  business_name: string
  trading_name?: string
  business_type?: string
  companies_house_number?: string
  vat_number?: string
  corporation_tax_utr?: string
  paye_reference?: string
  nature_of_business?: string
  sic_code?: string
  incorporation_date?: string
  accounting_period_end?: string
  main_email?: string
  main_phone?: string
  registered_address?: {
    line_1?: string
    line_2?: string
    city?: string
    county?: string
    postcode?: string
    country?: string
  }
  trading_address?: {
    line_1?: string
    line_2?: string
    city?: string
    county?: string
    postcode?: string
    country?: string
  }
  banking?: {
    name?: string
    sort_code?: string
    account_number?: string
    account_name?: string
  }
  notes?: string
  created_at?: string
  updated_at?: string
  customer?: {
    id: string
    name: string
    first_name?: string
    last_name?: string
    email?: string
  }
}

export default function ClientDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('information')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [clientServices, setClientServices] = useState<{[key: string]: boolean}>({})

  const tabs = [
    { id: 'information', name: 'Information', icon: IdentificationIcon },
    { id: 'services', name: 'Services', icon: ChartBarIcon },
    { id: 'billing', name: 'Billing', icon: CurrencyPoundIcon },
    { id: 'communication', name: 'Communication', icon: ChatBubbleLeftRightIcon },
    { id: 'mlr', name: 'MLR', icon: ShieldCheckIcon },
    { id: 'assigned_staff', name: 'Assigned Staff', icon: UsersIcon },
    { id: 'documents', name: 'Documents', icon: FolderIcon }
  ]

  // List of accounting services
  const accountingServices = [
    { id: 'bookkeeping', name: 'Bookkeeping', category: 'Core Services' },
    { id: 'vat_returns', name: 'VAT Returns', category: 'Core Services' },
    { id: 'payroll', name: 'Payroll Services', category: 'Core Services' },
    { id: 'annual_accounts', name: 'Annual Accounts Preparation', category: 'Core Services' },
    { id: 'corporation_tax', name: 'Corporation Tax Returns', category: 'Tax Services' },
    { id: 'self_assessment', name: 'Self Assessment Returns', category: 'Tax Services' },
    { id: 'tax_planning', name: 'Tax Planning & Advice', category: 'Tax Services' },
    { id: 'company_formation', name: 'Company Formation', category: 'Business Services' },
    { id: 'company_secretarial', name: 'Company Secretarial', category: 'Business Services' },
    { id: 'business_advice', name: 'Business Advisory', category: 'Business Services' },
    { id: 'management_accounts', name: 'Management Accounts', category: 'Reporting' },
    { id: 'budgeting_forecasting', name: 'Budgeting & Forecasting', category: 'Reporting' },
    { id: 'financial_analysis', name: 'Financial Analysis', category: 'Reporting' },
    { id: 'audit_assurance', name: 'Audit & Assurance', category: 'Compliance' },
    { id: 'companies_house', name: 'Companies House Filings', category: 'Compliance' },
    { id: 'hmrc_correspondence', name: 'HMRC Correspondence', category: 'Compliance' }
  ]

  useEffect(() => {
    if (clientId) {
      fetchClient()
    }
  }, [clientId])

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch client: ${response.status}`)
      }

      const data = await response.json()
      setClient(data)
    } catch (err) {
      console.error('Error fetching client:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch client')
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address?: any) => {
    if (!address) return ''
    const parts = [
      address.line_1,
      address.line_2,
      address.city,
      address.county,
      address.postcode,
      address.country
    ].filter(Boolean)
    return parts.join(', ')
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString()
  }

  const handleFieldChange = (key: string, value: string) => {
    if (!client) return
    
    // Handle nested fields (like address fields)
    if (key.includes('.')) {
      const [parentKey, childKey] = key.split('.')
      setClient(prev => ({
        ...prev!,
        [parentKey]: {
          ...prev![parentKey as keyof ClientDetail],
          [childKey]: value
        }
      }))
    } else {
      setClient(prev => ({
        ...prev!,
        [key]: value
      }))
    }
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    if (!client || !hasUnsavedChanges) return
    
    setIsSaving(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`http://localhost:8000/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(client)
      })

      if (!response.ok) {
        throw new Error(`Failed to update client: ${response.status}`)
      }

      setHasUnsavedChanges(false)
      // Show success message (you could add a toast notification here)
    } catch (err) {
      console.error('Error saving client:', err)
      // Show error message (you could add a toast notification here)
    } finally {
      setIsSaving(false)
    }
  }

  const handleServiceToggle = (serviceId: string, enabled: boolean) => {
    setClientServices(prev => ({
      ...prev,
      [serviceId]: enabled
    }))
    setHasUnsavedChanges(true)
  }

  const renderTabContent = () => {
    if (!client) return null

    switch (activeTab) {
      case 'information':
        return (
          <InformationTab
            client={client}
            onFieldChange={handleFieldChange}
          />
        )
      case 'services':
        const servicesByCategory = accountingServices.reduce((acc, service) => {
          if (!acc[service.category]) {
            acc[service.category] = []
          }
          acc[service.category].push(service)
          return acc
        }, {} as {[key: string]: typeof accountingServices})

        return (
          <ServicesTab
            clientServices={clientServices}
            onServiceToggle={handleServiceToggle}
          />
        )
      case 'billing':
        return (
          <BillingTab />
        )
      case 'communication':
        return (
          <CommunicationTab />
        )
      case 'mlr':
        return (
          <MLRTab />
        )
      case 'assigned_staff':
        return (
          <AssignedStaffTab />
        )
      case 'documents':
        return (
          <DocumentsTab />
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
        <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Client</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error || 'Client not found'}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/clients')}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
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

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header with full width */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back
              </button>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{client.business_name}</h1>
                  {client.trading_name && client.trading_name !== client.business_name && (
                    <p className="text-sm text-gray-500">Trading as: {client.trading_name}</p>
                  )}
                  <p className="text-sm text-gray-400">Client ID: {client.id}</p>
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            {hasUnsavedChanges && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Content with full width */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Task Timeline */}
          <TaskTimeline />

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </AppLayout>
  )
} 