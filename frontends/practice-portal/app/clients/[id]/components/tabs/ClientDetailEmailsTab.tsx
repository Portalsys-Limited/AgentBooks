'use client'

import React, { useState } from 'react'
import { EnvelopeIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import ClientDetailSection from '../ClientDetailSection'

interface Email {
  id: string
  email: string
  type: string
  is_primary: boolean
}

interface ClientDetail {
  emails?: Email[]
}

interface ClientDetailEmailsTabProps {
  client: ClientDetail
  onFieldChange: (key: string, value: string | boolean | number | string[]) => void
  isEditing: boolean
}

export default function ClientDetailEmailsTab({ client, onFieldChange, isEditing }: ClientDetailEmailsTabProps) {
  const [newEmail, setNewEmail] = useState({ email: '', type: 'general', is_primary: false })

  const addEmail = () => {
    const emails = client.emails || []
    const newEmailWithId = {
      ...newEmail,
      id: Date.now().toString(), // Simple ID generation
      is_primary: emails.length === 0 ? true : newEmail.is_primary // First email is primary by default
    }
    
    onFieldChange('emails', [...emails, newEmailWithId] as any)
    setNewEmail({ email: '', type: 'general', is_primary: false })
  }

  const removeEmail = (emailId: string) => {
    const emails = client.emails || []
    const updatedEmails = emails.filter(e => e.id !== emailId)
    onFieldChange('emails', updatedEmails as any)
  }

  const updateEmail = (emailId: string, field: string, value: string | boolean) => {
    const emails = client.emails || []
    const updatedEmails = emails.map(email => {
      if (email.id === emailId) {
        // If setting as primary, unset other primaries
        if (field === 'is_primary' && value === true) {
          emails.forEach(e => e.is_primary = false)
        }
        return { ...email, [field]: value }
      }
      return email
    })
    onFieldChange('emails', updatedEmails as any)
  }

  return (
    <div className="max-w-4xl">
      {/* Emails Section */}
      <ClientDetailSection
        title="Email Addresses"
        icon={EnvelopeIcon}
        isInitiallyExpanded={true}
      >
        <div className="space-y-4">
          {/* Existing Emails */}
          {client.emails && client.emails.length > 0 ? (
            <div className="space-y-3">
              {client.emails.map((email, index) => (
                <div key={email.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg" data-reactid={`email-${index}`}>
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="email"
                        value={email.email}
                        onChange={(e) => updateEmail(email.id, 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <a href={`mailto:${email.email}`} className="text-blue-600 hover:text-blue-800 underline">
                          {email.email}
                        </a>
                        {email.is_primary && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Primary
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="w-32">
                    {isEditing ? (
                      <select
                        value={email.type}
                        onChange={(e) => updateEmail(email.id, 'type', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="general">General</option>
                        <option value="billing">Billing</option>
                        <option value="accounts">Accounts</option>
                        <option value="payroll">Payroll</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <span className="text-sm text-gray-600 capitalize">{email.type}</span>
                    )}
                  </div>
                  
                  {isEditing && (
                    <>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={email.is_primary}
                          onChange={(e) => updateEmail(email.id, 'is_primary', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-1 text-sm text-gray-600">Primary</label>
                      </div>
                      
                      <button
                        onClick={() => removeEmail(email.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No email addresses added</p>
          )}

          {/* Add New Email */}
          {isEditing && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Email</h4>
              <div className="flex items-center space-x-3" data-reactid="new-email-form">
                <div className="flex-1">
                  <input
                    type="email"
                    value={newEmail.email}
                    onChange={(e) => setNewEmail(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="w-32">
                  <select
                    value={newEmail.type}
                    onChange={(e) => setNewEmail(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="billing">Billing</option>
                    <option value="accounts">Accounts</option>
                    <option value="payroll">Payroll</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newEmail.is_primary}
                    onChange={(e) => setNewEmail(prev => ({ ...prev, is_primary: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-1 text-sm text-gray-600">Primary</label>
                </div>
                
                <button
                  onClick={addEmail}
                  disabled={!newEmail.email}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      </ClientDetailSection>
    </div>
  )
} 