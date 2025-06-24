'use client'

import React from 'react'
import AppLayout from '../../components/layout/AppLayout'

export default function DocumentsPage() {
  return (
    <AppLayout>
      <DocumentsContent />
    </AppLayout>
  )
}

function DocumentsContent() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage and organize client documents and files
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Document management interface will be implemented here.</p>
      </div>
    </div>
  )
} 