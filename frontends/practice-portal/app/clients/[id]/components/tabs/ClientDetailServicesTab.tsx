'use client'

import React from 'react'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import ClientDetailSection from '../ClientDetailSection'

interface Service {
  id: string
  name: string
  category: string
  enabled: boolean
}

interface ClientDetail {
  services?: Service[]
}

interface ClientDetailServicesTabProps {
  client: ClientDetail
  onFieldChange: (key: string, value: string | boolean | number | string[]) => void
  isEditing: boolean
}

export default function ClientDetailServicesTab({ client, onFieldChange, isEditing }: ClientDetailServicesTabProps) {
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

  const servicesByCategory = accountingServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = []
    }
    acc[service.category].push(service)
    return acc
  }, {} as {[key: string]: typeof accountingServices})

  const handleServiceToggle = (serviceId: string, enabled: boolean) => {
    const updatedServices = client.services ? [...client.services] : []
    const existingIndex = updatedServices.findIndex(s => s.id === serviceId)
    
    if (existingIndex >= 0) {
      updatedServices[existingIndex] = { ...updatedServices[existingIndex], enabled }
    } else {
      const service = accountingServices.find(s => s.id === serviceId)
      if (service) {
        updatedServices.push({ ...service, enabled })
      }
    }
    
    onFieldChange('services', updatedServices)
  }

  const isServiceEnabled = (serviceId: string) => {
    return client.services?.find(s => s.id === serviceId)?.enabled || false
  }

  return (
    <div className="max-w-4xl">
      {/* Services Section */}
      <ClientDetailSection
        title="Services"
        icon={ChartBarIcon}
        isInitiallyExpanded={true}
      >
        <div className="space-y-6">
          {Object.entries(servicesByCategory).map(([category, services]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">{category}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center" data-reactid={`service-${service.id}`}>
                    <input
                      type="checkbox"
                      id={service.id}
                      checked={isServiceEnabled(service.id)}
                      onChange={(e) => handleServiceToggle(service.id, e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label htmlFor={service.id} className="ml-2 text-sm text-gray-700">
                      {service.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ClientDetailSection>
    </div>
  )
} 