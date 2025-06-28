'use client'

import React from 'react'
import { UsersIcon } from '@heroicons/react/24/outline'
import ClientFormSection from '../ClientFormSection'

export default function ClientPracticeInfoTab({ client, onFieldChange }: any) {
  return (
    <div className="max-w-4xl">
      <ClientFormSection
        title="Practice Information"
        icon={UsersIcon}
        isInitiallyExpanded={true}
      >
        <p className="text-gray-500">Practice info form coming soon...</p>
      </ClientFormSection>
    </div>
  )
} 