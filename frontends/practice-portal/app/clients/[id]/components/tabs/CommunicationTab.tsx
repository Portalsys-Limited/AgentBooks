'use client'

import React from 'react'

export default function CommunicationTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Communications</h3>
        <p className="text-gray-500">Communication history will be displayed here.</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Communication Settings</h3>
        <p className="text-gray-500">Communication preferences will be displayed here.</p>
      </div>
    </div>
  )
} 