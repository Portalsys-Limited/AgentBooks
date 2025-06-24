'use client'

import React, { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { Client } from '../../types'
import { UserPlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function ClientsPage() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions(user?.role)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [user])

  const fetchClients = async () => {
    const practiceId = user?.practice_id || user?.practiceId
    if (!practiceId) return

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`http://localhost:8000/customers/practice/${practiceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch clients: ${response.status}`)
      }

      const data = await response.json()
      setClients(data)
    } catch (err) {
      console.error('Error fetching clients:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }

  const createClient = async () => {
    if (!newClientName.trim()) return

    setCreating(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('http://localhost:8000/customers/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newClientName.trim() })
      })

      if (!response.ok) {
        throw new Error(`Failed to create client: ${response.status}`)
      }

      await fetchClients() // Refresh the list
      setShowCreateModal(false)
      setNewClientName('')
    } catch (err) {
      console.error('Error creating client:', err)
      setError(err instanceof Error ? err.message : 'Failed to create client')
    } finally {
      setCreating(false)
    }
  }

  const deleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`http://localhost:8000/customers/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to delete client: ${response.status}`)
      }

      await fetchClients() // Refresh the list
    } catch (err) {
      console.error('Error deleting client:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete client')
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Clients</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setError(null)
                      fetchClients()
                    }}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Clients
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your practice's client directory
            </p>
          </div>
          {hasPermission('CREATE_CLIENTS') && (
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Client
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Clients</dt>
                    <dd className="text-lg font-medium text-gray-900">{clients.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active This Month</dt>
                    <dd className="text-lg font-medium text-gray-900">{clients.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Companies</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {clients.reduce((total, client) => total + client.client_companies.length, 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {clients.length === 0 ? (
              <li className="px-6 py-8 text-center">
                <p className="text-gray-500">No clients found</p>
                {hasPermission('CREATE_CLIENTS') && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-2 text-blue-600 hover:text-blue-500"
                  >
                    Add your first client
                  </button>
                )}
              </li>
            ) : (
              clients.map((client) => (
                <li key={client.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-500">
                          {client.client_companies.length} companies • Created {new Date(client.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasPermission('EDIT_CLIENTS') && (
                        <button className="text-gray-400 hover:text-gray-600">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      )}
                      {hasPermission('DELETE_CLIENTS') && (
                        <button 
                          onClick={() => deleteClient(client.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {client.client_companies.length > 0 && (
                    <div className="mt-3 ml-4">
                      <div className="text-xs text-gray-500 mb-1">Companies:</div>
                      <div className="flex flex-wrap gap-1">
                        {client.client_companies.map((company) => (
                          <span
                            key={company.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {company.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Create Client Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Client</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter client name"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      setNewClientName('')
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createClient}
                    disabled={creating || !newClientName.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating...' : 'Create Client'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
} 