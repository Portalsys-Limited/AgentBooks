'use client'

import React from 'react'

interface ServicesTabProps {
  clientServices: {[key: string]: boolean}
  onServiceToggle: (serviceId: string, enabled: boolean) => void
}

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

export default function ServicesTab({ clientServices, onServiceToggle }: ServicesTabProps) {
  const servicesByCategory = accountingServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = []
    }
    acc[service.category].push(service)
    return acc
  }, {} as {[key: string]: typeof accountingServices})

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Object.entries(servicesByCategory).map(([category, services]) => (
        <div key={category} className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{category}</h3>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <label htmlFor={service.id} className="text-sm font-medium text-gray-700 cursor-pointer">
                    {service.name}
                  </label>
                </div>
                <div className="ml-4">
                  <button
                    type="button"
                    onClick={() => onServiceToggle(service.id, !clientServices[service.id])}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                      clientServices[service.id] ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={clientServices[service.id] || false}
                    aria-labelledby={service.id}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        clientServices[service.id] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
} 