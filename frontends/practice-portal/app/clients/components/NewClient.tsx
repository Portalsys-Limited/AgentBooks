'use client'

import React, { useState, useEffect } from 'react'
import { PlusIcon, BuildingOfficeIcon, ArrowLeftIcon, IdentificationIcon, ChartBarIcon, CurrencyPoundIcon, ChatBubbleLeftRightIcon, ShieldCheckIcon, UsersIcon, FolderIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import AppLayout from '../../../components/layout/AppLayout'
import { useAuth } from '../../../hooks/useAuth'
import InformationTab from '../[id]/components/tabs/InformationTab'
import ServicesTab from '../[id]/components/tabs/ServicesTab'
import BillingTab from '../[id]/components/tabs/BillingTab'
import CommunicationTab from '../[id]/components/tabs/CommunicationTab'
import MLRTab from '../[id]/components/tabs/MLRTab'
import AssignedStaffTab from '../[id]/components/tabs/AssignedStaffTab'
import DocumentsTab from '../[id]/components/tabs/DocumentsTab'
import HMRCApi from './HMRCApi'
import { createClient } from '../../../lib/clients'
import type { CreateClientData } from '../../../lib/clients/types'
import type { CompanySelectionData } from '../../../lib/companies_house'

interface ClientFormData extends CreateClientData {
  id?: string
  business_name?: string
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
}

interface NewClientProps {
  onCancel?: () => void;
}

export default function NewClient({ onCancel }: NewClientProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [showHMRCSearch, setShowHMRCSearch] = useState(true)
  const [showClientForm, setShowClientForm] = useState(false)
  
  const [client, setClient] = useState<ClientFormData>({
    name: '',
    trading_name: '',
    business_type: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United Kingdom',
  })
  
  const [loading, setLoading] = useState(false)
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

  const handleCompanySelect = (company: CompanySelectionData) => {
    // Pre-populate client data with Companies House information
    console.log('Selected company:', company) // For debugging
    
    setClient(prev => ({
      ...prev,
      business_name: company.company_name || '',
      name: company.company_name || '',
      companies_house_number: company.company_number || '',
      business_type: company.company_type.toLowerCase().includes('ltd') ? 'limited_company' : 
                    company.company_type.toLowerCase().includes('plc') ? 'public_limited_company' :
                    company.company_type.toLowerCase().includes('partnership') ? 'partnership' :
                    company.company_type.toLowerCase().includes('sole') ? 'sole_trader' : 'other',
      incorporation_date: company.date_of_creation || '',
      nature_of_business: company.description || '',
      
      // Handle registered address
      registered_address: company.registered_office_address ? {
        line_1: company.registered_office_address.address_line_1 || '',
        line_2: company.registered_office_address.address_line_2 || '',
        city: company.registered_office_address.locality || '',
        county: company.registered_office_address.region || '',
        postcode: company.registered_office_address.postal_code || '',
        country: company.registered_office_address.country || 'United Kingdom',
      } : undefined,
      
      // Map registered address to client address fields for the form
      address_line1: company.registered_office_address?.address_line_1 || '',
      address_line2: company.registered_office_address?.address_line_2 || '',
      city: company.registered_office_address?.locality || '',
      state: company.registered_office_address?.region || '',
      postal_code: company.registered_office_address?.postal_code || '',
      country: company.registered_office_address?.country || 'United Kingdom',
      
      // Set auto-fill flag if requested
      auto_fill_companies_house: company.auto_fill_requested || false
    }))
    
    setHasUnsavedChanges(true)
    setShowHMRCSearch(false)
    setShowClientForm(true)
    
    // Show a success message to user
    console.log(`Successfully pre-populated client data for ${company.company_name}`)
  }

  const handleClose = () => {
    setShowHMRCSearch(false)
  }

  const handleCreateManually = () => {
    // Reset client data to defaults for manual entry
    setClient({
      name: '',
      trading_name: '',
      business_type: '',
      email: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'United Kingdom',
    })
    setHasUnsavedChanges(false)
    setShowHMRCSearch(false)
    setShowClientForm(true)
    setActiveTab('information') // Ensure we start on the information tab
  }

  const handleFieldChange = (key: string, value: string) => {
    // Handle nested fields (like address fields)
    if (key.includes('.')) {
      const [parentKey, childKey] = key.split('.')
      setClient(prev => ({
        ...prev,
        [parentKey]: {
          ...prev[parentKey as keyof ClientFormData],
          [childKey]: value
        }
      }))
    } else {
      setClient(prev => ({
        ...prev,
        [key]: value
      }))
    }
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    if (!client || !client.name) return
    
    setIsSaving(true)
    setError(null)
    
    try {
      // Prepare data for API call - match backend schema exactly
      const createData = {
        // Required fields
        business_name: client.business_name || client.name || '',
        business_type: client.business_type || 'ltd',  // Use enum value from backend
        
        // Contact information
        main_email: client.main_email || client.email || null,
        main_phone: client.main_phone || client.phone || null,
        
        // Registered address
        registered_address_line1: client.registered_address?.line_1 || client.address_line1 || null,
        registered_address_line2: client.registered_address?.line_2 || client.address_line2 || null,
        registered_city: client.registered_address?.city || client.city || null,
        registered_county: client.registered_address?.county || client.state || null,
        registered_postcode: client.registered_address?.postcode || client.postal_code || null,
        registered_country: client.registered_address?.country || client.country || 'United Kingdom',
        
        // Optional fields
        trading_name: client.trading_name || null,
        companies_house_number: client.companies_house_number || null,
        nature_of_business: client.nature_of_business || null,
        industry_sector: client.sic_code || null,
      }

      // Log the data being sent
      console.log('Creating client with data:', createData);
      
      // Create client with Companies House auto-fill if we have a number
      const newClient = await createClient(
        createData,
        !!client.companies_house_number // Enable auto-fill if we have a CH number
      )
      
      console.log('Client created successfully:', newClient)
      
      // Navigate to the new client detail page
      router.push(`/clients/${newClient.id}`)
    } catch (err) {
      console.error('Error creating client:', err)
      setError(err instanceof Error ? err.message : 'Failed to create client')
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

  const handleCancel = () => {
    setShowClientForm(false)
    setClient({
      name: '',
      trading_name: '',
      business_type: '',
      email: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'United Kingdom',
    })
    setHasUnsavedChanges(false)
    setError(null)
    if (onCancel) {
      onCancel()
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'information':
        return (
          <InformationTab
            client={client}
            onFieldChange={handleFieldChange}
          />
        )
      case 'services':
        return (
          <ServicesTab
            clientServices={clientServices}
            onServiceToggle={handleServiceToggle}
          />
        )
      case 'billing':
        return <BillingTab />
      case 'communication':
        return <CommunicationTab />
      case 'mlr':
        return <MLRTab />
      case 'assigned_staff':
        return <AssignedStaffTab />
      case 'documents':
        return <DocumentsTab />
      default:
        return null
    }
  }

  return (
    <div className="flex-1 pb-8">
      {showHMRCSearch && (
        <div className="bg-white">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Add New Client</h2>
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                  </div>
                  <HMRCApi 
                    onCompanySelect={handleCompanySelect} 
                    onClose={handleClose}
                    onCreateManually={handleCreateManually}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showClientForm && (
        <div className="bg-white">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">New Client Details</h2>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving || !hasUnsavedChanges}
                        className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                          isSaving || !hasUnsavedChanges
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                      >
                        {isSaving ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <CheckIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-4 rounded-md bg-red-50">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                      {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                              ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }
                              group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                            `}
                          >
                            <Icon
                              className={`
                                ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                                -ml-0.5 mr-2 h-5 w-5
                              `}
                              aria-hidden="true"
                            />
                            <span>{tab.name}</span>
                          </button>
                        )
                      })}
                    </nav>
                  </div>

                  <div className="mt-6">
                    {renderTabContent()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
