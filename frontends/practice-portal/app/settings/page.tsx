'use client'

import React from 'react'
import AppLayout from '../../components/layout/AppLayout'

export default function SettingsPage() {
  return (
    <AppLayout>
      <SettingsContent />
    </AppLayout>
  )
}

function SettingsContent() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Practice Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure practice preferences and system settings
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">Practice settings interface will be implemented here.</p>
      </div>
    </div>
  )
} 