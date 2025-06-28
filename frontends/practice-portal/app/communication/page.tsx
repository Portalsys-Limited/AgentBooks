'use client'

import * as React from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { 
  ChatBubbleLeftIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  DocumentArrowUpIcon,
  FaceFrownIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  BellIcon,
  SparklesIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  BellIcon as BellIconSolid 
} from '@heroicons/react/24/solid'
import {
  Message,
  MessageType,
  MessageStatus,
  MessageSendData,
  CustomerWithMessages,
  ConversationResponse
} from '../../lib/messages'
import {
  sendMessage,
  getCustomerMessages,
  getCustomersWithMessageSummary,
  markMessageAsRead,
  getMessagingStats,
  getTwilioSandboxQR
} from '../../lib/messages/service'

export default function CommunicationPage() {
  return (
    <AppLayout>
      <CommunicationContent />
    </AppLayout>
  )
}

function CommunicationContent() {
  // State management
  const [customers, setCustomers] = useState<CustomerWithMessages[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithMessages | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [messageType, setMessageType] = useState<MessageType>(MessageType.WHATSAPP)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTwilioSetup, setShowTwilioSetup] = useState(false)
  const [stats, setStats] = useState<any>(null)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load initial data
  useEffect(() => {
    loadCustomers()
    loadStats()
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input when customer is selected
  useEffect(() => {
    if (selectedCustomer && inputRef.current) {
      inputRef.current.focus()
    }
  }, [selectedCustomer])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const customersData = await getCustomersWithMessageSummary()
      setCustomers(customersData)
      if (customersData.length > 0 && !selectedCustomer) {
        setSelectedCustomer(customersData[0])
        loadMessages(customersData[0].id)
      }
    } catch (err) {
      setError('Failed to load customers')
      console.error('Error loading customers:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (customerId: string) => {
    try {
      const conversation = await getCustomerMessages(customerId)
      setMessages(conversation.messages)
      
      // Mark unread messages as read
      const unreadMessages = conversation.messages.filter(
        msg => msg.is_incoming && !msg.read_at
      )
      for (const msg of unreadMessages) {
        try {
          await markMessageAsRead(msg.id)
        } catch (err) {
          console.error('Error marking message as read:', err)
        }
      }
    } catch (err) {
      setError('Failed to load messages')
      console.error('Error loading messages:', err)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await getMessagingStats()
      setStats(statsData)
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  const handleCustomerSelect = (customer: CustomerWithMessages) => {
    setSelectedCustomer(customer)
    loadMessages(customer.id)
    setError(null)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCustomer || sendingMessage) return

    const messageData: MessageSendData = {
      customer_id: selectedCustomer.id,
      message_type: messageType,
      content: newMessage.trim(),
      phone_number: messageType === MessageType.WHATSAPP ? selectedCustomer.phone : undefined,
      email_address: messageType === MessageType.EMAIL ? selectedCustomer.email : undefined
    }

    try {
      setSendingMessage(true)
      setError(null)
      
      const response = await sendMessage(messageData)
      
      if (response.success && response.data) {
        // Add the new message to the current conversation
        setMessages(prev => [...prev, response.data!])
        setNewMessage('')
        
        // Update customer's last contact time
        setCustomers(prev => 
          prev.map(c => 
            c.id === selectedCustomer.id 
              ? { ...c, last_contact: new Date().toISOString() }
              : c
          )
        )
      } else {
        setError(response.message || 'Failed to send message')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
      console.error('Error sending message:', err)
    } finally {
      setSendingMessage(false)
      inputRef.current?.focus()
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

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.SENT:
        return <CheckCircleIcon className="h-4 w-4 text-gray-400" />
      case MessageStatus.DELIVERED:
        return <CheckCircleIconSolid className="h-4 w-4 text-gray-500" />
      case MessageStatus.READ:
        return <CheckCircleIconSolid className="h-4 w-4 text-blue-500" />
      case MessageStatus.FAILED:
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex bg-gray-50">
      {/* Sidebar - Customer List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowTwilioSetup(!showTwilioSetup)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Setup Twilio"
              >
                <SparklesIcon className="h-5 w-5" />
              </button>
              <button
                onClick={loadCustomers}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Refresh"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Stats */}
          {stats && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-50 p-2 rounded">
                <p className="text-blue-600 font-medium">{stats.total_messages}</p>
                <p className="text-blue-500">Total Messages</p>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <p className="text-green-600 font-medium">{stats.weekly_messages}</p>
                <p className="text-green-500">This Week</p>
              </div>
            </div>
          )}
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-y-auto">
          {filteredCustomers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <UserCircleIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No customers found</p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedCustomer?.id === customer.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleCustomerSelect(customer)}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {customer.avatar || customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    {customer.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {customer.unread_count}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {customer.name}
                      </p>
                      {customer.last_contact && (
                        <span className="text-xs text-gray-500">
                          {formatTime(customer.last_contact)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      {customer.phone && (
                        <PhoneIcon className="h-3 w-3 text-gray-400" />
                      )}
                      {customer.email && (
                        <EnvelopeIcon className="h-3 w-3 text-gray-400" />
                      )}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        customer.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status}
                      </span>
                    </div>
                    
                    {customer.total_messages > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {customer.total_messages} messages
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedCustomer ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    {selectedCustomer.avatar || selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedCustomer.name}
                    </h2>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      {selectedCustomer.phone && (
                        <span className="flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          {selectedCustomer.phone}
                        </span>
                      )}
                      {selectedCustomer.email && (
                        <span className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          {selectedCustomer.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value as MessageType)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={MessageType.WHATSAPP}>WhatsApp</option>
                    <option value={MessageType.EMAIL}>Email</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <ChatBubbleLeftIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No messages yet</p>
                    <p className="text-sm text-gray-400">
                      Send a message to start the conversation
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_incoming ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.is_incoming
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        {message.message_type === MessageType.WHATSAPP && (
                          <ChatBubbleLeftIcon className="h-3 w-3 ml-2 mt-1 flex-shrink-0 opacity-50" />
                        )}
                        {message.message_type === MessageType.EMAIL && (
                          <EnvelopeIcon className="h-3 w-3 ml-2 mt-1 flex-shrink-0 opacity-50" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${
                          message.is_incoming ? 'text-gray-500' : 'text-blue-100'
                        }`}>
                          {formatTime(message.created_at!)}
                        </span>
                        
                        {!message.is_incoming && (
                          <div className="ml-2">
                            {getStatusIcon(message.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Display */}
            {error && (
              <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={`Send a ${messageType === MessageType.WHATSAPP ? 'WhatsApp' : 'email'} message...`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
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
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ChatBubbleLeftIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a customer
              </h3>
              <p className="text-gray-500">
                Choose a customer from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Twilio Setup Modal */}
      {showTwilioSetup && (
        <TwilioSetupModal onClose={() => setShowTwilioSetup(false)} />
      )}
    </div>
  )
}

// Twilio Setup Modal Component
function TwilioSetupModal({ onClose }: { onClose: () => void }) {
  const [qrData, setQrData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQrCode()
  }, [])

  const loadQrCode = async () => {
    try {
      const response = await getTwilioSandboxQR()
      setQrData(response)
    } catch (err) {
      console.error('Error loading QR code:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">WhatsApp Setup</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p>Loading setup information...</p>
          </div>
        ) : qrData?.success ? (
          <div className="text-center">
            {qrData.data?.qr_image_url && (
              <img
                src={qrData.data.qr_image_url}
                alt="WhatsApp QR Code"
                className="mx-auto mb-4 border rounded"
              />
            )}
            <p className="text-sm text-gray-600 mb-2">
              {qrData.data?.instructions || 'Scan this QR code with WhatsApp to connect to the sandbox'}
            </p>
            {qrData.data?.sandbox_number && (
              <p className="text-xs text-gray-500">
                Sandbox: {qrData.data.sandbox_number}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600">
              {qrData?.error || 'Unable to load WhatsApp setup'}
            </p>
            {qrData?.suggestion && (
              <p className="text-xs text-gray-500 mt-2">
                {qrData.suggestion}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/*
 * SUGGESTED BACKEND ROUTES FOR ENHANCED FUNCTIONALITY:
 * =====================================================
 * 
 * 1. GET /messages/customers-with-summary
 *    - Returns customers with message counts, last contact, unread counts
 *    - Would replace the current getCustomersWithMessageSummary implementation
 * 
 * 2. GET /messages/recent?limit=20
 *    - Returns recent messages across all customers for dashboard overview
 * 
 * 3. GET /messages/search?q=query&customer_id=id&type=whatsapp
 *    - Full-text search across message content
 * 
 * 4. POST /messages/bulk-read/{customer_id}
 *    - Mark all messages for a customer as read
 * 
 * 5. GET /messages/thread/{message_id}?context=10
 *    - Get message with surrounding context messages
 * 
 * 6. GET /messages/analytics?start_date=2024-01-01&end_date=2024-01-31
 *    - Message analytics: response times, volume, top customers
 * 
 * 7. POST /messages/webhook/status-update
 *    - Enhanced webhook for delivery status updates
 * 
 * 8. GET /messages/templates
 *    - Pre-defined message templates for common responses
 * 
 * 9. POST /messages/schedule
 *    - Schedule messages to be sent later
 * 
 * 10. GET /messages/attachments/{message_id}
 *     - Handle file attachments in messages
 * 
 * 11. POST /messages/auto-response/rules
 *     - Configure automatic responses based on keywords/conditions
 * 
 * 12. GET /messages/export?customer_id=id&format=pdf
 *     - Export message history for compliance/records
 * 
 * 13. WebSocket endpoint for real-time message updates
 *     - Live updates when new messages arrive
 * 
 * 14. GET /messages/customer/{customer_id}/summary
 *     - Detailed conversation summary and AI insights
 * 
 * 15. POST /messages/ai/suggestions
 *     - AI-powered reply suggestions based on context
 */ 