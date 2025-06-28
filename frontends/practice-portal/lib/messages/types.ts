// lib/messages/types.ts
// ==========================================
// MESSAGE SERVICE TYPES
// ==========================================

import { BaseEntity } from '../shared/types'

// Message enums to match backend
export enum MessageType {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email'
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

// Core message interface
export interface Message extends BaseEntity {
  practice_id: string
  customer_id: string
  user_id?: string
  message_type: MessageType
  content: string
  subject?: string
  phone_number?: string
  email_address?: string
  is_incoming: boolean
  status: MessageStatus
  twilio_sid?: string
  metadata?: Record<string, any>
  read_at?: string
  sent_at?: string
  delivered_at?: string
}

// Message list item (simplified for lists)
export interface MessageListItem {
  id: string
  customer_id: string
  customer_name: string
  message_type: MessageType
  content: string
  is_incoming: boolean
  status: MessageStatus
  created_at: string
  read_at?: string
}

// Message send data
export interface MessageSendData {
  customer_id: string
  message_type: MessageType
  content: string
  subject?: string
  phone_number?: string
  email_address?: string
  metadata?: Record<string, any>
}

// Message update data
export interface MessageUpdateData {
  status?: MessageStatus
  metadata?: Record<string, any>
}

// Conversation response
export interface ConversationResponse {
  customer_id: string
  customer_name: string
  messages: Message[]
  total_count: number
}

// Message response wrapper
export interface MessageResponse {
  success: boolean
  message: string
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

// Customer with message summary for UI
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
