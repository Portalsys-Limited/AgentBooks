'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '../../../components/layout/AppLayout'
import { useAuth } from '../../../hooks/useAuth'
import { 
  UserIcon, 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  PencilIcon,
  ArrowLeftIcon,
  IdentificationIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'

interface CustomerDetail {
  id: string
  name: string
  first_name?: string
  last_name?: string
  primary_email?: string
  secondary_email?: string
  primary_phone?: string
  secondary_phone?: string
  date_of_birth?: string
  gender?: string
  marital_status?: string
  national_insurance_number?: string
  utr?: string
  home_address?: {
    line_1?: string
    line_2?: string
    city?: string
    county?: string
    postcode?: string
    country?: string
  }
  correspondence_address?: {
    line_1?: string
    line_2?: string
    city?: string
    county?: string
    postcode?: string
    country?: string
  }
  banking?: {
    name?: string
    sort_code?: string
    account_number?: string
    account_name?: string
  }
  employment?: {
    employer_name?: string
    job_title?: string
    employment_status?: string
  }
  emergency_contact?: {
    name?: string
    relationship?: string
    phone?: string
    email?: string
  }
  notes?: string
  client_companies?: Array<{
    id: string
    business_name: string
    business_type?: string
  }>
  created_at?: string
  updated_at?: string
}

export default function CustomerDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string
  
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (customerId) {
      fetchCustomer()
    }
  }, [customerId])

  const fetchCustomer = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`http://localhost:8000/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch customer: ${response.status}`)
      }

      const data = await response.json()
      setCustomer(data)
    } catch (err) {
      console.error('Error fetching customer:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch customer')
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address?: any) => {
    if (!address) return 'Not provided'
    const parts = [
      address.line_1,
      address.line_2,
      address.city,
      address.county,
      address.postcode,
      address.country
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'Not provided'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided'
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    )
  }

  if (error || !customer) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Customer</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error || 'Customer not found'}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/clients')}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Back to Customers & Clients
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                {customer.first_name && customer.last_name && (
                  <p className="text-lg text-gray-500">{customer.first_name} {customer.last_name}</p>
                )}
                <p className="text-sm text-gray-400">Customer ID: {customer.id}</p>
              </div>
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Customer
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <IdentificationIcon className="h-5 w-5 mr-2" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(customer.date_of_birth)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{customer.gender || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{customer.marital_status || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">National Insurance Number</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.national_insurance_number || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">UTR</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.utr || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Primary Email</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.primary_email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Secondary Email</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.secondary_email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Primary Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.primary_phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Secondary Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{customer.secondary_phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                Addresses
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Home Address</label>
                  <p className="mt-1 text-sm text-gray-900">{formatAddress(customer.home_address)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Correspondence Address</label>
                  <p className="mt-1 text-sm text-gray-900">{formatAddress(customer.correspondence_address)}</p>
                </div>
              </div>
            </div>

            {/* Banking Information */}
            {customer.banking && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <BanknotesIcon className="h-5 w-5 mr-2" />
                  Banking Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                    <p className="mt-1 text-sm text-gray-900">{customer.banking.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Name</label>
                    <p className="mt-1 text-sm text-gray-900">{customer.banking.account_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sort Code</label>
                    <p className="mt-1 text-sm text-gray-900">{customer.banking.sort_code || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Number</label>
                    <p className="mt-1 text-sm text-gray-900">{customer.banking.account_number || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {customer.notes && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{customer.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Companies */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                Companies ({customer.client_companies?.length || 0})
              </h3>
              {customer.client_companies && customer.client_companies.length > 0 ? (
                <div className="space-y-3">
                  {customer.client_companies.map((company) => (
                    <div key={company.id} className="p-3 border border-gray-200 rounded-md">
                      <div className="font-medium text-gray-900">{company.business_name}</div>
                      {company.business_type && (
                        <div className="text-sm text-gray-500 capitalize">
                          {company.business_type.replace('_', ' ')}
                        </div>
                      )}
                      <button
                        onClick={() => router.push(`/companies/${company.id}`)}
                        className="text-sm text-blue-600 hover:text-blue-500 mt-1"
                      >
                        View Details →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No companies associated with this client.</p>
              )}
            </div>

            {/* Metadata */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Record Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(customer.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(customer.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 