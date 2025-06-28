'use client'

import React from 'react'
import { CurrencyPoundIcon, BanknotesIcon } from '@heroicons/react/24/outline'
import CustomerFormSection from '../CustomerFormSection'

interface CustomerFormData {
  rental_property?: boolean
  income_relation?: string
  self_employment_income_relation?: string
  employment_income_relation?: string
  rental_income?: number
  dividend_income?: number
  pension_income?: number
  foreign_income?: number
  state_benefit_income?: number
  child_benefit?: number
  tax_universal_credits?: number
  capital_gains_income?: number
}

interface CustomerIncomeInfoTabProps {
  customer: CustomerFormData
  onFieldChange: (key: string, value: string | boolean | number) => void
}

export default function CustomerIncomeInfoTab({ customer, onFieldChange }: CustomerIncomeInfoTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-4">
        {/* Income Relations Section */}
        <CustomerFormSection
          title="Income Relations"
          icon={CurrencyPoundIcon}
          isInitiallyExpanded={true}
        >
          <div className="space-y-4">
            <div data-reactid="field-rental-property">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={customer.rental_property || false}
                  onChange={(e) => onFieldChange('rental_property', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Rental Property (Yes/No)
                </span>
              </label>
            </div>
            
            <div data-reactid="field-income-relation">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Income Relation
              </label>
              <input
                type="text"
                value={customer.income_relation || ''}
                onChange={(e) => onFieldChange('income_relation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div data-reactid="field-self-employment-income-relation">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Self Employment Income Relation
              </label>
              <input
                type="text"
                value={customer.self_employment_income_relation || ''}
                onChange={(e) => onFieldChange('self_employment_income_relation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div data-reactid="field-employment-income-relation">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Income Relation
              </label>
              <input
                type="text"
                value={customer.employment_income_relation || ''}
                onChange={(e) => onFieldChange('employment_income_relation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </CustomerFormSection>
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        {/* Annual Income Amounts Section */}
        <CustomerFormSection
          title="Annual Income Amounts"
          icon={BanknotesIcon}
          isInitiallyExpanded={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div data-reactid="field-rental-income">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rental Income (£)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={customer.rental_income || ''}
                onChange={(e) => onFieldChange('rental_income', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            
            <div data-reactid="field-dividend-income">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dividend Income (£)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={customer.dividend_income || ''}
                onChange={(e) => onFieldChange('dividend_income', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            
            <div data-reactid="field-pension-income">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pension Income (£)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={customer.pension_income || ''}
                onChange={(e) => onFieldChange('pension_income', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            
            <div data-reactid="field-foreign-income">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foreign Income (£)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={customer.foreign_income || ''}
                onChange={(e) => onFieldChange('foreign_income', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            
            <div data-reactid="field-state-benefit-income">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State Benefit Income (£)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={customer.state_benefit_income || ''}
                onChange={(e) => onFieldChange('state_benefit_income', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            
            <div data-reactid="field-child-benefit">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Child Benefit (£)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={customer.child_benefit || ''}
                onChange={(e) => onFieldChange('child_benefit', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            
            <div data-reactid="field-tax-universal-credits">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax/Universal Credits (£)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={customer.tax_universal_credits || ''}
                onChange={(e) => onFieldChange('tax_universal_credits', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
            
            <div data-reactid="field-capital-gains-income">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capital Gains Income (£)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={customer.capital_gains_income || ''}
                onChange={(e) => onFieldChange('capital_gains_income', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </CustomerFormSection>
      </div>
    </div>
  )
} 