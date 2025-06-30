'use client'

import React, { useState, useEffect } from 'react'
import {
  UsersIcon,
  BuildingOfficeIcon,
  PlusIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  UserGroupIcon,
  TagIcon,
  CalendarIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import { CustomerRelationshipsTabResponse } from '../../../../lib/customers/types'
import { getCustomerRelationships } from '../../../../lib/customers/service'

interface CustomerRelationshipsTabProps {
  customerId: string
}

export default function CustomerRelationshipsTab({ customerId }: CustomerRelationshipsTabProps) {
  const [relationshipsData, setRelationshipsData] = useState<CustomerRelationshipsTabResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRelationshipsData()
  }, [customerId])

  const loadRelationshipsData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCustomerRelationships(customerId)
      setRelationshipsData(data)
    } catch (err) {
      console.error('Error loading relationships data:', err)
      setError('Failed to load relationships')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !relationshipsData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error || 'Relationships data not found'}</p>
        <button 
          onClick={loadRelationshipsData}
          className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Customer Relationships</h2>
          <p className="text-sm text-gray-600">
            Manage client associations and individual relationships for this customer
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {/* TODO: Add new client relation */}}
            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Client Relation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Relationships */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Client Associations</h3>
                  <p className="text-sm text-gray-600">
                    {relationshipsData.client_associations.length} client{relationshipsData.client_associations.length !== 1 ? 's' : ''} linked
                  </p>
                </div>
              </div>
              <button
                onClick={() => {/* TODO: Add client association */}}
                className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                <PlusIcon className="h-3 w-3 mr-1" />
                Add
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {relationshipsData.client_associations.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No client associations</p>
                <p className="text-sm text-gray-400">
                  Link this customer to clients they are associated with
                </p>
                <button 
                  onClick={() => {/* TODO: Add client association */}}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Add Client Association
                </button>
              </div>
            ) : (
              relationshipsData.client_associations.map((association) => (
                <div key={association.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-medium text-sm">
                        {association.client.business_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {association.client.business_name}
                          </h4>
                          {association.relationship_type && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(association.relationship_type)}`}>
                              {association.relationship_type.replace('_', ' ').toUpperCase()}
                            </span>
                          )}
                        </div>
                        {association.client.business_type && (
                          <p className="text-sm text-gray-500">
                            Business type: {association.client.business_type}
                          </p>
                        )}
                        {association.created_at && (
                          <div className="flex items-center mt-1 text-xs text-gray-400">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            Associated since {formatDate(association.created_at)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(`/clients/${association.client.id}`, '_blank')}
                        className="inline-flex items-center p-1 text-gray-400 hover:text-gray-600"
                        title="View client details"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {/* TODO: Remove association */}}
                        className="inline-flex items-center p-1 text-gray-400 hover:text-red-600"
                        title="Remove association"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {relationshipsData.client_associations.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {/* TODO: Navigate to add client page */}}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add New Client Association
              </button>
            </div>
          )}
        </div>

        {/* Individual Relationships */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserGroupIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Individual Relationships</h3>
                  <p className="text-sm text-gray-600">
                    {relationshipsData.individual_relationships.length} individual relationship{relationshipsData.individual_relationships.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {/* TODO: Add individual relationship */}}
                className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                <PlusIcon className="h-3 w-3 mr-1" />
                Add
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {relationshipsData.individual_relationships.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No individual relationships</p>
                <p className="text-sm text-gray-400">
                  Connect this customer with related individuals (spouse, partner, etc.)
                </p>
                <button 
                  onClick={() => {/* TODO: Add individual relationship */}}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Add Individual Relationship
                </button>
              </div>
            ) : (
              relationshipsData.individual_relationships.map((relationship) => (
                <div key={relationship.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {/* TODO: Add individual name initials when relationship data is expanded */}
                        IR
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {relationship.relationship_type || 'Individual Relationship'}
                          </h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <LinkIcon className="h-3 w-3 mr-1" />
                            {relationship.relationship_type || 'Related'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {relationship.description && (
                            <p>{relationship.description}</p>
                          )}
                          <p className="text-xs">ID: {relationship.id}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {/* TODO: View relationship details */}}
                        className="inline-flex items-center p-1 text-gray-400 hover:text-gray-600"
                        title="View relationship details"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {/* TODO: Remove relationship */}}
                        className="inline-flex items-center p-1 text-gray-400 hover:text-red-600"
                        title="Remove relationship"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {relationshipsData.individual_relationships.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {/* TODO: Add individual relationship */}}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Individual Relationship
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Relationship Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <UsersIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Relationship Summary</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {relationshipsData.client_associations.length}
            </div>
            <div className="text-sm text-blue-700">Client Associations</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {relationshipsData.individual_relationships.length}
            </div>
            <div className="text-sm text-green-700">Individual Relationships</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {relationshipsData.client_associations.length + relationshipsData.individual_relationships.length}
            </div>
            <div className="text-sm text-purple-700">Total Connections</div>
          </div>
        </div>

        {(relationshipsData.client_associations.length === 0 && relationshipsData.individual_relationships.length === 0) && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <TagIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">No relationships found</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Consider linking this customer to relevant clients or individuals to maintain comprehensive records 
                  and improve service delivery.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 