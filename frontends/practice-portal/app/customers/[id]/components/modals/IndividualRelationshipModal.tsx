'use client'

import React, { useState, useEffect } from 'react'
import BaseModal from './BaseModal'
import { 
  IndividualRelationshipCreate, 
  IndividualRelationshipUpdate,
  AvailableIndividual,
  EnumOption
} from '../../../../../lib/customers/types'
import { 
  getAvailableIndividualsForCustomer,
  getIndividualRelationshipTypes
} from '../../../../../lib/customers/service'

interface IndividualRelationshipModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: IndividualRelationshipCreate | IndividualRelationshipUpdate) => Promise<void>
  customerId: string
  editData?: {
    id: string
    to_individual_id: string
    relationship_type: string
    description?: string
  }
}

export default function IndividualRelationshipModal({
  isOpen,
  onClose,
  onSave,
  customerId,
  editData
}: IndividualRelationshipModalProps) {
  const [formData, setFormData] = useState<IndividualRelationshipCreate | IndividualRelationshipUpdate>({
    to_individual_id: '',
    relationship_type: '',
    description: ''
  })
  const [availableIndividuals, setAvailableIndividuals] = useState<AvailableIndividual[]>([])
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
          description: editData.description || ''
        })
      } else {
        setFormData({
          to_individual_id: '',
          relationship_type: '',
          description: ''
        })
      }
    }
  }, [isOpen, editData])

  const loadDropdownData = async () => {
    try {
      setLoading(true)
      const [individuals, types] = await Promise.all([
        getAvailableIndividualsForCustomer(customerId),
        getIndividualRelationshipTypes()
      ])
      setAvailableIndividuals(individuals)
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

    if (!editData && !('to_individual_id' in formData && formData.to_individual_id)) {
      setError('Individual selection is required')
      return
    }

    try {
      setSaving(true)
      setError(null)
      
      const submitData = {
        ...formData,
        description: formData.description || undefined
      }

      await onSave(submitData)
      onClose()
    } catch (err) {
      console.error('Error saving relationship:', err)
      setError('Failed to save relationship')
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
      title={editData ? 'Edit Individual Relationship' : 'Add Individual Relationship'}
      size="md"
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
                Individual *
              </label>
              <select
                value={('to_individual_id' in formData) ? formData.to_individual_id : ''}
                onChange={(e) => handleInputChange('to_individual_id', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select an individual...</option>
                {availableIndividuals.map(individual => (
                  <option key={individual.id} value={individual.id}>
                    {individual.full_name} {individual.email && `(${individual.email})`}
                  </option>
                ))}
              </select>
              {availableIndividuals.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  No available individuals to create relationships with.
                </p>
              )}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Additional details about this relationship..."
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
              disabled={saving || (availableIndividuals.length === 0 && !editData)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            >
              {saving ? 'Saving...' : (editData ? 'Update' : 'Create')} Relationship
            </button>
          </div>
        </form>
      )}
    </BaseModal>
  )
} 