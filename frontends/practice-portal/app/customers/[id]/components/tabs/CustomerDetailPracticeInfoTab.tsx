'use client'

import React from 'react'

interface CustomerDetailPracticeInfoTabProps {
  customer: any
  onFieldChange: (key: string, value: string | boolean | number) => void
  isEditing: boolean
}

export default function CustomerDetailPracticeInfoTab({ customer, onFieldChange, isEditing }: CustomerDetailPracticeInfoTabProps) {
  return (
    <div className="space-y-6">
      <p className="text-gray-500">Practice Info tab content - component will be fully implemented</p>
      <div>
        <label>Primary Accounting Contact: {customer.primary_accounting_contact || 'Not provided'}</label>
      </div>
    </div>
  )
} 