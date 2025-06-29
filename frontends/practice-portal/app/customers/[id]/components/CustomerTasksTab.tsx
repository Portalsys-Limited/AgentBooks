'use client'

import React from 'react'
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface CustomerTasksTabProps {
  customerId: string
}

export default function CustomerTasksTab({ customerId }: CustomerTasksTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Customer Tasks</h2>
          <p className="text-sm text-gray-600">
            Manage tasks and workflow for this customer
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 opacity-50 cursor-not-allowed"
            disabled
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Task
          </button>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Task Management Coming Soon
          </h3>
          
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            We're building a comprehensive task management system that will allow you to track 
            and manage all tasks related to this customer.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <ClockIcon className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Task Tracking</span>
              </div>
              <p className="text-sm text-gray-600">
                Track progress on customer-specific tasks and deadlines
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <UserIcon className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Team Assignment</span>
              </div>
              <p className="text-sm text-gray-600">
                Assign tasks to team members and track completion
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Client Integration</span>
              </div>
              <p className="text-sm text-gray-600">
                Link tasks to related clients and business entities
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <CheckCircleIcon className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Workflow Automation</span>
              </div>
              <p className="text-sm text-gray-600">
                Automated task creation based on customer events
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <h4 className="text-sm font-medium text-blue-900">
                  Development in Progress
                </h4>
                <p className="text-sm text-blue-800 mt-1">
                  This feature is currently being developed and will be available in a future update. 
                  In the meantime, you can continue using your existing task management tools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center opacity-50">
          <div className="text-2xl font-bold text-gray-400 mb-1">0</div>
          <div className="text-sm text-gray-500">Open Tasks</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center opacity-50">
          <div className="text-2xl font-bold text-gray-400 mb-1">0</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center opacity-50">
          <div className="text-2xl font-bold text-gray-400 mb-1">0</div>
          <div className="text-sm text-gray-500">Overdue</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center opacity-50">
          <div className="text-2xl font-bold text-gray-400 mb-1">0</div>
          <div className="text-sm text-gray-500">This Week</div>
        </div>
      </div>
    </div>
  )
} 