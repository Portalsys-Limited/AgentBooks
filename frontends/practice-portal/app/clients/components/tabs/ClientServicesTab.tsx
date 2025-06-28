'use client'

import React from 'react'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import ClientFormSection from '../ClientFormSection'

export default function ClientServicesTab({ client, onFieldChange }: any) {
  return (
    <div className="max-w-4xl">
      <ClientFormSection
        title="Services"
        icon={ChartBarIcon}
        isInitiallyExpanded={true}
      >
        <p className="text-gray-500">Services form coming soon...</p>
      </ClientFormSection>
    </div>
  )
} 