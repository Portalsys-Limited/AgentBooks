'use client'

import React from 'react'
import { GlobeAltIcon } from '@heroicons/react/24/outline'
import ClientDetailSection from '../ClientDetailSection'

interface ClientDetail {
  website?: string
  instagram?: string
  facebook?: string
}

interface ClientDetailCompanyDetailsTabProps {
  client: ClientDetail
  onFieldChange: (key: string, value: string | boolean | number | string[]) => void
  isEditing: boolean
}

export default function ClientDetailCompanyDetailsTab({ client, onFieldChange, isEditing }: ClientDetailCompanyDetailsTabProps) {
  const formatUrl = (url?: string) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `https://${url}`
  }

  return (
    <div className="max-w-4xl">
      {/* Company Details Section */}
      <ClientDetailSection
        title="Company Details"
        icon={GlobeAltIcon}
        isInitiallyExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2" data-reactid="field-website">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            {isEditing ? (
              <input
                type="url"
                value={client.website || ''}
                onChange={(e) => onFieldChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://www.example.com"
              />
            ) : (
              <div className="mt-1">
                {client.website ? (
                  <a
                    href={formatUrl(client.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {client.website}
                  </a>
                ) : (
                  <p className="text-sm text-gray-900">Not provided</p>
                )}
              </div>
            )}
          </div>
          
          <div data-reactid="field-instagram">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instagram
            </label>
            {isEditing ? (
              <input
                type="text"
                value={client.instagram || ''}
                onChange={(e) => onFieldChange('instagram', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="@username or full URL"
              />
            ) : (
              <div className="mt-1">
                {client.instagram ? (
                  <a
                    href={client.instagram.startsWith('@') 
                      ? `https://instagram.com/${client.instagram.substring(1)}`
                      : formatUrl(client.instagram)
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {client.instagram}
                  </a>
                ) : (
                  <p className="text-sm text-gray-900">Not provided</p>
                )}
              </div>
            )}
          </div>
          
          <div data-reactid="field-facebook">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facebook
            </label>
            {isEditing ? (
              <input
                type="text"
                value={client.facebook || ''}
                onChange={(e) => onFieldChange('facebook', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Page name or full URL"
              />
            ) : (
              <div className="mt-1">
                {client.facebook ? (
                  <a
                    href={client.facebook.includes('facebook.com') 
                      ? formatUrl(client.facebook)
                      : `https://facebook.com/${client.facebook}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {client.facebook}
                  </a>
                ) : (
                  <p className="text-sm text-gray-900">Not provided</p>
                )}
              </div>
            )}
          </div>
        </div>
      </ClientDetailSection>
    </div>
  )
} 