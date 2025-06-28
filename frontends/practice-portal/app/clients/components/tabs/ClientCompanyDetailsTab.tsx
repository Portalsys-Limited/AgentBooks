'use client'

import React from 'react'
import { GlobeAltIcon } from '@heroicons/react/24/outline'
import ClientFormSection from '../ClientFormSection'

export default function ClientCompanyDetailsTab({ client, onFieldChange }: any) {
  return (
    <div className="max-w-4xl">
      <ClientFormSection
        title="Company Details"
        icon={GlobeAltIcon}
        isInitiallyExpanded={true}
      >
        <p className="text-gray-500">Company details form coming soon...</p>
      </ClientFormSection>
    </div>
  )
} 