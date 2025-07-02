'use client'

import React, { useState } from 'react'
import BaseModal from './BaseModal'
import { 
  createPropertyForIndividual, 
  updatePropertyRelationship 
} from '../../../../../lib/individuals/service'

interface PropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  individualId: string
  property?: any
  relationship?: any
}

export default function PropertyModal({ 
  isOpen, 
  onClose, 
  onSave, 
  individualId, 
  property, 
  relationship 
}: PropertyModalProps) {
  const [formData, setFormData] = useState({
    // Property data
    property_name: property?.property_name || '',
    property_type: property?.property_type || 'residential',
    address_line_1: property?.address_line_1 || '',
    address_line_2: property?.address_line_2 || '',
    town: property?.town || '',
    county: property?.county || '',
    post_code: property?.post_code || '',
    current_value: property?.current_value || '',
    monthly_rental_income: property?.monthly_rental_income || '',
    
    // Relationship data
    ownership_type: relationship?.ownership_type || 'sole_owner',
    ownership_percentage: relationship?.ownership_percentage || 100,
    is_primary_owner: relationship?.is_primary_owner || false,
    start_date: relationship?.start_date 
      ? new Date(relationship.start_date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const propertyTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'land', label: 'Land' },
    { value: 'mixed_use', label: 'Mixed Use' },
    { value: 'other', label: 'Other' }
  ]

  const ownershipTypes = [
    { value: 'sole_owner', label: 'Sole Owner' },
    { value: 'joint_owner', label: 'Joint Owner' },
    { value: 'beneficial_owner', label: 'Beneficial Owner' },
    { value: 'trustee', label: 'Trustee' },
    { value: 'tenant', label: 'Tenant' },
    { value: 'other', label: 'Other' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    
    try {
      if (!property) {
        // Creating new property
        const propertyData = {
          property_name: formData.property_name,
          property_type: formData.property_type,
          address_line_1: formData.address_line_1,
          address_line_2: formData.address_line_2,
          town: formData.town,
          county: formData.county,
          post_code: formData.post_code,
          current_value: formData.current_value ? parseFloat(formData.current_value.toString()) : undefined,
          monthly_rental_income: formData.monthly_rental_income ? parseFloat(formData.monthly_rental_income.toString()) : undefined
        }
        
        const relationshipData = {
          ownership_type: formData.ownership_type,
          ownership_percentage: parseFloat(formData.ownership_percentage.toString()),
          is_primary_owner: formData.is_primary_owner,
          start_date: formData.start_date
        }
        
        await createPropertyForIndividual(individualId, propertyData, relationshipData)
      } else {
        // Update existing relationship
        const relationshipData = {
          ownership_type: formData.ownership_type,
          ownership_percentage: parseFloat(formData.ownership_percentage.toString()),
          is_primary_owner: formData.is_primary_owner,
          start_date: formData.start_date
        }
        
        await updatePropertyRelationship(property.id, relationship.id, relationshipData)
      }
      
      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving property:', error)
      setError('Failed to save property. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      setFormData({
        property_name: property?.property_name || '',
        property_type: property?.property_type || 'residential',
        address_line_1: property?.address_line_1 || '',
        address_line_2: property?.address_line_2 || '',
        town: property?.town || '',
        county: property?.county || '',
        post_code: property?.post_code || '',
        current_value: property?.current_value || '',
        monthly_rental_income: property?.monthly_rental_income || '',
        ownership_type: relationship?.ownership_type || 'sole_owner',
        ownership_percentage: relationship?.ownership_percentage || 100,
        is_primary_owner: relationship?.is_primary_owner || false,
        start_date: relationship?.start_date 
          ? new Date(relationship.start_date).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0]
      })
      setError(null)
      onClose()
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={property ? 'Edit Property' : 'Add Property'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {/* Property Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Property Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Name
              </label>
              <input
                type="text"
                value={formData.property_name}
                onChange={(e) => setFormData({...formData, property_name: e.target.value})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., Main Residence, Rental Property #1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select
                value={formData.property_type}
                onChange={(e) => setFormData({...formData, property_type: e.target.value})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1
              </label>
              <input
                type="text"
                value={formData.address_line_1}
                onChange={(e) => setFormData({...formData, address_line_1: e.target.value})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., 123 Main Street"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.address_line_2}
                onChange={(e) => setFormData({...formData, address_line_2: e.target.value})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Town
              </label>
              <input
                type="text"
                value={formData.town}
                onChange={(e) => setFormData({...formData, town: e.target.value})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., London"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                County
              </label>
              <input
                type="text"
                value={formData.county}
                onChange={(e) => setFormData({...formData, county: e.target.value})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., Greater London"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Post Code
              </label>
              <input
                type="text"
                value={formData.post_code}
                onChange={(e) => setFormData({...formData, post_code: e.target.value})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., SW1A 1AA"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Value (£)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.current_value}
                onChange={(e) => setFormData({...formData, current_value: e.target.value})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rental Income (£)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.monthly_rental_income}
                onChange={(e) => setFormData({...formData, monthly_rental_income: e.target.value})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
        
        {/* Ownership Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Ownership Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ownership Type
              </label>
              <select
                value={formData.ownership_type}
                onChange={(e) => setFormData({...formData, ownership_type: e.target.value})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                {ownershipTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ownership Percentage
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.ownership_percentage}
                onChange={(e) => setFormData({...formData, ownership_percentage: parseFloat(e.target.value) || 0})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_primary_owner}
                onChange={(e) => setFormData({...formData, is_primary_owner: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Primary Owner</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Property'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
} 