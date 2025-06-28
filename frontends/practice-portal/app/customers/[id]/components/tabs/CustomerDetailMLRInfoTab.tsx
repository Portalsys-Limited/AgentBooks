'use client'

import React from 'react'

interface CustomerDetailMLRInfoTabProps {
  customer: any
  onFieldChange: (key: string, value: string | boolean | number) => void
  isEditing: boolean
}

export default function CustomerDetailMLRInfoTab({ customer, onFieldChange, isEditing }: CustomerDetailMLRInfoTabProps) {
  return (
    <div className="space-y-6">
      <p className="text-gray-500">MLR Info tab content - component will be fully implemented</p>
      <div>
        <label>MLR Status: {customer.mlr_status || 'Not provided'}</label>
      </div>
    </div>
  )
} 