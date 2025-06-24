'use client'

import React, { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface Field {
  key: string
  label: string
  value: string | undefined
  type?: 'text' | 'email' | 'tel' | 'date' | 'textarea'
  editable?: boolean
}

interface CollapsibleSectionProps {
  title: string
  icon: React.ComponentType<{ className?: string }>
  fields: Field[]
  isInitiallyExpanded?: boolean
  onFieldChange?: (key: string, value: string) => void
}

export default function CollapsibleSection({
  title,
  icon: Icon,
  fields,
  isInitiallyExpanded = false,
  onFieldChange
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValues, setTempValues] = useState<{ [key: string]: string }>({})

  const handleFieldClick = (field: Field) => {
    if (field.editable !== false) {
      setEditingField(field.key)
      setTempValues({ ...tempValues, [field.key]: field.value || '' })
    }
  }

  const handleFieldSave = (key: string) => {
    if (onFieldChange && tempValues[key] !== undefined) {
      onFieldChange(key, tempValues[key])
    }
    setEditingField(null)
    setTempValues({})
  }

  const handleFieldCancel = () => {
    setEditingField(null)
    setTempValues({})
  }

  const handleKeyPress = (e: any, key: string) => {
    if (e.key === 'Enter' && e.currentTarget.tagName !== 'TEXTAREA') {
      handleFieldSave(key)
    } else if (e.key === 'Escape') {
      handleFieldCancel()
    }
  }

  const handleBlur = (key: string) => {
    handleFieldSave(key)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
      >
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                {editingField === field.key ? (
                  <div className="space-y-2">
                    {field.type === 'textarea' ? (
                      <textarea
                        value={tempValues[field.key] || ''}
                        onChange={(e) => setTempValues({ ...tempValues, [field.key]: e.target.value })}
                        onKeyDown={(e) => handleKeyPress(e, field.key)}
                        onBlur={(e) => handleBlur(field.key)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        autoFocus
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={tempValues[field.key] || ''}
                        onChange={(e) => setTempValues({ ...tempValues, [field.key]: e.target.value })}
                        onKeyDown={(e) => handleKeyPress(e, field.key)}
                        onBlur={(e) => handleBlur(field.key)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => handleFieldClick(field)}
                    className={`mt-1 p-2 text-sm text-gray-900 rounded-md border border-transparent ${
                      field.editable !== false
                        ? 'cursor-pointer hover:bg-gray-50 hover:border-gray-200'
                        : ''
                    }`}
                  >
                    {field.value || 'Not provided'}
                    {field.editable !== false && (
                      <span className="ml-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100">
                        Click to edit
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 