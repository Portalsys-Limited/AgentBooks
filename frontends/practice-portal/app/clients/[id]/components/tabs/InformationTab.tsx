'use client'

import React from 'react'
import {
  IdentificationIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  BanknotesIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import CollapsibleSection from '../CollapsibleSection'

interface ClientDetail {
  id: string
  business_name: string
  business_type?: string
  companies_house_number?: string
  vat_number?: string
  corporation_tax_utr?: string
  paye_reference?: string
  nature_of_business?: string
  sic_code?: string
  incorporation_date?: string
  accounting_period_end?: string
  main_email?: string
  main_phone?: string
  registered_address?: {
    line_1?: string
    line_2?: string
    city?: string
    county?: string
    postcode?: string
    country?: string
  }
  trading_address?: {
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
  notes?: string
  created_at?: string
  updated_at?: string
  customer?: {
    id: string
    name: string
    first_name?: string
    last_name?: string
    email?: string
  }
}

interface InformationTabProps {
  client: ClientDetail
  onFieldChange: (key: string, value: string) => void
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

export default function InformationTab({ client, onFieldChange }: InformationTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-4">
        {/* Client Information Section */}
        <CollapsibleSection
          title="Client Information"
          icon={IdentificationIcon}
          isInitiallyExpanded={true}
          onFieldChange={onFieldChange}
          fields={[
            { key: 'business_name', label: 'Business Name', value: client.business_name },
            { key: 'business_type', label: 'Business Type', value: client.business_type },
            { key: 'companies_house_number', label: 'Companies House Number', value: client.companies_house_number },
            { key: 'vat_number', label: 'VAT Number', value: client.vat_number },
            { key: 'corporation_tax_utr', label: 'Corporation Tax UTR', value: client.corporation_tax_utr },
            { key: 'paye_reference', label: 'PAYE Reference', value: client.paye_reference },
            { key: 'sic_code', label: 'SIC Code', value: client.sic_code },
            { key: 'incorporation_date', label: 'Incorporation Date', value: formatDate(client.incorporation_date), type: 'date' },
            { key: 'accounting_period_end', label: 'Accounting Period End', value: formatDate(client.accounting_period_end), type: 'date' },
            { key: 'nature_of_business', label: 'Nature of Business', value: client.nature_of_business, type: 'textarea' }
          ]}
        />

        {/* Contact Information Section */}
        <CollapsibleSection
          title="Contact Information"
          icon={EnvelopeIcon}
          onFieldChange={onFieldChange}
          fields={[
            { key: 'main_email', label: 'Main Email', value: client.main_email, type: 'email' },
            { key: 'main_phone', label: 'Main Phone', value: client.main_phone, type: 'tel' }
          ]}
        />

        {/* Banking Information Section */}
        <CollapsibleSection
          title="Banking Information"
          icon={BanknotesIcon}
          onFieldChange={onFieldChange}
          fields={[
            { key: 'banking.name', label: 'Bank Name', value: client.banking?.name },
            { key: 'banking.account_name', label: 'Account Name', value: client.banking?.account_name },
            { key: 'banking.sort_code', label: 'Sort Code', value: client.banking?.sort_code },
            { key: 'banking.account_number', label: 'Account Number', value: client.banking?.account_number }
          ]}
        />
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        {/* Addresses Section */}
        <CollapsibleSection
          title="Addresses"
          icon={MapPinIcon}
          onFieldChange={onFieldChange}
          fields={[
            { key: 'registered_address.line_1', label: 'Registered Address Line 1', value: client.registered_address?.line_1 },
            { key: 'registered_address.line_2', label: 'Registered Address Line 2', value: client.registered_address?.line_2 },
            { key: 'registered_address.city', label: 'Registered City', value: client.registered_address?.city },
            { key: 'registered_address.county', label: 'Registered County', value: client.registered_address?.county },
            { key: 'registered_address.postcode', label: 'Registered Postcode', value: client.registered_address?.postcode },
            { key: 'registered_address.country', label: 'Registered Country', value: client.registered_address?.country },
            { key: 'trading_address.line_1', label: 'Trading Address Line 1', value: client.trading_address?.line_1 },
            { key: 'trading_address.line_2', label: 'Trading Address Line 2', value: client.trading_address?.line_2 },
            { key: 'trading_address.city', label: 'Trading City', value: client.trading_address?.city },
            { key: 'trading_address.county', label: 'Trading County', value: client.trading_address?.county },
            { key: 'trading_address.postcode', label: 'Trading Postcode', value: client.trading_address?.postcode },
            { key: 'trading_address.country', label: 'Trading Country', value: client.trading_address?.country }
          ]}
        />

        {/* Notes Section */}
        <CollapsibleSection
          title="Notes"
          icon={DocumentTextIcon}
          onFieldChange={onFieldChange}
          fields={[
            { key: 'notes', label: 'Notes', value: client.notes, type: 'textarea' }
          ]}
        />

        {/* Customer Information Section */}
        {client.customer && (
          <CollapsibleSection
            title="Customer Information"
            icon={UserIcon}
            fields={[
              { key: 'customer.name', label: 'Customer Name', value: client.customer.name, editable: false },
              { key: 'customer.email', label: 'Customer Email', value: client.customer.email, editable: false }
            ]}
          />
        )}

        {/* Metadata Section */}
        <CollapsibleSection
          title="Record Information"
          icon={CalendarIcon}
          fields={[
            { key: 'created_at', label: 'Created', value: formatDate(client.created_at), editable: false },
            { key: 'updated_at', label: 'Last Updated', value: formatDate(client.updated_at), editable: false }
          ]}
        />
      </div>
    </div>
  )
} 