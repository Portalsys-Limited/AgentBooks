'use client'

import * as React from 'react'
import { useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { 
  ChatBubbleLeftIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  CalendarIcon,
  BellIcon,
  SparklesIcon,
  FunnelIcon,
  ChatBubbleBottomCenterTextIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  PencilIcon,
  EyeIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline'

export default function CommunicationPage() {
  return (
    <AppLayout>
      <CommunicationContent />
    </AppLayout>
  )
}

// Enhanced mock data with separate AI and Accountant channels
const customers = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    lastContact: '2024-01-15T10:30:00Z',
    unreadCount: 3,
    avatar: 'JS',
    companies: ['Smith Consulting Ltd', 'JS Ventures Ltd'],
    activeTasks: [
      { type: 'VAT Return', dueDate: '2024-01-31', status: 'in-progress' },
      { type: 'Annual Accounts', dueDate: '2024-02-15', status: 'pending' },
      { type: 'CT Filing', dueDate: '2024-03-01', status: 'completed' }
    ],
    aiUnreadCount: 2,
    accountantUnreadCount: 1
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    phone: '+1 (555) 987-6543',
    status: 'pending',
    lastContact: '2024-01-14T15:45:00Z',
    unreadCount: 1,
    avatar: 'SJ',
    companies: ['Johnson & Associates'],
    activeTasks: [
      { type: 'Quarterly VAT', dueDate: '2024-02-01', status: 'pending' }
    ],
    aiUnreadCount: 1,
    accountantUnreadCount: 0
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'mbrown@business.net',
    phone: '+1 (555) 456-7890',
    status: 'active',
    lastContact: '2024-01-13T09:15:00Z',
    unreadCount: 0,
    avatar: 'MB',
    companies: ['Brown Enterprises', 'MB Holdings'],
    activeTasks: [
      { type: 'Statutory Accounts', dueDate: '2024-01-28', status: 'in-progress' },
      { type: 'Payroll Setup', dueDate: '2024-02-10', status: 'pending' }
    ],
    aiUnreadCount: 0,
    accountantUnreadCount: 0
  }
]

// Separate AI and Accountant message channels
const aiMessages = [
  {
    id: 1,
    type: 'whatsapp',
    sender: 'Practice AI',
    content: '🔔 Reminder: Your VAT return for Smith Consulting Ltd is due in 7 days (31st January). I need your Q4 2023 sales and purchase invoices to complete the filing. Please upload them when ready.',
    timestamp: '2024-01-24T09:00:00Z',
    isIncoming: false,
    read: true,
    isAI: true,
    notes: []
  },
  {
    id: 2,
    type: 'whatsapp',
    sender: 'John Smith',
    content: 'Thanks for the reminder! I have the invoices ready. Let me send them over.',
    timestamp: '2024-01-24T09:15:00Z',
    isIncoming: true,
    read: true,
    isAI: false,
    notes: []
  },
  {
    id: 3,
    type: 'whatsapp',
    sender: 'John Smith',
    content: 'Here are my purchase invoices for Q4',
    timestamp: '2024-01-24T09:16:00Z',
    isIncoming: true,
    read: true,
    isAI: false,
    hasAttachment: true,
    attachmentType: 'invoices',
    notes: []
  },
  {
    id: 4,
    type: 'whatsapp',
    sender: 'Practice AI',
    content: '📄 Perfect! I\'ve processed 23 purchase invoices totaling £8,456.78. I can see office supplies, utilities, and travel expenses. All look VAT compliant. Now I need your sales invoices to complete the return.',
    timestamp: '2024-01-24T09:18:00Z',
    isIncoming: false,
    read: true,
    isAI: true,
    notes: []
  },
  {
    id: 5,
    type: 'whatsapp',
    sender: 'Practice AI',
    content: '💰 Payment Reminder: Your December accountancy fees (£450) are overdue. Please settle at your earliest convenience. Payment link: pay.practice.com/inv-2024-001',
    timestamp: '2024-01-24T10:30:00Z',
    isIncoming: false,
    read: false,
    isAI: true,
    notes: []
  },
  {
    id: 6,
    type: 'whatsapp',
    sender: 'John Smith',
    content: 'I need to update my address for Companies House. What documents do I need?',
    timestamp: '2024-01-24T11:00:00Z',
    isIncoming: true,
    read: false,
    isAI: false,
    notes: []
  },
  {
    id: 7,
    type: 'whatsapp',
    sender: 'Practice AI',
    content: '🆔 For Companies House address change, I need: 1) Photo of your driving license or passport (ID verification) 2) Proof of new address (utility bill/bank statement). Please upload these documents and I\'ll handle the filing.',
    timestamp: '2024-01-24T11:02:00Z',
    isIncoming: false,
    read: false,
    isAI: true,
    notes: []
  },
  {
    id: 8,
    type: 'whatsapp',
    sender: 'John Smith',
    content: 'Here\'s my driving license',
    timestamp: '2024-01-24T11:05:00Z',
    isIncoming: true,
    read: false,
    isAI: false,
    hasAttachment: true,
    attachmentType: 'driving_license',
    notes: []
  },
  {
    id: 9,
    type: 'whatsapp',
    sender: 'Practice AI',
    content: '🏦 Setup Reminder: You haven\'t connected your bank feed yet! This will save hours of manual data entry. Click here to connect securely: bankfeed.practice.com/setup/smith-consulting - Takes just 2 minutes!',
    timestamp: '2024-01-24T14:00:00Z',
    isIncoming: false,
    read: false,
    isAI: true,
    hasLink: true,
    notes: []
  },
  {
    id: 10,
    type: 'whatsapp',
    sender: 'Practice AI',
    content: '📋 Action Required: Your engagement letter for 2024 is ready for signature. This covers our service agreement for the year. Please review and sign: docs.practice.com/engagement/2024/smith-consulting',
    timestamp: '2024-01-24T15:30:00Z',
    isIncoming: false,
    read: false,
    isAI: true,
    hasLink: true,
    notes: []
  }
]

const accountantMessages = [
  {
    id: 1,
    type: 'whatsapp',
    sender: 'John Smith',
    content: 'Hi, can you send me a copy of my annual accounts for 2023? The bank needs them for my loan application. Thanks!',
    timestamp: '2024-01-24T09:30:00Z',
    isIncoming: true,
    read: false,
    isAI: false,
    notes: []
  },
  {
    id: 2,
    type: 'email',
    sender: 'Sarah (Corner Shop)',
    content: 'Morning! Could you please send me my VAT certificate for last quarter? HMRC are asking for it and I can\'t find my copy. Also, when is my next VAT return due?',
    timestamp: '2024-01-24T10:15:00Z',
    isIncoming: true,
    read: false,
    isAI: false,
    subject: 'VAT Certificate Request',
    notes: []
  },
  {
    id: 3,
    type: 'whatsapp',
    sender: 'Mike (Electrician)',
    content: 'Hi mate, I need my P&L for 2023 to show the letting agent for my new workshop lease. Can you email it over when you get a chance?',
    timestamp: '2024-01-24T11:45:00Z',
    isIncoming: true,
    read: true,
    isAI: false,
    notes: []
  },
  {
    id: 4,
    type: 'email',
    sender: 'You',
    content: 'Hi Mike, I\'ve attached your 2023 Profit & Loss statement. Good luck with the workshop lease! Let me know if you need anything else for the application.',
    timestamp: '2024-01-24T12:00:00Z',
    isIncoming: false,
    read: true,
    isAI: false,
    subject: 'Re: P&L Statement Request',
    notes: []
  },
  {
    id: 5,
    type: 'whatsapp',
    sender: 'Emma (Rental Property)',
    content: 'Quick question - do you have my rental income summary for 2023? My mortgage advisor needs to see all my property income. Cheers!',
    timestamp: '2024-01-24T14:20:00Z',
    isIncoming: true,
    read: false,
    isAI: false,
    notes: []
  },
  {
    id: 6,
    type: 'email',
    sender: 'David (Sole Trader)',
    content: 'Could you send me my self-assessment calculation breakdown? I want to understand how you arrived at the £3,200 tax bill. Also need it for my records.',
    timestamp: '2024-01-24T15:30:00Z',
    isIncoming: true,
    read: false,
    isAI: false,
    subject: 'Self Assessment Breakdown Request',
    notes: []
  },
  {
    id: 7,
    type: 'whatsapp',
    sender: 'Lisa (Hairdresser)',
    content: 'Hi! I need my business certificate and accounts for insurance purposes. The salon insurance company wants to see my latest financials. When can you send them?',
    timestamp: '2024-01-24T16:00:00Z',
    isIncoming: true,
    read: false,
    isAI: false,
    notes: []
  },
  {
    id: 8,
    type: 'email',
    sender: 'You',
    content: 'Hi Sarah, I\'ve attached your VAT certificate for Q4 2023. Your next VAT return is due 7th February. I\'ll send you a reminder closer to the date.',
    timestamp: '2024-01-24T16:30:00Z',
    isIncoming: false,
    read: true,
    isAI: false,
    subject: 'Re: VAT Certificate Request',
    notes: []
  }
]

function CommunicationContent() {
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [messageType, setMessageType] = useState('whatsapp')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [messageFilter, setMessageFilter] = useState('all')
  const [showingNotes, setShowingNotes] = useState<number | null>(null)
  const [newNote, setNewNote] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [activeChannel, setActiveChannel] = useState<'ai' | 'accountant'>('ai')

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get messages based on active channel
  const currentMessages = activeChannel === 'ai' ? aiMessages : accountantMessages
  
  const filteredMessages = currentMessages.filter(message => {
    if (messageFilter === 'all') return true
    if (messageFilter === 'unread') return !message.read && message.isIncoming
    if (messageFilter === 'ai') return message.isAI
    if (messageFilter === 'human') return !message.isAI
    if (messageFilter === 'email') return message.type === 'email'
    if (messageFilter === 'whatsapp') return message.type === 'whatsapp'
    return true
  })

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getMessageIcon = (type: string) => {
    return type === 'email' ? EnvelopeIcon : ChatBubbleLeftIcon
  }

  const getTaskIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vat return':
      case 'quarterly vat':
        return BanknotesIcon
      case 'annual accounts':
      case 'statutory accounts':
        return DocumentTextIcon
      case 'ct filing':
        return ClipboardDocumentListIcon
      default:
        return CheckCircleIcon
    }
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const addNote = (messageId: number) => {
    if (newNote.trim()) {
      // In a real app, this would update the backend
      console.log(`Adding note to message ${messageId}: ${newNote}`)
      setNewNote('')
      setShowingNotes(null)
    }
  }

  const getChannelSummary = () => {
    if (activeChannel === 'ai') {
      return {
        title: 'AI Communication Summary',
        description: `${selectedCustomer.name} has been using AI for basic queries, document processing, and VAT guidance. Recent activity includes receipt analysis and deadline reminders.`,
        stats: `${selectedCustomer.aiUnreadCount} unread AI messages`
      }
    } else {
      return {
        title: 'Accountant Communication Summary', 
        description: `Professional consultation with ${selectedCustomer.name} on complex matters requiring expert advice. Currently handling HMRC correspondence and scheduling consultations.`,
        stats: `${selectedCustomer.accountantUnreadCount} unread accountant messages`
      }
    }
  }

  const channelSummary = getChannelSummary()

  return (
    <div className="h-full flex">
      {/* AI Summary Header - moved above customer list */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200 p-3">
          <div className="flex items-start space-x-3">
            <SparklesIcon className="h-5 w-5 text-purple-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 mb-1">{channelSummary.title}</h3>
              <p className="text-xs text-gray-700">
                {channelSummary.description}
              </p>
              <p className="text-xs text-purple-600 font-medium mt-1">
                {channelSummary.stats}
              </p>
            </div>
          </div>
        </div>

        {/* Customer List Sidebar */}
        <div className="p-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Customers</h2>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients or customers..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className={`p-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
                selectedCustomer.id === customer.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => setSelectedCustomer(customer)}
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-xs">
                  {customer.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                    <div className="flex items-center space-x-1">
                      {customer.aiUnreadCount > 0 && (
                        <span className="bg-purple-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-1" title="AI Messages">
                          🤖 {customer.aiUnreadCount}
                        </span>
                      )}
                      {customer.accountantUnreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-1" title="Accountant Messages">
                          👤 {customer.accountantUnreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <BuildingOfficeIcon className="h-3 w-3 text-gray-400" />
                    <p className="text-xs text-gray-400 truncate">
                      {customer.companies.length} companies
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {customer.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(customer.lastContact)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Communication Area */}
      <div className="flex-1 flex flex-col">
        {/* Channel Selector */}
        <div className="bg-white border-b border-gray-200 p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveChannel('ai')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeChannel === 'ai'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🤖 AI Chat ({selectedCustomer.aiUnreadCount})
              </button>
              <button
                onClick={() => setActiveChannel('accountant')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeChannel === 'accountant'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👤 Accountant ({selectedCustomer.accountantUnreadCount})
              </button>
            </div>
            
            <div className="text-xs text-gray-500">
              {activeChannel === 'ai' ? 'WhatsApp: +44 7123 456789 (AI)' : 'WhatsApp: +44 7123 456788 (Direct)'}
            </div>
          </div>
        </div>

        {/* Customer Header with Companies and Tasks */}
        <div className="bg-white border-b border-gray-200 p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {selectedCustomer.avatar}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{selectedCustomer.name}</h1>
                <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                  <span className="flex items-center">
                    <EnvelopeIcon className="h-3 w-3 mr-1" />
                    {selectedCustomer.email}
                  </span>
                  <span className="flex items-center">
                    <PhoneIcon className="h-3 w-3 mr-1" />
                    {selectedCustomer.phone}
                  </span>
                </div>
                
                {/* Companies */}
                <div className="mb-2">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Companies:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCustomer.companies.map((company, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                        <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PlusIcon className="h-3 w-3 mr-1" />
                Task
              </button>
              <button className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <CalendarIcon className="h-3 w-3 mr-1" />
                Schedule
              </button>
            </div>
          </div>
          
          {/* Active Tasks Widgets */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {selectedCustomer.activeTasks.map((task, index) => {
              const TaskIcon = getTaskIcon(task.type)
              return (
                <div key={index} className="bg-gray-50 rounded-md p-2">
                  <div className="flex items-center space-x-2">
                    <TaskIcon className="h-4 w-4 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{task.type}</p>
                      <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Message Filters */}
        <div className="bg-white border-b border-gray-200 px-3 py-2">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4 text-gray-500" />
            <select
              value={messageFilter}
              onChange={(e) => setMessageFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="ai">AI Responses</option>
              <option value="human">Human Responses</option>
              <option value="email">Emails Only</option>
              <option value="whatsapp">WhatsApp Only</option>
            </select>
            <span className="text-xs text-gray-500">
              {filteredMessages.length} messages
            </span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50">
          {filteredMessages.map((message) => {
            const MessageIcon = getMessageIcon(message.type)
            return (
              <div key={message.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <MessageIcon className="h-4 w-4 text-gray-400" />
                      <span className={`text-xs font-medium ${message.isAI ? 'text-purple-600' : 'text-gray-900'}`}>
                        {message.isAI ? `🤖 ${message.sender}` : message.sender}
                      </span>
                      <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        message.type === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {message.type}
                      </span>
                      {!message.read && message.isIncoming && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Unread
                        </span>
                      )}
                      {activeChannel === 'ai' && 'hasAttachment' in message && message.hasAttachment && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          📎 {message.attachmentType}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Reply"
                      >
                        <ArrowUturnLeftIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setShowingNotes(showingNotes === message.id ? null : message.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Add Note"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  {message.type === 'email' && 'subject' in message && (
                    <p className="text-xs font-medium text-gray-700 mb-1">Subject: {message.subject}</p>
                  )}
                  
                  <p className="text-sm text-gray-700 mb-2">{message.content}</p>
                  
                  {/* Show attachment preview for AI channel */}
                  {activeChannel === 'ai' && 'hasAttachment' in message && message.hasAttachment && (
                    <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-xs text-gray-600">
                          Attachment: {message.attachmentType === 'invoices' && 'Purchase Invoices (23 files)'}
                          {message.attachmentType === 'driving_license' && 'Driving License (ID Verification)'}
                          {message.attachmentType === 'passport' && 'Passport (ID Verification)'}
                          {message.attachmentType === 'receipts' && 'Receipts (Multiple files)'}
                          {message.attachmentType === 'bank_statement' && 'Bank Statement (Address Proof)'}
                          {message.attachmentType === 'utility_bill' && 'Utility Bill (Address Proof)'}
                          {message.attachmentType === 'document' && 'Document'}
                        </span>
                        <button className="text-xs text-blue-600 hover:underline">View</button>
                        {(message.attachmentType === 'invoices' || message.attachmentType === 'receipts') && (
                          <button className="text-xs text-green-600 hover:underline">✓ Processed</button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Show link preview for AI messages with links */}
                  {activeChannel === 'ai' && 'hasLink' in message && message.hasLink && (
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-blue-700 font-medium">🔗 Quick Action Available</span>
                        <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
                          Open Link
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {message.notes && message.notes.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.notes.map((note, index) => (
                        <div key={index} className="text-xs bg-yellow-50 text-yellow-800 p-2 rounded border-l-2 border-yellow-300">
                          📝 {note}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Note Form */}
                  {showingNotes === message.id && (
                    <div className="mt-2 flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Add a note..."
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                      />
                      <button
                        onClick={() => addNote(message.id)}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  )}
                  
                  {/* Reply Form */}
                  {replyingTo === message.id && (
                    <div className="mt-2 bg-gray-50 p-2 rounded">
                      <div className="flex items-center space-x-2 mb-2">
                        <select className="text-xs border border-gray-300 rounded px-2 py-1">
                          {activeChannel === 'ai' ? (
                            <option value="whatsapp">WhatsApp (AI)</option>
                          ) : (
                            <>
                              <option value="whatsapp">WhatsApp</option>
                              <option value="email">Email</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder={activeChannel === 'ai' ? 'Forward to AI or reply directly...' : 'Type your reply...'}
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        />
                        <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                          {activeChannel === 'ai' ? 'Forward' : 'Reply'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Channel-specific action bar */}

        {/* Quick Task Form */}
        {showTaskForm && (
          <div className="bg-yellow-50 border-t border-yellow-200 p-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Create a new task..."
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                Add Task
              </button>
              <button 
                onClick={() => setShowTaskForm(false)}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-3">
          <div className="flex items-center space-x-2">
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              {activeChannel === 'ai' ? (
                <option value="whatsapp">WhatsApp (AI)</option>
              ) : (
                <>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </>
              )}
            </select>
            <input
              type="text"
              placeholder={
                activeChannel === 'ai' 
                  ? 'Send to AI assistant...' 
                  : `Send a ${messageType} message...`
              }
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            {activeChannel === 'ai' && (
              <button className="inline-flex items-center px-2 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700">
                📎
              </button>
            )}
            <button className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
              <PaperAirplaneIcon className="h-4 w-4 mr-1" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 