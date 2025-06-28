'use client'

import React from 'react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import ClientFormSection from '../ClientFormSection'

export default function ClientTradingAddressTab({ client, onFieldChange }: any) {
  return (
    <div className="max-w-4xl">
      <ClientFormSection
        title="Trading Address"
        icon={MapPinIcon}
        isInitiallyExpanded={true}
      >
        <p className="text-gray-500">Trading address form coming soon...</p>
      </ClientFormSection>
    </div>
  )
} 