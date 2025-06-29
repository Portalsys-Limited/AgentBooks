'use client'

import React, { useState, useEffect } from 'react'
import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon,
  UserIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { CustomerInfoTabResponse } from '../../../../lib/customers/types'
import { getCustomerInfo } from '../../../../lib/customers/service'

interface CustomerCommunicationTabProps {
  customerId: string
}

// Message types for display
interface MessageDisplay {
  id: string
  body: string
  message_type: 'WHATSAPP' | 'EMAIL'
  direction: 'INCOMING' | 'OUTGOING'
  status: string
  created_at: string
  read_at?: string
}

export default function CustomerCommunicationTab({ customerId }: CustomerCommunicationTabProps) {
  const [customer, setCustomer] = useState<CustomerInfoTabResponse | null>(null)
  const [messages, setMessages] = useState<MessageDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [messageType, setMessageType] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP')
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    loadCustomerAndMessages()
  }, [customerId])

  const loadCustomerAndMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load customer info first to get individual details
      const customerData = await getCustomerInfo(customerId)
      setCustomer(customerData)
      
      // TODO: Load messages filtered by individual_id
      // For now, showing placeholder structure
      setMessages([])
      
    } catch (err) {
      console.error('Error loading customer and messages:', err)
      setError('Failed to load communication data')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !customer || sendingMessage) return

    try {
      setSendingMessage(true)
      setError(null)
      
      // TODO: Implement message sending via messages API
      // const messageData = {
      //   individual_id: customer.individual_id,
      //   message_type: messageType,
      //   body: newMessage.trim()
      // }
      
      // Placeholder for now
      console.log('Would send message:', {
        individual_id: customer.individual_id,
        message_type: messageType,
        body: newMessage.trim()
      })
      
      setNewMessage('')
      
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <ClockIcon className="h-4 w-4 text-gray-400" />
      case 'DELIVERED':
        return <CheckCircleIcon className="h-4 w-4 text-gray-500" />
      case 'READ':
        return <CheckCircleIcon className="h-4 w-4 text-blue-500" />
      case 'FAILED':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error || 'Customer communication data not found'}</p>
        <button 
          onClick={loadCustomerAndMessages}
          className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-300px)] flex flex-col bg-gray-50 rounded-lg border border-gray-200">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              {customer.individual.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Communication with {customer.individual.full_name}
              </h2>
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                {customer.individual.email && (
                  <span className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-1" />
                    {customer.individual.email}
                  </span>
                )}
                <span className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  Customer ID: {customer.id}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as 'WHATSAPP' | 'EMAIL')}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="WHATSAPP">WhatsApp</option>
              <option value="EMAIL">Email</option>
            </select>
            <button
              onClick={loadCustomerAndMessages}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Refresh"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No messages yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start a conversation with {customer.individual.full_name}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Communication Features:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Send WhatsApp messages directly</li>
                  <li>• Email communication tracking</li>
                  <li>• Message history and status</li>
                  <li>• Real-time delivery updates</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.direction === 'INCOMING' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.direction === 'INCOMING'
                    ? 'bg-white text-gray-900 border border-gray-200'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.body}
                  </p>
                  {message.message_type === 'WHATSAPP' && (
                    <ChatBubbleLeftRightIcon className="h-3 w-3 ml-2 mt-1 flex-shrink-0 opacity-50" />
                  )}
                  {message.message_type === 'EMAIL' && (
                    <EnvelopeIcon className="h-3 w-3 ml-2 mt-1 flex-shrink-0 opacity-50" />
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${
                    message.direction === 'INCOMING' ? 'text-gray-500' : 'text-blue-100'
                  }`}>
                    {formatTime(message.created_at)}
                  </span>
                  
                  {message.direction === 'OUTGOING' && (
                    <div className="ml-2">
                      {getStatusIcon(message.status)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4 rounded-b-lg">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder={`Send a ${messageType === 'WHATSAPP' ? 'WhatsApp' : 'email'} message to ${customer.individual.full_name}...`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendingMessage}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {sendingMessage ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          {messageType === 'WHATSAPP' ? (
            <>
              <PhoneIcon className="h-3 w-3 inline mr-1" />
              WhatsApp messages will be sent to the customer's registered phone number
            </>
          ) : (
            <>
              <EnvelopeIcon className="h-3 w-3 inline mr-1" />
              Email will be sent to {customer.individual.email || 'the customer\'s registered email'}
            </>
          )}
        </div>
      </div>
    </div>
  )
} 