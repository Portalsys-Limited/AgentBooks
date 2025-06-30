'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  PhoneIcon,
  CreditCardIcon,
  IdentificationIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { CustomerMLRTabResponse } from '../../../../lib/customers/types'
import { getCustomerMLR, updateCustomer } from '../../../../lib/customers/service'

interface CustomerMLRTabProps {
  customerId: string
}

const MLR_STATUS_CONFIG = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: ClockIcon,
    label: 'Pending',
    description: 'MLR check has not been started'
  },
  in_progress: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: ClockIcon,
    label: 'In Progress',
    description: 'MLR check is currently being processed'
  },
  complete: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircleIcon,
    label: 'Complete',
    description: 'MLR check has been completed successfully'
  },
  not_required: {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: ExclamationTriangleIcon,
    label: 'Not Required',
    description: 'MLR check is not required for this customer'
  }
}

export default function CustomerMLRTab({ customerId }: CustomerMLRTabProps) {
  const [mlrData, setMLRData] = useState<CustomerMLRTabResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<CustomerMLRTabResponse>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadMLRData()
  }, [customerId])

  const loadMLRData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCustomerMLR(customerId)
      setMLRData(data)
      setEditData(data)
    } catch (err) {
      console.error('Error loading MLR data:', err)
      setError('Failed to load MLR information')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditData(mlrData || {})
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData(mlrData || {})
  }

  const handleSave = async () => {
    if (!mlrData) return

    try {
      setSaving(true)
      setError(null)
      
      const updateData = {
        mlr_info: {
          status: editData.mlr_status,
          date_complete: editData.mlr_date_complete,
          passport_number: editData.passport_number,
          driving_license: editData.driving_license,
          uk_home_telephone: editData.uk_home_telephone
        }
      }

      await updateCustomer(customerId, updateData)
      await loadMLRData()
      setIsEditing(false)
    } catch (err) {
      console.error('Error saving MLR data:', err)
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

  const getNextMLRDueDate = (completedDate?: string) => {
    if (!completedDate) return null
    const completed = new Date(completedDate)
    const nextDue = new Date(completed)
    nextDue.setFullYear(completed.getFullYear() + 1)
    return nextDue
  }

  const getMLRStatusInfo = (status: string) => {
    return MLR_STATUS_CONFIG[status as keyof typeof MLR_STATUS_CONFIG] || MLR_STATUS_CONFIG.pending
  }

  const isMLROverdue = (completedDate?: string) => {
    if (!completedDate) return false
    const nextDue = getNextMLRDueDate(completedDate)
    if (!nextDue) return false
    return new Date() > nextDue
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !mlrData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error || 'MLR information not found'}</p>
        <button 
          onClick={loadMLRData}
          className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
        >
          Try again
        </button>
      </div>
    )
  }

  const statusInfo = getMLRStatusInfo(mlrData.mlr_status)
  const StatusIcon = statusInfo.icon
  const nextDueDate = getNextMLRDueDate(mlrData.mlr_date_complete)
  const isOverdue = isMLROverdue(mlrData.mlr_date_complete)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Money Laundering Regulations (MLR)</h2>
          <p className="text-sm text-gray-600">Customer due diligence and MLR compliance status</p>
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

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">MLR Status Overview</h3>
            <p className="text-sm text-gray-600">Current compliance status for this customer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`border rounded-lg p-4 ${statusInfo.color}`}>
            <div className="flex items-center space-x-2 mb-2">
              <StatusIcon className="h-5 w-5" />
              <span className="font-medium">{statusInfo.label}</span>
            </div>
            <p className="text-sm">{statusInfo.description}</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-900">Last Check</span>
            </div>
            <p className="text-sm text-gray-600">{formatDate(mlrData.mlr_date_complete)}</p>
          </div>

          <div className={`border rounded-lg p-4 ${
            isOverdue 
              ? 'border-red-200 bg-red-50' 
              : nextDueDate 
                ? 'border-yellow-200 bg-yellow-50' 
                : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className={`h-5 w-5 ${
                isOverdue ? 'text-red-500' : nextDueDate ? 'text-yellow-500' : 'text-gray-500'
              }`} />
              <span className={`font-medium ${
                isOverdue ? 'text-red-900' : nextDueDate ? 'text-yellow-900' : 'text-gray-900'
              }`}>
                Next Due
              </span>
            </div>
            <p className={`text-sm ${
              isOverdue ? 'text-red-600' : nextDueDate ? 'text-yellow-600' : 'text-gray-600'
            }`}>
              {nextDueDate ? formatDate(nextDueDate.toISOString()) : 'Not scheduled'}
            </p>
            {isOverdue && (
              <p className="text-xs text-red-600 mt-1 font-medium">Overdue</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Status & Timeline</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MLR Status</label>
              {isEditing ? (
                <select
                  value={editData.mlr_status || ''}
                  onChange={(e) => setEditData({ ...editData, mlr_status: e.target.value })}
                  className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="complete">Complete</option>
                  <option value="not_required">Not Required</option>
                </select>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editData.mlr_date_complete || ''}
                  onChange={(e) => setEditData({ ...editData, mlr_date_complete: e.target.value })}
                  className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-sm text-gray-900">{formatDate(mlrData.mlr_date_complete)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <IdentificationIcon className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Identification Documents</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.passport_number || ''}
                    onChange={(e) => setEditData({ ...editData, passport_number: e.target.value })}
                    className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter passport number"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{mlrData.passport_number || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CreditCardIcon className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Driving License</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.driving_license || ''}
                    onChange={(e) => setEditData({ ...editData, driving_license: e.target.value })}
                    className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter driving license number"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{mlrData.driving_license || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">UK Home Telephone</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.uk_home_telephone || ''}
                    onChange={(e) => setEditData({ ...editData, uk_home_telephone: e.target.value })}
                    className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter UK home telephone"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{mlrData.uk_home_telephone || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {mlrData.last_edited && mlrData.last_edited_by && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ClockIcon className="h-4 w-4" />
            <span>
              Last updated on {formatDateTime(mlrData.last_edited)} by {mlrData.last_edited_by.email}
            </span>
          </div>
        </div>
      )}
    </div>
  )
} 