// lib/messages/service.ts
// ==========================================
// MESSAGE SERVICE FUNCTIONS
// Direct calls to backend message endpoints
// ==========================================

import { api } from '../api-client'
import { 
  Message, 
  MessageListItem, 
  MessageSendData, 
  MessageUpdateData, 
  ConversationResponse,
  MessageResponse,
  MessagingStats,
  PhoneValidationResponse,
  TwilioSandboxResponse,
  TwilioParticipantsResponse,
  MessageType,
  CustomerWithMessages
} from './types'
import { getCustomers } from '../customers/service'

/**
 * Send a message (WhatsApp or email)
 */
export async function sendMessage(data: MessageSendData): Promise<MessageResponse> {
  return api.post<MessageResponse>('/messages/send', data)
}

/**
 * Get all messages for a specific customer
 */
export async function getCustomerMessages(
  customerId: string,
  messageType?: MessageType,
  limit: number = 50,
  offset: number = 0
): Promise<ConversationResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString()
  })
  
  if (messageType) {
    params.append('message_type', messageType)
  }
  
  return api.get<ConversationResponse>(`/messages/customer/${customerId}?${params}`)
}

/**
 * Get WhatsApp messages for a specific customer
 */
export async function getCustomerWhatsAppMessages(
  customerId: string,
  limit: number = 50,
  offset: number = 0
): Promise<MessageListItem[]> {
  return api.get<MessageListItem[]>(`/messages/customer/${customerId}/whatsapp?limit=${limit}&offset=${offset}`)
}

/**
 * Get a specific message by ID
 */
export async function getMessage(messageId: string): Promise<Message> {
  return api.get<Message>(`/messages/${messageId}`)
}

/**
 * Update message status
 */
export async function updateMessageStatus(
  messageId: string, 
  data: MessageUpdateData
): Promise<Message> {
  return api.patch<Message>(`/messages/${messageId}`, data)
}

/**
 * Get messaging statistics for the practice
 */
export async function getMessagingStats(): Promise<MessagingStats> {
  return api.get<MessagingStats>('/messages/practice/stats')
}

/**
 * Validate phone number for WhatsApp
 */
export async function validatePhoneNumber(phoneNumber: string): Promise<PhoneValidationResponse> {
  return api.post<PhoneValidationResponse>('/messages/twilio/validate-phone', {
    phone_number: phoneNumber
  })
}

/**
 * Get Twilio sandbox QR code (for testing)
 */
export async function getTwilioSandboxQR(): Promise<TwilioSandboxResponse> {
  return api.get<TwilioSandboxResponse>('/messages/twilio/sandbox/qr')
}

/**
 * Get Twilio sandbox participants
 */
export async function getTwilioSandboxParticipants(): Promise<TwilioParticipantsResponse> {
  return api.get<TwilioParticipantsResponse>('/messages/twilio/sandbox/participants')
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<Message> {
  return updateMessageStatus(messageId, {
    metadata: { read_at: new Date().toISOString() }
  })
}

/**
 * Get customers with message summary for the communication page
 */
export async function getCustomersWithMessageSummary(): Promise<CustomerWithMessages[]> {
  try {
    // Get all customers first
    const customers = await getCustomers()
    
    // Transform to CustomerWithMessages format
    // Note: In a real implementation, you'd want a dedicated backend endpoint
    // that returns customers with message counts and last contact info
    const customersWithMessages: CustomerWithMessages[] = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: 'active', // You'd get this from the customer data
      unread_count: 0, // This would come from a backend endpoint
      total_messages: 0, // This would come from a backend endpoint
      companies: [], // This would come from associated companies
      avatar: customer.name.split(' ').map(n => n[0]).join('').toUpperCase()
    }))
    
    return customersWithMessages
  } catch (error) {
    console.error('Error fetching customers with message summary:', error)
    return []
  }
}

/**
 * Get recent messages across all customers (for dashboard/overview)
 */
export async function getRecentMessages(limit: number = 20): Promise<MessageListItem[]> {
  // Note: This would need a dedicated backend endpoint
  // For now, this is a placeholder that would need to be implemented
  throw new Error('getRecentMessages endpoint not yet implemented in backend')
}

/**
 * Search messages by content
 */
export async function searchMessages(
  query: string,
  customerId?: string,
  messageType?: MessageType
): Promise<MessageListItem[]> {
  // Note: This would need a dedicated backend endpoint for search
  // For now, this is a placeholder that would need to be implemented
  throw new Error('searchMessages endpoint not yet implemented in backend')
}

/**
 * Get message thread/conversation with context
 */
export async function getMessageThread(
  messageId: string,
  contextLimit: number = 10
): Promise<Message[]> {
  // This would get a message and surrounding context messages
  // Would need a dedicated backend endpoint
  throw new Error('getMessageThread endpoint not yet implemented in backend')
}

/**
 * Bulk mark messages as read for a customer
 */
export async function markCustomerMessagesAsRead(customerId: string): Promise<void> {
  // This would need a dedicated backend endpoint
  throw new Error('markCustomerMessagesAsRead endpoint not yet implemented in backend')
}

/**
 * Get message analytics/insights
 */
export async function getMessageAnalytics(
  startDate?: string,
  endDate?: string
): Promise<{
  response_time_avg: number
  messages_by_day: Array<{ date: string, count: number }>
  top_customers: Array<{ customer_id: string, customer_name: string, message_count: number }>
}> {
  // This would need a dedicated backend endpoint for analytics
  throw new Error('getMessageAnalytics endpoint not yet implemented in backend')
}
