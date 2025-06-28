'use client'

import React from 'react'
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import ClientDetailSection from '../ClientDetailSection'

interface ClientDetail {
  engagement_letter_status?: string
  engagement_letter_last_review_date?: string
}

interface ClientDetailEngagementLetterTabProps {
  client: ClientDetail
  onFieldChange: (key: string, value: string | boolean | number | string[]) => void
  isEditing: boolean
}

export default function ClientDetailEngagementLetterTab({ client, onFieldChange, isEditing }: ClientDetailEngagementLetterTabProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="max-w-4xl">
      {/* Engagement Letter Section */}
      <ClientDetailSection
        title="Engagement Letter"
        icon={ClipboardDocumentListIcon}
        isInitiallyExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div data-reactid="field-engagement-letter-status">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            {isEditing ? (
              <select
                value={client.engagement_letter_status || ''}
                onChange={(e) => onFieldChange('engagement_letter_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="draft">Draft</option>
              </select>
            ) : (
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  client.engagement_letter_status === 'active' ? 'bg-green-100 text-green-800' :
                  client.engagement_letter_status === 'inactive' ? 'bg-red-100 text-red-800' :
                  client.engagement_letter_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  client.engagement_letter_status === 'expired' ? 'bg-red-100 text-red-800' :
                  client.engagement_letter_status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {client.engagement_letter_status?.charAt(0).toUpperCase() + client.engagement_letter_status?.slice(1) || 'Not set'}
                </span>
              </div>
            )}
          </div>
          
          <div data-reactid="field-engagement-letter-last-review-date">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Review Date
            </label>
            {isEditing ? (
              <input
                type="date"
                value={client.engagement_letter_last_review_date || ''}
                onChange={(e) => onFieldChange('engagement_letter_last_review_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{formatDate(client.engagement_letter_last_review_date)}</p>
            )}
          </div>
        </div>
      </ClientDetailSection>
    </div>
  )
} 