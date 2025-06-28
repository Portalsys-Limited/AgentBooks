'use client'

import React, { useState, ReactNode } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface ClientDetailSectionProps {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: ReactNode
  isInitiallyExpanded?: boolean
}

export default function ClientDetailSection({
  title,
  icon: Icon,
  children,
  isInitiallyExpanded = false
}: ClientDetailSectionProps) {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded)

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
        data-reactid={`client-detail-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="mt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  )
} 