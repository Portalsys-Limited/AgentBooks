'use client'

import React from 'react'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import ClientDetailSection from '../ClientDetailSection'

interface ClientDetail {
  mlr_status?: string
}

interface ClientDetailMLRTabProps {
  client: ClientDetail
  onFieldChange: (key: string, value: string | boolean | number | string[]) => void
  isEditing: boolean
}

export default function ClientDetailMLRTab({ client, onFieldChange, isEditing }: ClientDetailMLRTabProps) {
  return (
    <div className="max-w-4xl">
      {/* MLR Section */}
      <ClientDetailSection
        title="Money Laundering Regulations (MLR)"
        icon={ShieldCheckIcon}
        isInitiallyExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div data-reactid="field-mlr-status">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MLR Status
            </label>
            {isEditing ? (
              <select
                value={client.mlr_status || ''}
                onChange={(e) => onFieldChange('mlr_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="not_required">Not Required</option>
                <option value="expired">Expired</option>
              </select>
            ) : (
              <p className="mt-1 text-sm text-gray-900 capitalize">{client.mlr_status?.replace('_', ' ') || 'Not provided'}</p>
            )}
          </div>
        </div>
      </ClientDetailSection>
    </div>
  )
} 