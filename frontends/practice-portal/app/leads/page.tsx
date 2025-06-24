'use client'

import React from 'react'
import AppLayout from '../../components/layout/AppLayout'

export default function LeadsPage() {
  return (
    <AppLayout>
      <LeadsContent />
    </AppLayout>
  )
}

function LeadsContent() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage and track potential clients
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Leads management interface will be implemented here.</p>
      </div>
    </div>
  )
} 