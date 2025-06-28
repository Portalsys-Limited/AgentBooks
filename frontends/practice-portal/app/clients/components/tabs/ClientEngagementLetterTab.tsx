'use client'

import React from 'react'
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import ClientFormSection from '../ClientFormSection'

export default function ClientEngagementLetterTab({ client, onFieldChange }: any) {
  return (
    <div className="max-w-4xl">
      <ClientFormSection
        title="Engagement Letter"
        icon={ClipboardDocumentListIcon}
        isInitiallyExpanded={true}
      >
        <p className="text-gray-500">Engagement letter form coming soon...</p>
      </ClientFormSection>
    </div>
  )
} 