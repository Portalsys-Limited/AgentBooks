'use client'

import React from 'react'
import { CurrencyPoundIcon } from '@heroicons/react/24/outline'
import ClientDetailSection from '../ClientDetailSection'

interface ClientDetail {
  billing_frequency?: string
  payment_method?: string
  max_credit_allowance?: number
  debt_credit_amount?: number
}

interface ClientDetailBillingTabProps {
  client: ClientDetail
  onFieldChange: (key: string, value: string | boolean | number | string[]) => void
  isEditing: boolean
}

export default function ClientDetailBillingTab({ client, onFieldChange, isEditing }: ClientDetailBillingTabProps) {
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '£0.00'
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)
  }

  return (
    <div className="max-w-4xl">
      {/* Billing Section */}
      <ClientDetailSection
        title="Billing Information"
        icon={CurrencyPoundIcon}
        isInitiallyExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div data-reactid="field-billing-frequency">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Frequency
            </label>
            {isEditing ? (
              <select
                value={client.billing_frequency || ''}
                onChange={(e) => onFieldChange('billing_frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Frequency</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
                <option value="on_completion">On Completion</option>
                <option value="ad_hoc">Ad Hoc</option>
              </select>
            ) : (
              <p className="mt-1 text-sm text-gray-900 capitalize">{client.billing_frequency?.replace('_', ' ') || 'Not provided'}</p>
            )}
          </div>
          
          <div data-reactid="field-payment-method">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            {isEditing ? (
              <select
                value={client.payment_method || ''}
                onChange={(e) => onFieldChange('payment_method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Method</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="direct_debit">Direct Debit</option>
                <option value="standing_order">Standing Order</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
                <option value="card">Card Payment</option>
                <option value="paypal">PayPal</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className="mt-1 text-sm text-gray-900 capitalize">{client.payment_method?.replace('_', ' ') || 'Not provided'}</p>
            )}
          </div>
          
          <div data-reactid="field-max-credit-allowance">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Credit Allowance
            </label>
            {isEditing ? (
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">£</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={client.max_credit_allowance || ''}
                  onChange={(e) => onFieldChange('max_credit_allowance', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            ) : (
              <p className="mt-1 text-sm text-gray-900">{formatCurrency(client.max_credit_allowance)}</p>
            )}
          </div>
          
          <div data-reactid="field-debt-credit-amount">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Debt/Credit Amount
            </label>
            {isEditing ? (
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">£</span>
                <input
                  type="number"
                  step="0.01"
                  value={client.debt_credit_amount || ''}
                  onChange={(e) => onFieldChange('debt_credit_amount', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            ) : (
              <p className={`mt-1 text-sm font-medium ${
                (client.debt_credit_amount || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(client.debt_credit_amount)}
                {(client.debt_credit_amount || 0) >= 0 ? ' (Credit)' : ' (Debt)'}
              </p>
            )}
          </div>
        </div>
      </ClientDetailSection>
    </div>
  )
} 