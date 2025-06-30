'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  UserIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UsersIcon,
  ArrowLeftIcon,
  MapPinIcon,
  ChartBarIcon,
  CurrencyPoundIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  IdentificationIcon
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
  individual_id?: string
}

interface ClientProfile {
  initials: string
  name: string
  id: string
  email?: string
  business_type?: string
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
  clientProfile?: ClientProfile
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
  customerProfile,
  clientProfile
}: SecondaryTopNavBarProps) {
  const router = useRouter()

  const handleCommunicationClick = () => {
    if (customerProfile) {
      // Use individual_id if available, otherwise fall back to customer id
      const individualId = customerProfile.individual_id || customerProfile.id
      // Navigate to communication page with individual filter
      router.push(`/communication?individual_id=${individualId}&individual_name=${encodeURIComponent(customerProfile.name)}`)
    } else if (clientProfile) {
      // Navigate to communication page with client filter
      router.push(`/communication?client_id=${clientProfile.id}&client_name=${encodeURIComponent(clientProfile.name)}`)
    }
  }

  return (
    <div className={`bg-white shadow-sm ${className}`}>
      {/* Customer/Client Profile Section */}
      {(customerProfile || clientProfile) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className={`h-12 w-12 ${clientProfile ? 'bg-green-600' : 'bg-blue-600'} rounded-lg flex items-center justify-center text-white text-xl font-semibold`}>
              {customerProfile ? customerProfile.initials : clientProfile?.initials}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  {customerProfile ? customerProfile.name : clientProfile?.name}
                </h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                  (customerProfile?.status || clientProfile?.status) === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {customerProfile?.status || clientProfile?.status}
                </span>
              </div>
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <span className="font-mono">{customerProfile ? customerProfile.id : clientProfile?.id}</span>
                </span>
                {customerProfile && <span>{customerProfile.email}</span>}
                {clientProfile && clientProfile.email && <span>{clientProfile.email}</span>}
                {clientProfile && clientProfile.business_type && <span>{clientProfile.business_type}</span>}
              </div>
            </div>

            {/* Communication Button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCommunicationClick}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1.5" />
                Message
              </button>
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

          {/* Right side - Actions (only shown on information or basic-info tab) */}
          {(activeTab === 'information' || activeTab === 'basic-info') && actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}

// Remove communication tab from the default tabs since it's now a button
export const CUSTOMER_TABS: SecondaryNavTab[] = [
  { id: 'information', name: 'Customer Information', icon: UserIcon },
  { id: 'tasks', name: 'Tasks', icon: ClipboardDocumentListIcon },
  { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
  { id: 'mlr', name: 'MLR', icon: ShieldCheckIcon },
  { id: 'relationships', name: 'Relationships', icon: UsersIcon }
]

export const CLIENT_TABS: SecondaryNavTab[] = [
  { id: 'basic-info', name: 'Basic Info', icon: IdentificationIcon },
  { id: 'company-data', name: 'Company Data', icon: DocumentTextIcon },
  { id: 'business-address', name: 'Business Address', icon: MapPinIcon },
  { id: 'trading-address', name: 'Trading Address', icon: MapPinIcon },
  { id: 'mlr', name: 'MLR', icon: ShieldCheckIcon },
  { id: 'services', name: 'Services', icon: ChartBarIcon },
  { id: 'accounting-software', name: 'Accounting Software', icon: ComputerDesktopIcon },
  { id: 'billing', name: 'Billing', icon: CurrencyPoundIcon },
  { id: 'practice-info', name: 'Practice Info', icon: UsersIcon },
  { id: 'engagement-letter', name: 'Engagement Letter', icon: ClipboardDocumentListIcon },
  { id: 'companies-house-data', name: 'Companies House Data', icon: DocumentTextIcon },
  { id: 'company-details', name: 'Company Details', icon: GlobeAltIcon },
  { id: 'emails', name: 'Emails', icon: EnvelopeIcon },
  { id: 'linked-customers', name: 'Linked Customers', icon: UsersIcon },
  { id: 'tasks', name: 'Tasks', icon: ClipboardDocumentListIcon }
]
