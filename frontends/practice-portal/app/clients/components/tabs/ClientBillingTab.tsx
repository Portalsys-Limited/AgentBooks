'use client'

import React from 'react'
import { CurrencyPoundIcon } from '@heroicons/react/24/outline'
import ClientFormSection from '../ClientFormSection'

export default function ClientBillingTab({ client, onFieldChange }: any) {
  return (
    <div className="max-w-4xl">
      <ClientFormSection
        title="Billing Information"
        icon={CurrencyPoundIcon}
        isInitiallyExpanded={true}
      >
        <p className="text-gray-500">Billing form coming soon...</p>
      </ClientFormSection>
    </div>
  )
} 