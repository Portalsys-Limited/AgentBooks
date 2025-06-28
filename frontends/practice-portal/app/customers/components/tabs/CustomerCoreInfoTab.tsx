'use client'

import React from 'react'
import { IdentificationIcon, DocumentTextIcon, CalendarIcon } from '@heroicons/react/24/outline'
import CustomerFormSection from '../CustomerFormSection'

interface CustomerFormData {
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

interface CustomerCoreInfoTabProps {
  customer: CustomerFormData
  onFieldChange: (key: string, value: string | boolean | number) => void
}

export default function CustomerCoreInfoTab({ customer, onFieldChange }: CustomerCoreInfoTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-4">
        {/* Customer Core Info Section */}
        <CustomerFormSection
          title="Customer Core Info"
          icon={IdentificationIcon}
          isInitiallyExpanded={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div data-reactid="field-customer-id">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer ID
              </label>
              <input
                type="text"
                value={customer.customer_id || ''}
                onChange={(e) => onFieldChange('customer_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Auto-generated"
              />
            </div>
            
            <div data-reactid="field-client-code">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Code
              </label>
              <input
                type="text"
                value={customer.client_code || ''}
                onChange={(e) => onFieldChange('client_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div data-reactid="field-status">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
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
            </div>
            
            <div data-reactid="field-setup-date">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setup Date
              </label>
              <input
                type="date"
                value={customer.setup_date || ''}
                onChange={(e) => onFieldChange('setup_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div data-reactid="field-last-edited-by">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Edited By
              </label>
              <input
                type="text"
                value={customer.last_edited_by || ''}
                onChange={(e) => onFieldChange('last_edited_by', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Auto-populated"
              />
            </div>
            
            <div data-reactid="field-last-edited-date">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Edited Date
              </label>
              <input
                type="datetime-local"
                value={customer.last_edited_date || ''}
                onChange={(e) => onFieldChange('last_edited_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </CustomerFormSection>
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        {/* Relationship Info Section */}
        <CustomerFormSection
          title="Relationship Info"
          icon={DocumentTextIcon}
          isInitiallyExpanded={true}
        >
          <div className="space-y-4">
            <div data-reactid="field-relationship-type">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship Type
              </label>
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
            </div>
            
            <div data-reactid="field-self-assessment-own">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={customer.self_assessment_own || false}
                  onChange={(e) => onFieldChange('self_assessment_own', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Do They Do Their Own Self Assessment?
                </span>
              </label>
            </div>
            
            <div data-reactid="field-self-assessment-client-relation">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Self Assessment Client Relation
              </label>
              <input
                type="text"
                value={customer.self_assessment_client_relation || ''}
                onChange={(e) => onFieldChange('self_assessment_client_relation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </CustomerFormSection>

        {/* Comments & Notes Section */}
        <CustomerFormSection
          title="Comments & Notes"
          icon={CalendarIcon}
        >
          <div className="space-y-4">
            <div data-reactid="field-comments">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comments
              </label>
              <textarea
                value={customer.comments || ''}
                onChange={(e) => onFieldChange('comments', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter any comments..."
              />
            </div>
            
            <div data-reactid="field-notes">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={customer.notes || ''}
                onChange={(e) => onFieldChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter any notes..."
              />
            </div>
          </div>
        </CustomerFormSection>
      </div>
    </div>
  )
} 