'use client'

import React from 'react'
import { ComputerDesktopIcon } from '@heroicons/react/24/outline'
import ClientFormSection from '../ClientFormSection'

export default function ClientAccountingSoftwareTab({ client, onFieldChange }: any) {
  return (
    <div className="max-w-4xl">
      <ClientFormSection
        title="Accounting Software"
        icon={ComputerDesktopIcon}
        isInitiallyExpanded={true}
      >
        <p className="text-gray-500">Accounting software form coming soon...</p>
      </ClientFormSection>
    </div>
  )
} 