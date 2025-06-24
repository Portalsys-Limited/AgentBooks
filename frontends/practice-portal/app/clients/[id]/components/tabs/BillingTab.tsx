'use client'

import React from 'react'

// Mock data for demonstration
const billHistory = [
  { id: 1, date: '2024-01-15', amount: 850.00, description: 'Legal consultation', status: 'Paid', paymentDate: '2024-01-20' },
  { id: 2, date: '2024-02-10', amount: 1200.00, description: 'Document review', status: 'Paid', paymentDate: '2024-02-15' },
  { id: 3, date: '2024-03-05', amount: 650.00, description: 'Contract drafting', status: 'Pending', paymentDate: null },
  { id: 4, date: '2024-03-20', amount: 950.00, description: 'Court representation', status: 'Overdue', paymentDate: null },
]

const billingInfo = {
  frequency: 'Monthly',
  paymentMethod: 'Bank Transfer',
  billingAddress: '123 Main St, New York, NY 10001',
  invoiceEmail: 'billing@client.com',
  paymentTerms: 'Net 30 days',
  lastBillingDate: '2024-03-20',
  nextBillingDate: '2024-04-20'
}

const debtorInfo = {
  totalOutstanding: 1600.00,
  overdueAmount: 950.00,
  daysPastDue: 15,
  creditLimit: 5000.00,
  availableCredit: 3400.00
}

export default function BillingTab() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'text-green-600 bg-green-100'
      case 'Pending': return 'text-yellow-600 bg-yellow-100'
      case 'Overdue': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Billing Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Billing Frequency:</span>
              <span className="text-sm text-gray-900">{billingInfo.frequency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Payment Method:</span>
              <span className="text-sm text-gray-900">{billingInfo.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Payment Terms:</span>
              <span className="text-sm text-gray-900">{billingInfo.paymentTerms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Invoice Email:</span>
              <span className="text-sm text-gray-900">{billingInfo.invoiceEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Last Billing Date:</span>
              <span className="text-sm text-gray-900">{new Date(billingInfo.lastBillingDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Next Billing Date:</span>
              <span className="text-sm text-gray-900">{new Date(billingInfo.nextBillingDate).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Billing Address</h4>
            <p className="text-sm text-gray-600">{billingInfo.billingAddress}</p>
          </div>
        </div>

        {/* Debtor Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Total Outstanding:</span>
              <span className="text-sm font-semibold text-red-600">${debtorInfo.totalOutstanding.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Overdue Amount:</span>
              <span className="text-sm font-semibold text-red-700">${debtorInfo.overdueAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Days Past Due:</span>
              <span className="text-sm font-semibold text-red-600">{debtorInfo.daysPastDue} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Credit Limit:</span>
              <span className="text-sm text-gray-900">${debtorInfo.creditLimit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Available Credit:</span>
              <span className="text-sm font-semibold text-green-600">${debtorInfo.availableCredit.toFixed(2)}</span>
            </div>
          </div>

          {debtorInfo.overdueAmount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Payment Overdue</h3>
                    <div className="mt-1 text-sm text-red-700">
                      This account has overdue payments. Please contact the client to arrange payment.
                    </div>
                  </div>
                </div>
              </div>
            </div>
                     )}
         </div>
       </div>

       {/* Bill History */}
       <div className="bg-white border border-gray-200 rounded-lg p-6">
         <h3 className="text-lg font-medium text-gray-900 mb-4">Bill History</h3>
         <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {billHistory.map((bill) => (
                 <tr key={bill.id} className="hover:bg-gray-50">
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                     {new Date(bill.date).toLocaleDateString()}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bill.description}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${bill.amount.toFixed(2)}</td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                       {bill.status}
                     </span>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                     {bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString() : '-'}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>
     </div>
   )
 } 