'use client'

import React from 'react'
import AppLayout from '../../components/layout/AppLayout'

export default function ReportingPage() {
  return (
    <AppLayout>
      <ReportingContent />
    </AppLayout>
  )
}

function ReportingContent() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reporting</h1>
        <p className="mt-1 text-sm text-gray-600">
          Generate and view business reports and analytics
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Reporting and analytics interface will be implemented here.</p>
      </div>
    </div>
  )
} 