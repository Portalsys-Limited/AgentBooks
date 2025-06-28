'use client'

import React from 'react'

interface CustomerDetailBasicInfoTabProps {
  customer: any
  onFieldChange: (key: string, value: string | boolean | number) => void
  isEditing: boolean
}

export default function CustomerDetailBasicInfoTab({ customer, onFieldChange, isEditing }: CustomerDetailBasicInfoTabProps) {
  return (
    <div className="space-y-6">
      <p className="text-gray-500">Basic Info tab content - component will be fully implemented</p>
      <div>
        <label>First Name: {customer.first_name || 'Not provided'}</label>
      </div>
      <div>
        <label>Last Name: {customer.last_name || 'Not provided'}</label>
      </div>
    </div>
  )
} 