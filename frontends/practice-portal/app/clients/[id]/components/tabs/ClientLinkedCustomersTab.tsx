'use client'

import React, { useState } from 'react'
import { UserIcon, PlusIcon, LinkIcon, TrashIcon } from '@heroicons/react/24/outline'
import ClientDetailSection from '../ClientDetailSection'

interface LinkedCustomer {
  id: string
  name: string
  email?: string
  phone?: string
  created_at?: string
}

interface ClientDetail {
  linked_customers?: LinkedCustomer[]
}

interface ClientLinkedCustomersTabProps {
  client: ClientDetail
  onRefresh: () => void
}

export default function ClientLinkedCustomersTab({ client, onRefresh }: ClientLinkedCustomersTabProps) {
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString()
  }

  const handleLinkCustomer = async (customerId: string) => {
    // This would call the API to link the customer to the client
    try {
      console.log('Linking customer', customerId, 'to client', client)
      // API call would go here
      setShowLinkForm(false)
      setSearchTerm('')
      await onRefresh()
    } catch (error) {
      console.error('Failed to link customer:', error)
    }
  }

  const handleUnlinkCustomer = async (customerId: string) => {
    // This would call the API to unlink the customer from the client
    try {
      console.log('Unlinking customer', customerId, 'from client')
      // API call would go here
      await onRefresh()
    } catch (error) {
      console.error('Failed to unlink customer:', error)
    }
  }

  return (
    <div className="max-w-4xl">
      {/* Linked Customers Section */}
      <ClientDetailSection
        title="Linked Customers"
        icon={UserIcon}
        isInitiallyExpanded={true}
      >
        <div className="space-y-6">
          {/* Header with Link Button */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Customers associated with this client company
            </p>
            <button
              onClick={() => setShowLinkForm(!showLinkForm)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              data-reactid="link-customer-button"
            >
              <LinkIcon className="h-4 w-4 mr-1" />
              Link Customer
            </button>
          </div>

          {/* Link Customer Form */}
          {showLinkForm && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Link Existing Customer</h4>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search customers by name or email..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    data-reactid="customer-search-input"
                  />
                </div>
                
                {/* Mock search results - in real app this would be dynamic */}
                {searchTerm && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <div className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">John Smith</p>
                        <p className="text-xs text-gray-500">john.smith@email.com</p>
                      </div>
                      <button
                        onClick={() => handleLinkCustomer('customer-1')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Link
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Jane Doe</p>
                        <p className="text-xs text-gray-500">jane.doe@email.com</p>
                      </div>
                      <button
                        onClick={() => handleLinkCustomer('customer-2')}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Link
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowLinkForm(false)}
                    className="flex-1 px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Linked Customers List */}
          {client.linked_customers && client.linked_customers.length > 0 ? (
            <div className="space-y-3">
              {client.linked_customers.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50" data-reactid={`linked-customer-${index}`}>
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{customer.name}</h4>
                      <div className="text-xs text-gray-500 space-y-1">
                        {customer.email && <p>📧 {customer.email}</p>}
                        {customer.phone && <p>📞 {customer.phone}</p>}
                        <p>🔗 Linked on {formatDate(customer.created_at)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(`/customers/${customer.id}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleUnlinkCustomer(customer.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Unlink customer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Linked Customers</h3>
              <p className="mt-1 text-sm text-gray-500">
                No customers are currently linked to this client.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => setShowLinkForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Link First Customer
                </button>
              </div>
            </div>
          )}
        </div>
      </ClientDetailSection>
    </div>
  )
} 