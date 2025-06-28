'use client'

import React from 'react'

interface CustomerDetailAddressTabProps {
  customer: any
  onFieldChange: (key: string, value: string | boolean | number) => void
  isEditing: boolean
}

export default function CustomerDetailAddressTab({ customer, onFieldChange, isEditing }: CustomerDetailAddressTabProps) {
  return (
    <div className="space-y-6">
      <p className="text-gray-500">Address tab content - component will be fully implemented</p>
      <div>
        <label>Address: {customer.address_line_1 || 'Not provided'}</label>
      </div>
      <div>
        <label>City: {customer.town_city || 'Not provided'}</label>
      </div>
    </div>
  )
} 