'use client'

import React from 'react'

interface CustomerDetailIncomeInfoTabProps {
  customer: any
  onFieldChange: (key: string, value: string | boolean | number) => void
  isEditing: boolean
}

export default function CustomerDetailIncomeInfoTab({ customer, onFieldChange, isEditing }: CustomerDetailIncomeInfoTabProps) {
  return (
    <div className="space-y-6">
      <p className="text-gray-500">Income Info tab content - component will be fully implemented</p>
      <div>
        <label>Rental Income: £{customer.rental_income || '0.00'}</label>
      </div>
    </div>
  )
} 