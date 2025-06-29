'use client'

import React, { useState, useEffect } from 'react'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  CalendarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CreditCardIcon,
  BanknotesIcon,
  MapPinIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { CustomerInfoTabResponse } from '../../../../lib/customers/types'
import { getCustomerInfo, updateCustomer } from '../../../../lib/customers/service'

interface CustomerInformationTabProps {
  customerId: string
}

export default function CustomerInformationTab({ customerId }: CustomerInformationTabProps) {
  const [customer, setCustomer] = useState<CustomerInfoTabResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<CustomerInfoTabResponse>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCustomerInfo()
  }, [customerId])

  const loadCustomerInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCustomerInfo(customerId)
      setCustomer(data)
      setEditData(data)
    } catch (err) {
      console.error('Error loading customer info:', err)
      setError('Failed to load customer information')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditData(customer || {})
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData(customer || {})
  }

  const handleSave = async () => {
    if (!customer) return

    try {
      setSaving(true)
      setError(null)
      
      const updateData = {
        ni_number: editData.ni_number,
        personal_utr_number: editData.personal_utr_number,
        status: editData.status,
        do_they_own_sa: editData.do_they_own_sa,
        comments: editData.comments,
        notes: editData.notes,
        practice_info: {
          primary_accounting_contact_id: editData.primary_accounting_contact_id,
          acting_from: editData.acting_from
        }
      }

      await updateCustomer(customerId, updateData)
      await loadCustomerInfo() // Reload to get updated data
      setIsEditing(false)
    } catch (err) {
      console.error('Error saving customer:', err)
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error || 'Customer information not found'}</p>
        <button 
          onClick={loadCustomerInfo}
          className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
          <p className="text-sm text-gray-600">Comprehensive customer details and profile</p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                ) : (
                  <CheckIcon className="h-4 w-4 mr-1" />
                )}
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{customer.individual.full_name}</p>
                <p className="text-sm text-gray-500">Full Name</p>
              </div>
            </div>

            {customer.individual.email && (
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{customer.individual.email}</p>
                  <p className="text-sm text-gray-500">Email Address</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <TagIcon className="h-5 w-5 text-gray-400" />
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  customer.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {customer.status}
                </span>
                <p className="text-sm text-gray-500">Status</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Information Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <IdentificationIcon className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Tax Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CreditCardIcon className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.ni_number || ''}
                    onChange={(e) => setEditData({ ...editData, ni_number: e.target.value })}
                    className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="National Insurance Number"
                  />
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">{customer.ni_number || 'Not set'}</p>
                    <p className="text-sm text-gray-500">National Insurance Number</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <BanknotesIcon className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.personal_utr_number || ''}
                    onChange={(e) => setEditData({ ...editData, personal_utr_number: e.target.value })}
                    className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Personal UTR Number"
                  />
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">{customer.personal_utr_number || 'Not set'}</p>
                    <p className="text-sm text-gray-500">Personal UTR Number</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={editData.do_they_own_sa || false}
                    onChange={(e) => setEditData({ ...editData, do_they_own_sa: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                ) : (
                  <div className={`w-4 h-4 rounded ${
                    customer.do_they_own_sa ? 'bg-green-500' : 'bg-gray-300'
                  } flex items-center justify-center`}>
                    {customer.do_they_own_sa && <CheckIcon className="h-3 w-3 text-white" />}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {customer.do_they_own_sa ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm text-gray-500">Self Assessment Required</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Practice Information Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Practice Information</h3>
          </div>
          
          <div className="space-y-4">
            {customer.primary_accounting_contact && (
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{customer.primary_accounting_contact.email}</p>
                  <p className="text-sm text-gray-500">Primary Contact</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.acting_from || ''}
                    onChange={(e) => setEditData({ ...editData, acting_from: e.target.value })}
                    className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">{formatDate(customer.acting_from)}</p>
                    <p className="text-sm text-gray-500">Acting From Date</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ClockIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{formatDateTime(customer.setup_date)}</p>
                <p className="text-sm text-gray-500">Setup Date</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes and Comments Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <PencilIcon className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Notes & Comments</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              {isEditing ? (
                <textarea
                  value={editData.comments || ''}
                  onChange={(e) => setEditData({ ...editData, comments: e.target.value })}
                  rows={3}
                  className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add comments..."
                />
              ) : (
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md min-h-[76px]">
                  {customer.comments || 'No comments added'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              {isEditing ? (
                <textarea
                  value={editData.notes || ''}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  rows={3}
                  className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add notes..."
                />
              ) : (
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md min-h-[76px]">
                  {customer.notes || 'No notes added'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      {customer.last_edited && customer.last_edited_by && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ClockIcon className="h-4 w-4" />
            <span>
              Last updated on {formatDateTime(customer.last_edited)} by {customer.last_edited_by.email}
            </span>
          </div>
        </div>
      )}
    </div>
  )
} 