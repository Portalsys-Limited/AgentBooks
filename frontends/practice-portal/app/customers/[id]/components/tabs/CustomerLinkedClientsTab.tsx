'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BuildingOfficeIcon, PlusIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline'

interface CustomerDetail {
  id: string
  name: string
  linked_clients?: Array<{
    id: string
    name: string
    business_type?: string
    status?: string
    created_at?: string
  }>
}

interface CustomerLinkedClientsTabProps {
  customer: CustomerDetail
  onRefresh: () => void
}

export default function CustomerLinkedClientsTab({ customer, onRefresh }: CustomerLinkedClientsTabProps) {
  const router = useRouter()
  const [showAddClientModal, setShowAddClientModal] = useState(false)

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided'
    return new Date(dateString).toLocaleDateString()
  }

  const handleClientClick = (clientId: string) => {
    router.push(`/clients/${clientId}`)
  }

  const handleAddNewClient = () => {
    // Navigate to new client page with pre-filled customer
    router.push(`/clients/new?customer_id=${customer.id}`)
  }

  const handleLinkExistingClient = () => {
    // TODO: Implement linking existing client functionality
    setShowAddClientModal(true)
  }

  return (
    <div className="space-y-6" data-reactid="linked-clients-tab">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <BuildingOfficeIcon className="h-5 w-5 mr-2" />
            Linked Clients ({customer.linked_clients?.length || 0})
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage client companies associated with {customer.name}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleLinkExistingClient}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            data-reactid="link-existing-client-btn"
          >
            <UserIcon className="h-4 w-4 mr-2" />
            Link Existing Client
          </button>
          <button
            onClick={handleAddNewClient}
            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            data-reactid="add-new-client-btn"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add New Client
          </button>
        </div>
      </div>

      {/* Clients List */}
      {customer.linked_clients && customer.linked_clients.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {customer.linked_clients.map((client) => (
              <li key={client.id} data-reactid={`client-${client.id}`}>
                <button
                  onClick={() => handleClientClick(client.id)}
                  className="w-full text-left px-6 py-4 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {client.name}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {client.business_type && (
                            <div className="capitalize">
                              {client.business_type.replace('_', ' ')}
                            </div>
                          )}
                          {client.status && (
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              client.status === 'active' 
                                ? 'bg-green-100 text-green-800'
                                : client.status === 'inactive'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {client.status}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {client.created_at && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {formatDate(client.created_at)}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12 bg-white shadow rounded-lg" data-reactid="no-clients-state">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No linked clients</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new client or linking an existing one to {customer.name}
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <button
              onClick={handleLinkExistingClient}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Link Existing Client
            </button>
            <button
              onClick={handleAddNewClient}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Client
            </button>
          </div>
        </div>
      )}

      {/* Add Client Modal - Placeholder */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Link Existing Client</h3>
            <p className="text-sm text-gray-500 mb-4">
              This feature will allow you to search and link existing clients to this customer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddClientModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddClientModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Link Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 