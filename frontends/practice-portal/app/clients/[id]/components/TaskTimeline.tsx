'use client'

import React, { useState } from 'react'
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

interface TaskStep {
  id: string
  name: string
  status: 'completed' | 'in_progress' | 'pending' | 'overdue'
  assignee: string
  dueDate?: string
  completedDate?: string
}

interface Task {
  id: string
  name: string
  type: 'statutory_accounts' | 'vat_return' | 'tax_return' | 'payroll'
  status: 'completed' | 'in_progress' | 'pending' | 'overdue'
  dueDate: string
  steps: TaskStep[]
}

// Dummy data for tasks
const dummyTasks: Task[] = [
  {
    id: '1',
    name: 'Annual Statutory Accounts 2024',
    type: 'statutory_accounts',
    status: 'in_progress',
    dueDate: '2024-12-31',
    steps: [
      {
        id: '1-1',
        name: 'Document Collection',
        status: 'completed',
        assignee: 'Sarah Johnson',
        completedDate: '2024-10-15'
      },
      {
        id: '1-2',
        name: 'Account Preparation',
        status: 'in_progress',
        assignee: 'Michael Chen',
        dueDate: '2024-11-30'
      },
      {
        id: '1-3',
        name: 'Review',
        status: 'pending',
        assignee: 'Emma Wilson',
        dueDate: '2024-12-15'
      },
      {
        id: '1-4',
        name: 'Filed and Submitted',
        status: 'pending',
        assignee: 'Sarah Johnson',
        dueDate: '2024-12-31'
      }
    ]
  },
  {
    id: '2',
    name: 'VAT Return Q3 2024',
    type: 'vat_return',
    status: 'overdue',
    dueDate: '2024-11-07',
    steps: [
      {
        id: '2-1',
        name: 'Data Collection',
        status: 'completed',
        assignee: 'David Thompson',
        completedDate: '2024-10-20'
      },
      {
        id: '2-2',
        name: 'VAT Calculation',
        status: 'completed',
        assignee: 'David Thompson',
        completedDate: '2024-10-25'
      },
      {
        id: '2-3',
        name: 'Review & Approval',
        status: 'overdue',
        assignee: 'Emma Wilson',
        dueDate: '2024-11-05'
      },
      {
        id: '2-4',
        name: 'Submit to HMRC',
        status: 'pending',
        assignee: 'David Thompson',
        dueDate: '2024-11-07'
      }
    ]
  }
]

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Not provided'
  return new Date(dateString).toLocaleDateString()
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon className="h-5 w-5 text-white" />
    case 'in_progress':
      return <ClockIcon className="h-5 w-5 text-white" />
    case 'overdue':
      return <ExclamationCircleIcon className="h-5 w-5 text-white" />
    default:
      return <ClockIcon className="h-5 w-5 text-white" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const renderTaskTimeline = (task: Task) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div key={task.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Compact Task Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
            task.status === 'completed' ? 'bg-green-500' :
            task.status === 'in_progress' ? 'bg-blue-500' :
            task.status === 'overdue' ? 'bg-red-500' : 'bg-gray-300'
          }`}>
            {getStatusIcon(task.status)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-gray-900 truncate">{task.name}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">Due: {formatDate(task.dueDate)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {task.steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full ${
                  step.status === 'completed' ? 'bg-green-500' :
                  step.status === 'in_progress' ? 'bg-blue-500' :
                  step.status === 'overdue' ? 'bg-red-500' : 'bg-gray-300'
                }`}
                title={step.name}
              />
            ))}
          </div>
          {isExpanded ? (
            <ChevronUpIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
          )}
        </div>
      </button>

      {/* Expanded Task Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {task.steps.map((step, index) => (
                <div key={step.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      step.status === 'completed' ? 'bg-green-500' :
                      step.status === 'in_progress' ? 'bg-blue-500' :
                      step.status === 'overdue' ? 'bg-red-500' : 'bg-gray-300'
                    }`}>
                      {getStatusIcon(step.status)}
                    </div>
                    <h5 className="text-sm font-medium text-gray-900">{step.name}</h5>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">Assignee: {step.assignee}</p>
                    {step.completedDate && (
                      <p className="text-xs text-green-600">✓ Completed: {formatDate(step.completedDate)}</p>
                    )}
                    {step.dueDate && !step.completedDate && (
                      <p className="text-xs text-gray-500">Due: {formatDate(step.dueDate)}</p>
                    )}
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(step.status)}`}>
                      {step.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TaskTimeline() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {dummyTasks.map(renderTaskTimeline)}
      </div>
    </div>
  )
} 