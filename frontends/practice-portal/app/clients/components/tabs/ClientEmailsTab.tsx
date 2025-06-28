'use client'

import React from 'react'
import { EnvelopeIcon } from '@heroicons/react/24/outline'
import ClientFormSection from '../ClientFormSection'

export default function ClientEmailsTab({ client, onFieldChange }: any) {
  return (
    <div className="max-w-4xl">
      <ClientFormSection
        title="Email Addresses"
        icon={EnvelopeIcon}
        isInitiallyExpanded={true}
      >
        <p className="text-gray-500">Emails form coming soon...</p>
      </ClientFormSection>
    </div>
  )
} 