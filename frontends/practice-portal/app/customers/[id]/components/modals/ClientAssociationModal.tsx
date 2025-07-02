'use client'

import React, { useState, useEffect } from 'react'
import BaseModal from './BaseModal'
import { 
  CustomerClientAssociationCreate, 
  CustomerClientAssociationUpdate,
  AvailableClient,
  EnumOption
} from '../../../../../lib/customers/types'
import { 
  getAvailableClientsForCustomer,
  getClientRelationshipTypes
} from '../../../../../lib/customers/service'

interface ClientAssociationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CustomerClientAssociationCreate | CustomerClientAssociationUpdate) => Promise<void>
  customerId: string
  editData?: {
    id: string
    client_id: string
    relationship_type: string
    percentage_ownership?: string
    appointment_date?: string
    resignation_date?: string
    is_active?: string
    is_primary_contact?: boolean
    notes?: string
  }
}

export default function ClientAssociationModal({
  isOpen,
  onClose,
  onSave,
  customerId,
  editData
}: ClientAssociationModalProps) {
  const [formData, setFormData] = useState<CustomerClientAssociationCreate | CustomerClientAssociationUpdate>({
    client_id: '',
    relationship_type: '',
    percentage_ownership: '',
    appointment_date: '',
    resignation_date: '',
    is_active: 'active',
    is_primary_contact: false,
    notes: ''
  })
  const [availableClients, setAvailableClients] = useState<AvailableClient[]>([])
  const [relationshipTypes, setRelationshipTypes] = useState<EnumOption[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadDropdownData()
      if (editData) {
        setFormData({
          relationship_type: editData.relationship_type,
          percentage_ownership: editData.percentage_ownership || '',
          appointment_date: editData.appointment_date ? editData.appointment_date.split('T')[0] : '',
          resignation_date: editData.resignation_date ? editData.resignation_date.split('T')[0] : '',
          is_active: editData.is_active || 'active',
          is_primary_contact: editData.is_primary_contact || false,
          notes: editData.notes || ''
        })
      } else {
        setFormData({
          client_id: '',
          relationship_type: '',
          percentage_ownership: '',
          appointment_date: '',
          resignation_date: '',
          is_active: 'active',
          is_primary_contact: false,
          notes: ''
        })
      }
    }
  }, [isOpen, editData])

  const loadDropdownData = async () => {
    try {
      setLoading(true)
      const [clients, types] = await Promise.all([
        getAvailableClientsForCustomer(customerId),
        getClientRelationshipTypes()
      ])
      setAvailableClients(clients)
      setRelationshipTypes(types)
    } catch (err) {
      console.error('Error loading dropdown data:', err)
      setError('Failed to load form data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.relationship_type) {
      setError('Relationship type is required')
      return
    }

    if (!editData && !('client_id' in formData && formData.client_id)) {
      setError('Client selection is required')
      return
    }

    try {
      setSaving(true)
      setError(null)
      
      const submitData = {
        ...formData,
        appointment_date: formData.appointment_date || undefined,
        resignation_date: formData.resignation_date || undefined,
        percentage_ownership: formData.percentage_ownership || undefined,
        notes: formData.notes || undefined
      }

      await onSave(submitData)
      onClose()
    } catch (err: any) {
      console.error('Error saving association:', err)
      setError(err.data?.detail || 'Failed to save association')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Client Association' : 'Add Client Association'}
      size="lg"
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {!editData && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <select
                value={('client_id' in formData) ? formData.client_id : ''}
                onChange={(e) => handleInputChange('client_id', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select a client...</option>
                {availableClients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.business_name} {client.business_type && `(${client.business_type})`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship Type *
            </label>
            <select
              value={formData.relationship_type}
              onChange={(e) => handleInputChange('relationship_type', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select relationship type...</option>
              {relationshipTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percentage Ownership
              </label>
              <input
                type="text"
                value={formData.percentage_ownership || ''}
                onChange={(e) => handleInputChange('percentage_ownership', e.target.value)}
                placeholder="e.g., 25%"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.is_active || 'active'}
                onChange={(e) => handleInputChange('is_active', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="resigned">Resigned</option>
                <option value="removed">Removed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Date
              </label>
              <input
                type="date"
                value={formData.appointment_date || ''}
                onChange={(e) => handleInputChange('appointment_date', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resignation Date
              </label>
              <input
                type="date"
                value={formData.resignation_date || ''}
                onChange={(e) => handleInputChange('resignation_date', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_primary_contact || false}
                onChange={(e) => handleInputChange('is_primary_contact', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Primary contact for this client</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Additional notes about this association..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            >
              {saving ? 'Saving...' : (editData ? 'Update' : 'Create')} Association
            </button>
          </div>
        </form>
      )}
    </BaseModal>
  )
} 