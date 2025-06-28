'use client'

import React from 'react'
import { ComputerDesktopIcon } from '@heroicons/react/24/outline'
import ClientDetailSection from '../ClientDetailSection'

interface ClientDetail {
  accounting_software?: string[]
}

interface ClientDetailAccountingSoftwareTabProps {
  client: ClientDetail
  onFieldChange: (key: string, value: string | boolean | number | string[]) => void
  isEditing: boolean
}

export default function ClientDetailAccountingSoftwareTab({ client, onFieldChange, isEditing }: ClientDetailAccountingSoftwareTabProps) {
  const softwareOptions = [
    'Xero',
    'QuickBooks',
    'Sage',
    'Odoo',
    'Manual Excel Cashbook',
    'FreeAgent',
    'Kashflow',
    'Wave',
    'Zoho Books',
    'Receipt Bank',
    'Dext',
    'AutoEntry',
    'Other'
  ]

  const handleSoftwareToggle = (software: string, enabled: boolean) => {
    const currentSoftware = client.accounting_software || []
    let updatedSoftware: string[]
    
    if (enabled) {
      updatedSoftware = [...currentSoftware, software]
    } else {
      updatedSoftware = currentSoftware.filter(s => s !== software)
    }
    
    onFieldChange('accounting_software', updatedSoftware)
  }

  const isSoftwareSelected = (software: string) => {
    return client.accounting_software?.includes(software) || false
  }

  return (
    <div className="max-w-4xl">
      {/* Accounting Software Section */}
      <ClientDetailSection
        title="Accounting Software"
        icon={ComputerDesktopIcon}
        isInitiallyExpanded={true}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Select all accounting software used by this client:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {softwareOptions.map((software) => (
              <div key={software} className="flex items-center" data-reactid={`accounting-software-${software.toLowerCase().replace(/\s+/g, '-')}`}>
                <input
                  type="checkbox"
                  id={software}
                  checked={isSoftwareSelected(software)}
                  onChange={(e) => handleSoftwareToggle(software, e.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor={software} className="ml-2 text-sm text-gray-700">
                  {software}
                </label>
              </div>
            ))}
          </div>
          
          {!isEditing && client.accounting_software && client.accounting_software.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Software:</h4>
              <div className="flex flex-wrap gap-2">
                {client.accounting_software.map((software) => (
                  <span
                    key={software}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {software}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </ClientDetailSection>
    </div>
  )
} 