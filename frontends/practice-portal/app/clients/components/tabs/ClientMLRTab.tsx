'use client'

import React from 'react'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import ClientFormSection from '../ClientFormSection'

export default function ClientMLRTab({ client, onFieldChange }: any) {
  return (
    <div className="max-w-4xl">
      <ClientFormSection
        title="Money Laundering Regulations (MLR)"
        icon={ShieldCheckIcon}
        isInitiallyExpanded={true}
      >
        <p className="text-gray-500">MLR form coming soon...</p>
      </ClientFormSection>
    </div>
  )
} 