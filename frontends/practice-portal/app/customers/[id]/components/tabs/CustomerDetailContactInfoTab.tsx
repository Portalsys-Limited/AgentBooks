'use client'

import React from 'react'

interface CustomerDetailContactInfoTabProps {
  customer: any
  onFieldChange: (key: string, value: string | boolean | number) => void
  isEditing: boolean
}

export default function CustomerDetailContactInfoTab({ customer, onFieldChange, isEditing }: CustomerDetailContactInfoTabProps) {
  return (
    <div className="space-y-6">
      <p className="text-gray-500">Contact Info tab content - component will be fully implemented</p>
      <div>
        <label>Email: {customer.email || 'Not provided'}</label>
      </div>
      <div>
        <label>Phone: {customer.primary_mobile_number || 'Not provided'}</label>
      </div>
    </div>
  )
} 