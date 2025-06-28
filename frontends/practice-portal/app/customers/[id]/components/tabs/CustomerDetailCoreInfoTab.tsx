'use client'

import React from 'react'
import { IdentificationIcon, DocumentTextIcon, CalendarIcon } from '@heroicons/react/24/outline'
import CustomerDetailSection from '../CustomerDetailSection'

interface CustomerDetail {
  customer_id?: string
  client_code?: string
  status?: string
  setup_date?: string
  last_edited_date?: string
  last_edited_by?: string
  comments?: string
  notes?: string
  relationship_type?: string
  self_assessment_own?: boolean
  self_assessment_client_relation?: string
}

interface CustomerDetailCoreInfoTabProps {
  customer: CustomerDetail
  onFieldChange: (key: string, value: string | boolean | number) => void
  isEditing: boolean
}

export default function CustomerDetailCoreInfoTab({ customer, onFieldChange, isEditing }: CustomerDetailCoreInfoTabProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-4">
        {/* Customer Core Info Section */}
        <CustomerDetailSection
          title="Customer Core Info"
          icon={IdentificationIcon}
          isInitiallyExpanded={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div data-reactid="field-customer-id">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer ID
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={customer.customer_id || ''}
                  onChange={(e) => onFieldChange('customer_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{customer.customer_id || 'Not provided'}</p>
              )}
            </div>
            
            <div data-reactid="field-client-code">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Code
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={customer.client_code || ''}
                  onChange={(e) => onFieldChange('client_code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{customer.client_code || 'Not provided'}</p>
              )}
            </div>
            
            <div data-reactid="field-status">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              {isEditing ? (
                <select
                  value={customer.status || 'active'}
                  onChange={(e) => onFieldChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="archived">Archived</option>
                </select>
              ) : (
                <p className="mt-1 text-sm text-gray-900 capitalize">{customer.status || 'Not provided'}</p>
              )}
            </div>
            
            <div data-reactid="field-setup-date">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setup Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={customer.setup_date || ''}
                  onChange={(e) => onFieldChange('setup_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{formatDate(customer.setup_date)}</p>
              )}
            </div>
            
            <div data-reactid="field-last-edited-by">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Edited By
              </label>
              <p className="mt-1 text-sm text-gray-900">{customer.last_edited_by || 'Not provided'}</p>
            </div>
            
            <div data-reactid="field-last-edited-date">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Edited Date
              </label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(customer.last_edited_date)}</p>
            </div>
          </div>
        </CustomerDetailSection>
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        {/* Relationship Info Section */}
        <CustomerDetailSection
          title="Relationship Info"
          icon={DocumentTextIcon}
          isInitiallyExpanded={true}
        >
          <div className="space-y-4">
            <div data-reactid="field-relationship-type">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship Type
              </label>
              {isEditing ? (
                <select
                  value={customer.relationship_type || 'individual'}
                  onChange={(e) => onFieldChange('relationship_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="individual">Individual</option>
                  <option value="business">Business</option>
                  <option value="partnership">Partnership</option>
                  <option value="trust">Trust</option>
                </select>
              ) : (
                <p className="mt-1 text-sm text-gray-900 capitalize">{customer.relationship_type || 'Not provided'}</p>
              )}
            </div>
            
            <div data-reactid="field-self-assessment-own">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Do They Do Their Own Self Assessment?
              </label>
              {isEditing ? (
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={customer.self_assessment_own || false}
                    onChange={(e) => onFieldChange('self_assessment_own', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{customer.self_assessment_own ? 'Yes' : 'No'}</p>
              )}
            </div>
            
            <div data-reactid="field-self-assessment-client-relation">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Self Assessment Client Relation
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={customer.self_assessment_client_relation || ''}
                  onChange={(e) => onFieldChange('self_assessment_client_relation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{customer.self_assessment_client_relation || 'Not provided'}</p>
              )}
            </div>
          </div>
        </CustomerDetailSection>

        {/* Comments & Notes Section */}
        <CustomerDetailSection
          title="Comments & Notes"
          icon={CalendarIcon}
        >
          <div className="space-y-4">
            <div data-reactid="field-comments">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comments
              </label>
              {isEditing ? (
                <textarea
                  value={customer.comments || ''}
                  onChange={(e) => onFieldChange('comments', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{customer.comments || 'Not provided'}</p>
              )}
            </div>
            
            <div data-reactid="field-notes">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              {isEditing ? (
                <textarea
                  value={customer.notes || ''}
                  onChange={(e) => onFieldChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{customer.notes || 'Not provided'}</p>
              )}
            </div>
          </div>
        </CustomerDetailSection>
      </div>
    </div>
  )
} 