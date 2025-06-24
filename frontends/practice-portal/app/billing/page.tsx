'use client'

import React from 'react'
import AppLayout from '../../components/layout/AppLayout'

export default function BillingPage() {
  return (
    <AppLayout>
      <BillingContent />
    </AppLayout>
  )
}

function BillingContent() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage invoices, payments, and billing information
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Billing management interface will be implemented here.</p>
      </div>
    </div>
  )
} 