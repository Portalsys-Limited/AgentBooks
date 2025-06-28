// lib/messages/types.ts
// ==========================================
// MESSAGE SERVICE TYPES
// ==========================================

import { BaseEntity } from '../shared/types'

// Message enums to match backend
export enum MessageType {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  SMS = 'sms'
}

export enum MessageDirection {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing'
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

// Individual entity (from backend)
export interface Individual extends BaseEntity {
  practice_id: string
  first_name: string
  last_name: string
  full_name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
}

// Individual with message summary for UI
export interface IndividualWithMessages {
  id: string
  full_name: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  status: 'active' | 'inactive' | 'pending'
  last_contact?: string
  unread_count: number
  total_messages: number
  avatar?: string
}

// Core message interface
export interface Message {
  id: string
  practice_id: string
  individual_id: string
  user_id?: string
  message_type: MessageType
  direction: MessageDirection
  status: MessageStatus
  body: string
  from_address: string
  to_address: string
  twilio_sid?: string
  error_message?: string
  message_metadata?: Record<string, any>
  created_at: string
  updated_at?: string
  read_at?: string
  delivered_at?: string
}

// Message list item (simplified for lists)
export interface MessageListItem {
  id: string
  message_type: MessageType
  direction: MessageDirection
  status: MessageStatus
  body: string
  created_at: string
  individual_name?: string
  individual_id: string
  read_at?: string
  delivered_at?: string
  updated_at?: string
}

// Message send data
export interface MessageSendData {
  individual_id: string
  message_type: MessageType
  body: string
}

// Message update data
export interface MessageUpdateData {
  status?: MessageStatus
  error_message?: string
  metadata?: Record<string, any>
}

// Conversation response
export interface ConversationResponse {
  individual_id: string
  individual_name: string
  messages: MessageListItem[]
  total_count: number
}

// Message response wrapper
export interface MessageResponse {
  success: boolean
  message?: string
  data?: Message
}

// Messaging statistics
export interface MessagingStats {
  total_messages: number
  weekly_messages: number
  whatsapp_messages: number
  email_messages: number
  period: {
    week_start: string
    today: string
  }
}

// Phone validation response
export interface PhoneValidationResponse {
  success: boolean
  data: {
    phone_number: string
    is_valid: boolean
    formatted_for_whatsapp?: string
  }
}

// Twilio sandbox response
export interface TwilioSandboxResponse {
  success: boolean
  data?: {
    qr_image_url?: string
    sandbox_number?: string
    instructions?: string
    note?: string
  }
  error?: string
  suggestion?: string
  status_code?: number
}

// Twilio participants response
export interface TwilioParticipantsResponse {
  success: boolean
  data?: {
    participants: string[]
    total_count: number
    note?: string
  }
  error?: string
  status_code?: number
}

// Customer with message summary for UI (DEPRECATED - use IndividualWithMessages)
export interface CustomerWithMessages {
  id: string
  name: string
  email?: string
  phone?: string
  status: 'active' | 'inactive' | 'pending'
  last_contact?: string
  unread_count: number
  total_messages: number
  companies?: string[]
  avatar?: string
}
