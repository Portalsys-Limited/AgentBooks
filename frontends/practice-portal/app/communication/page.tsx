'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
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
  XMarkIcon,
  ShieldCheckIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon
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
  IndividualWithMessages,
  ConversationResponse,
  MessageDirection
} from '../../lib/messages'
import {
  sendMessage,
  getIndividualMessages,
  getIndividualsWithMessageSummary,
  markMessageAsRead,
  getMessagingStats,
  getTwilioSandboxQR,
  getTwilioSandboxParticipants,
  validatePhoneNumber,
  getMessageAnalytics,
  checkTwilioSetupStatus
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
  const [individuals, setIndividuals] = useState<IndividualWithMessages[]>([])
  const [selectedIndividual, setSelectedIndividual] = useState<IndividualWithMessages | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [messageType, setMessageType] = useState<MessageType>(MessageType.WHATSAPP)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTwilioSetup, setShowTwilioSetup] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [twilioStatus, setTwilioStatus] = useState<any>(null)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load initial data
  useEffect(() => {
    loadIndividuals()
    loadStats()
    loadAnalytics()
    checkTwilioStatus()
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input when individual is selected
  useEffect(() => {
    if (selectedIndividual && inputRef.current) {
      inputRef.current.focus()
    }
  }, [selectedIndividual])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadIndividuals = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading individuals with message data...')
      
      const individualsData = await getIndividualsWithMessageSummary()
      console.log('Loaded individuals:', individualsData)
      
      setIndividuals(individualsData)
      
      // Auto-select the first individual with messages, or just the first individual
      if (individualsData.length > 0 && !selectedIndividual) {
        const individualWithMessages = individualsData.find(i => i.total_messages > 0) || individualsData[0]
        console.log('Auto-selecting individual:', individualWithMessages)
        handleIndividualSelect(individualWithMessages)
      }
    } catch (err) {
      console.error('Error loading individuals:', err)
      setError('Failed to load individuals. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (individualId: string) => {
    try {
      setLoadingMessages(true)
      setError(null)
      console.log('Loading messages for individual:', individualId)
      
      const conversation = await getIndividualMessages(individualId)
      console.log('Loaded conversation:', conversation)
      
      setMessages(conversation.messages || [])
      
      // Mark unread messages as read
      const unreadMessages = conversation.messages?.filter(
        msg => msg.direction === MessageDirection.INCOMING && !msg.read_at
      ) || []
      
      if (unreadMessages.length > 0) {
        console.log('Marking', unreadMessages.length, 'messages as read')
        for (const msg of unreadMessages) {
          try {
            await markMessageAsRead(msg.id)
          } catch (err) {
            console.error('Error marking message as read:', err)
          }
        }
        
        // Update the individual's unread count in the list
        setIndividuals(prev => 
          prev.map(i => 
            i.id === individualId 
              ? { ...i, unread_count: 0 }
              : i
          )
        )
      }
    } catch (err) {
      console.error('Error loading messages:', err)
      setError('Failed to load messages for this individual.')
      setMessages([])
    } finally {
      setLoadingMessages(false)
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

  const loadAnalytics = async () => {
    try {
      const analyticsData = await getMessageAnalytics()
      setAnalytics(analyticsData)
    } catch (err) {
      console.error('Error loading analytics:', err)
    }
  }

  const checkTwilioStatus = async () => {
    try {
      const statusData = await checkTwilioSetupStatus()
      setTwilioStatus(statusData)
    } catch (err) {
      console.error('Error checking Twilio status:', err)
    }
  }

  const handleIndividualSelect = (individual: IndividualWithMessages) => {
    console.log('Selecting individual:', individual)
    setSelectedIndividual(individual)
    setError(null)
    loadMessages(individual.id)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedIndividual || sendingMessage) return

    // Validate phone number if sending WhatsApp
    if (messageType === MessageType.WHATSAPP && selectedIndividual.phone) {
      try {
        const validation = await validatePhoneNumber(selectedIndividual.phone)
        if (!validation.data.is_valid) {
          setError(`Invalid phone number format: ${selectedIndividual.phone}`)
          return
        }
      } catch (err) {
        setError('Failed to validate phone number')
        console.error('Phone validation error:', err)
        return
      }
    }

    const messageData: MessageSendData = {
      individual_id: selectedIndividual.id,
      message_type: messageType,
      body: newMessage.trim()
    }

    try {
      setSendingMessage(true)
      setError(null)
      console.log('Sending message:', messageData)
      
      const response = await sendMessage(messageData)
      console.log('Message send response:', response)
      
      if (response.success && response.data) {
        // Add the new message to the current conversation
        setMessages(prev => [...prev, response.data!])
        setNewMessage('')
        
        // Update individual's last contact time and message count
        setIndividuals(prev => 
          prev.map(i => 
            i.id === selectedIndividual.id 
              ? { 
                  ...i, 
                  last_contact: new Date().toISOString(),
                  total_messages: i.total_messages + 1
                }
              : i
          )
        )

        // Refresh stats
        loadStats()
        loadAnalytics()
      } else {
        setError(response.message || 'Failed to send message')
      }
    } catch (err: any) {
      console.error('Error sending message:', err)
      setError(err.message || 'Failed to send message')
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

  const filteredIndividuals = individuals.filter(individual =>
    individual.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    individual.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* Sidebar - Individual List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="View Analytics"
              >
                <ChartBarIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowTwilioSetup(!showTwilioSetup)}
                className={`p-2 rounded-lg ${
                  twilioStatus?.setup_complete 
                    ? 'text-green-600 hover:bg-green-50' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Twilio Setup"
              >
                {twilioStatus?.setup_complete ? (
                  <ShieldCheckIcon className="h-5 w-5" />
                ) : (
                  <SparklesIcon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={loadIndividuals}
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
              placeholder="Search individuals..."
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

          {/* Twilio Status Indicator */}
          {twilioStatus && (
            <div className={`mt-2 p-2 rounded text-xs flex items-center space-x-2 ${
              twilioStatus.setup_complete 
                ? 'bg-green-50 text-green-700' 
                : 'bg-yellow-50 text-yellow-700'
            }`}>
              <UsersIcon className="h-4 w-4" />
              <span>
                {twilioStatus.setup_complete 
                  ? `WhatsApp Ready (${twilioStatus.participants_count} participants)` 
                  : 'WhatsApp Setup Required'
                }
              </span>
            </div>
          )}
        </div>

        {/* Individual List */}
        <div className="flex-1 overflow-y-auto">
          {filteredIndividuals.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <UserCircleIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No individuals found</p>
              <p className="text-xs mt-1">
                {individuals.length === 0 ? 'Try refreshing or check your individual data' : 'Try adjusting your search'}
              </p>
            </div>
          ) : (
            filteredIndividuals.map((individual) => (
              <div
                key={individual.id}
                className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedIndividual?.id === individual.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleIndividualSelect(individual)}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {individual.avatar || individual.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    {individual.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {individual.unread_count}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {individual.full_name}
                      </p>
                      {individual.last_contact && (
                        <span className="text-xs text-gray-500">
                          {formatTime(individual.last_contact)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      {individual.phone && (
                        <PhoneIcon className="h-3 w-3 text-gray-400" />
                      )}
                      {individual.email && (
                        <EnvelopeIcon className="h-3 w-3 text-gray-400" />
                      )}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        individual.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {individual.status}
                      </span>
                    </div>
                    
                    {individual.total_messages > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {individual.total_messages} messages
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
        {selectedIndividual ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    {selectedIndividual.avatar || selectedIndividual.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedIndividual.full_name}
                    </h2>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      {selectedIndividual.phone && (
                        <span className="flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          {selectedIndividual.phone}
                        </span>
                      )}
                      {selectedIndividual.email && (
                        <span className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          {selectedIndividual.email}
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
              {loadingMessages ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
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
                    className={`flex ${message.direction === MessageDirection.INCOMING ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.direction === MessageDirection.INCOMING
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.body}
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
                          message.direction === MessageDirection.INCOMING ? 'text-gray-500' : 'text-blue-100'
                        }`}>
                          {formatTime(message.created_at)}
                        </span>
                        
                        {message.direction === MessageDirection.OUTGOING && (
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
                    disabled={sendingMessage || loadingMessages}
                  />
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage || loadingMessages}
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
                Select an individual
              </h3>
              <p className="text-gray-500 mb-4">
                Choose an individual from the sidebar to start messaging
              </p>
              {individuals.length === 0 && (
                <button
                  onClick={loadIndividuals}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Refresh Individual List
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      {showAnalytics && (
        <AnalyticsModal 
          onClose={() => setShowAnalytics(false)}
          analytics={analytics}
          stats={stats}
        />
      )}

      {/* Twilio Setup Modal */}
      {showTwilioSetup && (
        <TwilioSetupModal 
          onClose={() => {
            setShowTwilioSetup(false)
            checkTwilioStatus()
          }}
        />
      )}
    </div>
  )
}

// Analytics Modal Component
function AnalyticsModal({ 
  onClose, 
  analytics, 
  stats 
}: { 
  onClose: () => void
  analytics: any
  stats: any
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-blue-600" />
            Message Analytics
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {analytics && stats ? (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.total_messages}</p>
                <p className="text-sm text-blue-700">Total Messages</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{stats.weekly_messages}</p>
                <p className="text-sm text-green-700">This Week</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{analytics.whatsapp_percentage}%</p>
                <p className="text-sm text-purple-700">WhatsApp</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">{analytics.email_percentage}%</p>
                <p className="text-sm text-orange-700">Email</p>
              </div>
            </div>

            {/* Message Type Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-gray-900">Message Distribution</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ChatBubbleLeftIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm">WhatsApp Messages</span>
                  </div>
                  <span className="text-sm font-medium">{stats.whatsapp_messages}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm">Email Messages</span>
                  </div>
                  <span className="text-sm font-medium">{stats.email_messages}</span>
                </div>
              </div>
            </div>

            {/* Time Period */}
            <div className="text-sm text-gray-500 text-center">
              <p>Analytics period: {stats.period.week_start} to {stats.period.today}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p>Loading analytics...</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Enhanced Twilio Setup Modal Component
function TwilioSetupModal({ onClose }: { onClose: () => void }) {
  const [qrData, setQrData] = useState<any>(null)
  const [participants, setParticipants] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'qr' | 'participants'>('qr')

  useEffect(() => {
    loadSetupData()
  }, [])

  const loadSetupData = async () => {
    try {
      const [qrResponse, participantsResponse] = await Promise.all([
        getTwilioSandboxQR(),
        getTwilioSandboxParticipants()
      ])
      
      setQrData(qrResponse)
      setParticipants(participantsResponse)
    } catch (err) {
      console.error('Error loading setup data:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <SparklesIcon className="h-6 w-6 mr-2 text-blue-600" />
            WhatsApp Setup
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'qr'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            QR Code
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'participants'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Participants ({participants?.data?.total_count || 0})
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p>Loading setup information...</p>
          </div>
        ) : (
          <>
            {/* QR Code Tab */}
            {activeTab === 'qr' && (
              <div className="text-center">
                {qrData?.success ? (
                  <>
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
                  </>
                ) : (
                  <div className="py-4">
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
            )}

            {/* Participants Tab */}
            {activeTab === 'participants' && (
              <div>
                {participants?.success ? (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <UsersIcon className="h-5 w-5" />
                        <span>
                          {participants.data?.total_count || 0} authorized phone numbers
                        </span>
                      </div>
                    </div>
                    
                    {participants.data?.participants && participants.data.participants.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {participants.data.participants.map((phone: string, index: number) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-mono">{phone}</span>
                            <CheckCircleIconSolid className="h-4 w-4 text-green-500 ml-auto" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <UsersIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No participants yet</p>
                        <p className="text-xs">Scan the QR code to authorize your phone</p>
                      </div>
                    )}
                    
                    {participants.data?.note && (
                      <p className="text-xs text-gray-500 mt-4 text-center">
                        {participants.data.note}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-red-600">
                      {participants?.error || 'Unable to load participants'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
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