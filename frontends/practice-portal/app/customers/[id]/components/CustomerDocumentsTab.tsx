'use client'

import React, { useState, useEffect } from 'react'
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  FolderIcon,
  CalendarIcon,
  UserIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { CustomerDocumentsTabResponse } from '../../../../lib/customers/types'
import { getCustomerDocuments } from '../../../../lib/customers/service'

interface CustomerDocumentsTabProps {
  customerId: string
}

export default function CustomerDocumentsTab({ customerId }: CustomerDocumentsTabProps) {
  const [documentsData, setDocumentsData] = useState<CustomerDocumentsTabResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadDocumentsData()
  }, [customerId])

  const loadDocumentsData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCustomerDocuments(customerId)
      setDocumentsData(data)
    } catch (err) {
      console.error('Error loading documents data:', err)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatFileSize = (size?: string) => {
    if (!size) return 'Unknown size'
    return size
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'identity':
        return 'bg-blue-100 text-blue-800'
      case 'financial':
        return 'bg-green-100 text-green-800'
      case 'legal':
        return 'bg-purple-100 text-purple-800'
      case 'correspondence':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAgentStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'processed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredDocuments = documentsData?.documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !documentsData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error || 'Documents data not found'}</p>
        <button 
          onClick={loadDocumentsData}
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
          <h2 className="text-lg font-semibold text-gray-900">Customer Documents</h2>
          <p className="text-sm text-gray-600">
            Manage documents for this customer
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 opacity-50 cursor-not-allowed"
            disabled
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search documents..."
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Documents Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {documentsData.documents.length}
          </div>
          <div className="text-sm text-gray-500">Total Documents</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {documentsData.documents.filter(d => d.agent_state === 'processed').length}
          </div>
          <div className="text-sm text-gray-500">Processed</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {documentsData.documents.filter(d => d.agent_state === 'processing').length}
          </div>
          <div className="text-sm text-gray-500">Processing</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {new Set(documentsData.documents.map(d => d.document_type)).size}
          </div>
          <div className="text-sm text-gray-500">Document Types</div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Document Library</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredDocuments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FolderIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {searchTerm ? 'No documents match your search' : 'No documents found'}
              </p>
              <p className="text-sm text-gray-400">
                Documents uploaded for this customer will appear here
              </p>
            </div>
          ) : (
            filteredDocuments.map((document) => (
              <div key={document.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {document.title || document.filename}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDocumentTypeColor(document.document_type)}`}>
                          {document.document_type}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getAgentStateColor(document.agent_state)}`}>
                          {document.agent_state}
                        </span>
                      </div>
                      {document.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {document.description}
                        </p>
                      )}
                      <div className="flex items-center mt-2 text-xs text-gray-400 space-x-4">
                        <span className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {formatDate(document.created_at)}
                        </span>
                        <span>{formatFileSize(document.file_size)}</span>
                        {document.mime_type && (
                          <span>{document.mime_type}</span>
                        )}
                      </div>
                      {document.tags && document.tags.length > 0 && (
                        <div className="flex items-center mt-2 space-x-1">
                          {document.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(document.document_url, '_blank')}
                      className="inline-flex items-center p-1 text-gray-400 hover:text-gray-600"
                      title="View document"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {/* TODO: Download document */}}
                      className="inline-flex items-center p-1 text-gray-400 hover:text-gray-600"
                      title="Download document"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {/* TODO: Delete document */}}
                      className="inline-flex items-center p-1 text-gray-400 hover:text-red-600"
                      title="Delete document"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center opacity-50">
            <CloudArrowUpIcon className="h-8 w-8 text-gray-400" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Document Upload & Management
          </h3>
          
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Enhanced document management features are currently being developed.
          </p>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <h4 className="text-sm font-medium text-blue-900">
                  Coming Soon Features
                </h4>
                <ul className="text-sm text-blue-800 mt-1 list-disc list-inside">
                  <li>Drag & drop file upload</li>
                  <li>Document categorization and tagging</li>
                  <li>OCR and automatic text extraction</li>
                  <li>Version control and document history</li>
                  <li>Bulk operations and organization tools</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 