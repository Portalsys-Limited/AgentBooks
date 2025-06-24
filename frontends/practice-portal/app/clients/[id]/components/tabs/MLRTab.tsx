'use client'

import React from 'react'

export default function MLRTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">MLR Status</h3>
        <p className="text-gray-500">Money Laundering Regulations information will be displayed here.</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Documents</h3>
        <p className="text-gray-500">Compliance documentation will be displayed here.</p>
      </div>
    </div>
  )
} 