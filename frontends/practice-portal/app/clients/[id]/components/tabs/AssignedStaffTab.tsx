'use client'

import React from 'react'

export default function AssignedStaffTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Staff</h3>
        <p className="text-gray-500">Primary assigned staff will be displayed here.</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Support Staff</h3>
        <p className="text-gray-500">Support staff information will be displayed here.</p>
      </div>
    </div>
  )
} 