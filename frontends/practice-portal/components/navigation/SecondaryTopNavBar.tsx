'use client'

import React from 'react'
import { 
  UserIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UsersIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

export interface SecondaryNavTab {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
  disabled?: boolean
}

interface BreadcrumbItem {
  label: string
  href?: string
}

interface CustomerProfile {
  initials: string
  name: string
  id: string
  email: string
  status: 'Active' | 'Inactive'
}

interface SecondaryTopNavBarProps {
  tabs: SecondaryNavTab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
  breadcrumbs?: {
    items: BreadcrumbItem[]
    onBack: () => void
  }
  customerProfile?: CustomerProfile
}

export default function SecondaryTopNavBar({
  tabs,
  activeTab,
  onTabChange,
  title,
  subtitle,
  actions,
  className = '',
  breadcrumbs,
  customerProfile
}: SecondaryTopNavBarProps) {
  return (
    <div className={`bg-white shadow-sm ${className}`}>
      {/* Customer Profile Section */}
      {customerProfile && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Customer Avatar */}
            <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-semibold">
              {customerProfile.initials}
            </div>
            
            {/* Customer Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-gray-900">{customerProfile.name}</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                  customerProfile.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {customerProfile.status}
                </span>
              </div>
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <span className="font-mono">{customerProfile.id}</span>
                </span>
                <span>{customerProfile.email}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      {(title || subtitle) && (
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="px-6">
        <nav className="-mb-px flex items-center justify-between" aria-label="Tabs">
          {/* Left side - Tab Buttons */}
          <div className="flex items-center space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const isDisabled = tab.disabled
              
              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && onTabChange(tab.id)}
                  disabled={isDisabled}
                  className={`${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : isDisabled
                      ? 'border-transparent text-gray-400 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      isActive 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Right side - Actions (only shown on information tab) */}
          {activeTab === 'information' && actions && (
            <div className="flex items-center border-b-2 border-transparent py-4">
              {actions}
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}

// Pre-defined tab configurations for common use cases
export const CUSTOMER_TABS: SecondaryNavTab[] = [
  { id: 'information', name: 'Customer Information', icon: UserIcon },
  { id: 'tasks', name: 'Tasks', icon: ClipboardDocumentListIcon },
  { id: 'communication', name: 'Communication', icon: ChatBubbleLeftRightIcon },
  { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
  { id: 'mlr', name: 'MLR', icon: ShieldCheckIcon },
  { id: 'relationships', name: 'Relationships', icon: UsersIcon }
]
