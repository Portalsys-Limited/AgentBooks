'use client'

import React from 'react'
import { UsersIcon } from '@heroicons/react/24/outline'
import ClientDetailSection from '../ClientDetailSection'

interface ClientDetail {
  client_manager?: string
  outsource_manager?: string
  payroll_manager?: string
  client_source?: string
  client_primary_contact?: string
}

interface ClientDetailPracticeInfoTabProps {
  client: ClientDetail
  onFieldChange: (key: string, value: string | boolean | number | string[]) => void
  isEditing: boolean
}

export default function ClientDetailPracticeInfoTab({ client, onFieldChange, isEditing }: ClientDetailPracticeInfoTabProps) {
  return (
    <div className="max-w-4xl">
      {/* Practice Information Section */}
      <ClientDetailSection
        title="Practice Information"
        icon={UsersIcon}
        isInitiallyExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div data-reactid="field-client-manager">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Manager
            </label>
            {isEditing ? (
              <input
                type="text"
                value={client.client_manager || ''}
                onChange={(e) => onFieldChange('client_manager', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Name of the client manager"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.client_manager || 'Not assigned'}</p>
            )}
          </div>
          
          <div data-reactid="field-outsource-manager">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outsource Manager
            </label>
            {isEditing ? (
              <input
                type="text"
                value={client.outsource_manager || ''}
                onChange={(e) => onFieldChange('outsource_manager', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Name of the outsource manager"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.outsource_manager || 'Not assigned'}</p>
            )}
          </div>
          
          <div data-reactid="field-payroll-manager">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payroll Manager
            </label>
            {isEditing ? (
              <input
                type="text"
                value={client.payroll_manager || ''}
                onChange={(e) => onFieldChange('payroll_manager', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Name of the payroll manager"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.payroll_manager || 'Not assigned'}</p>
            )}
          </div>
          
          <div data-reactid="field-client-source">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Source
            </label>
            {isEditing ? (
              <select
                value={client.client_source || ''}
                onChange={(e) => onFieldChange('client_source', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Source</option>
                <option value="referral">Referral</option>
                <option value="website">Website</option>
                <option value="social_media">Social Media</option>
                <option value="google_ads">Google Ads</option>
                <option value="networking">Networking</option>
                <option value="cold_call">Cold Call</option>
                <option value="existing_client">Existing Client</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className="mt-1 text-sm text-gray-900 capitalize">{client.client_source?.replace('_', ' ') || 'Not provided'}</p>
            )}
          </div>
          
          <div className="md:col-span-2" data-reactid="field-client-primary-contact">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Primary Contact
            </label>
            {isEditing ? (
              <input
                type="text"
                value={client.client_primary_contact || ''}
                onChange={(e) => onFieldChange('client_primary_contact', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Name and role of primary contact"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{client.client_primary_contact || 'Not provided'}</p>
            )}
          </div>
        </div>
      </ClientDetailSection>
    </div>
  )
} 