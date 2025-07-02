'use client'

import React, { useState } from 'react'
import BaseModal from './BaseModal'
import { createIncome, updateIncome } from '../../../../../lib/individuals/service'

interface IncomeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  individualId: string
  income?: any
}

export default function IncomeModal({ 
  isOpen, 
  onClose, 
  onSave, 
  individualId, 
  income 
}: IncomeModalProps) {
  const [formData, setFormData] = useState({
    income_type: income?.income_type || 'employment',
    income_amount: income?.income_amount || '',
    description: income?.description || ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const incomeTypes = [
    { value: 'employment', label: 'Employment' },
    { value: 'self_employment', label: 'Self Employment' },
    { value: 'rental', label: 'Rental' },
    { value: 'dividend', label: 'Dividend' },
    { value: 'interest', label: 'Interest' },
    { value: 'pension', label: 'Pension' },
    { value: 'other', label: 'Other' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    
    try {
      const data = {
        ...formData,
        income_amount: parseFloat(formData.income_amount.toString())
      }
      
      if (income) {
        await updateIncome(income.id, data)
      } else {
        await createIncome(individualId, data)
      }
      
      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving income:', error)
      setError('Failed to save income. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      setFormData({
        income_type: income?.income_type || 'employment',
        income_amount: income?.income_amount || '',
        description: income?.description || ''
      })
      setError(null)
      onClose()
    }
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={income ? 'Edit Income' : 'Add Income'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Income Type
            </label>
            <select
              value={formData.income_type}
              onChange={(e) => setFormData({...formData, income_type: e.target.value})}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              {incomeTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (£)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.income_amount}
              onChange={(e) => setFormData({...formData, income_amount: e.target.value})}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="0.00"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            rows={3}
            placeholder="Optional description..."
          />
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
            {isSaving ? 'Saving...' : 'Save Income'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
} 