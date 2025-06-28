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
  CustomerWithMessages,
  Individual,
  IndividualWithMessages
} from './types'
import { getCustomers } from '../customers/service'

/**
 * Get all individuals for the current practice
 * Backend: GET /individuals/
 */
export async function getIndividuals(): Promise<Individual[]> {
  return api.get<Individual[]>('/individuals/')
}

/**
 * Send a message (WhatsApp or email)
 * Backend: POST /messages/send
 */
export async function sendMessage(data: MessageSendData): Promise<MessageResponse> {
  return api.post<MessageResponse>('/messages/send', data)
}

/**
 * Get all messages for a specific individual (customer)
 * Backend: GET /messages/individual/{individual_id}
 */
export async function getIndividualMessages(
  individualId: string,
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
  
  return api.get<ConversationResponse>(`/messages/individual/${individualId}?${params}`)
}

/**
 * Get WhatsApp messages for a specific individual (customer)
 * Backend: GET /messages/individual/{individual_id}/whatsapp
 */
export async function getIndividualWhatsAppMessages(
  individualId: string,
  limit: number = 50,
  offset: number = 0
): Promise<MessageListItem[]> {
  return api.get<MessageListItem[]>(`/messages/individual/${individualId}/whatsapp?limit=${limit}&offset=${offset}`)
}

/**
 * Get all messages for a specific customer (alias for getIndividualMessages for backward compatibility)
 */
export async function getCustomerMessages(
  customerId: string,
  messageType?: MessageType,
  limit: number = 50,
  offset: number = 0
): Promise<ConversationResponse> {
  return getIndividualMessages(customerId, messageType, limit, offset)
}

/**
 * Get WhatsApp messages for a specific customer (alias for getIndividualWhatsAppMessages for backward compatibility)
 */
export async function getCustomerWhatsAppMessages(
  customerId: string,
  limit: number = 50,
  offset: number = 0
): Promise<MessageListItem[]> {
  return getIndividualWhatsAppMessages(customerId, limit, offset)
}

/**
 * Get a specific message by ID
 */
export async function getMessage(messageId: string): Promise<Message> {
  return api.get<Message>(`/messages/${messageId}`)
}

/**
 * Update message status (internal use)
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
 * Get individuals with message summary for the communication page
 * This function fetches all individuals and enriches them with message activity data
 */
export async function getIndividualsWithMessageSummary(): Promise<IndividualWithMessages[]> {
  try {
    // Get all individuals first
    const individuals = await getIndividuals()
    console.log('Loaded individuals:', individuals)
    
    // Fetch message data for each individual
    const individualsWithMessages: IndividualWithMessages[] = await Promise.all(
      individuals.map(async (individual) => {
        try {
          // Get recent messages for this individual to determine activity
          const conversation = await getIndividualMessages(individual.id, undefined, 10, 0)
          
          // Count unread messages (incoming messages without read_at)
          const unreadCount = conversation.messages.filter(
            msg => msg.is_incoming && !msg.read_at
          ).length
          
          // Get the most recent message timestamp
          const lastMessage = conversation.messages[0] // messages are ordered by most recent first
          const lastContact = lastMessage ? lastMessage.created_at : undefined
          
          return {
            id: individual.id,
            full_name: individual.full_name,
            first_name: individual.first_name,
            last_name: individual.last_name,
            email: individual.email,
            phone: individual.phone,
            status: 'active' as const,
            last_contact: lastContact,
            unread_count: unreadCount,
            total_messages: conversation.total_count,
            avatar: individual.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
          }
        } catch (error) {
          // If we can't get messages for this individual, still include them with zero counts
          console.warn(`Could not load messages for individual ${individual.id}:`, error)
          return {
            id: individual.id,
            full_name: individual.full_name,
            first_name: individual.first_name,
            last_name: individual.last_name,
            email: individual.email,
            phone: individual.phone,
            status: 'active' as const,
            unread_count: 0,
            total_messages: 0,
            avatar: individual.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
          }
        }
      })
    )
    
    // Sort individuals by message activity:
    // 1. Individuals with unread messages first
    // 2. Then by most recent contact
    // 3. Then by total message count
    // 4. Finally alphabetically by name
    const sortedIndividuals = individualsWithMessages.sort((a, b) => {
      // Unread messages take priority
      if (a.unread_count !== b.unread_count) {
        return b.unread_count - a.unread_count
      }
      
      // Then sort by most recent contact
      if (a.last_contact && b.last_contact) {
        return new Date(b.last_contact).getTime() - new Date(a.last_contact).getTime()
      }
      if (a.last_contact && !b.last_contact) return -1
      if (!a.last_contact && b.last_contact) return 1
      
      // Then by total message count
      if (a.total_messages !== b.total_messages) {
        return b.total_messages - a.total_messages
      }
      
      // Finally alphabetically
      return a.full_name.localeCompare(b.full_name)
    })
    
    return sortedIndividuals
  } catch (error) {
    console.error('Error fetching individuals with message summary:', error)
    return []
  }
}

/**
 * Get customers with message summary for the communication page (DEPRECATED - use getIndividualsWithMessageSummary)
 * This function fetches all customers and enriches them with message activity data
 */
export async function getCustomersWithMessageSummary(): Promise<CustomerWithMessages[]> {
  try {
    // Get all customers first
    const customers = await getCustomers()
    
    // Fetch message data for each customer (treating customers as individuals)
    const customersWithMessages: CustomerWithMessages[] = await Promise.all(
      customers.map(async (customer) => {
        try {
          // Get recent messages for this customer using the individual endpoint
          const conversation = await getIndividualMessages(customer.id, undefined, 10, 0)
          
          // Count unread messages (incoming messages without read_at)
          const unreadCount = conversation.messages.filter(
            msg => msg.is_incoming && !msg.read_at
          ).length
          
          // Get the most recent message timestamp
          const lastMessage = conversation.messages[0] // messages are ordered by most recent first
          const lastContact = lastMessage ? lastMessage.created_at : undefined
          
          return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            status: 'active' as const,
            last_contact: lastContact,
            unread_count: unreadCount,
            total_messages: conversation.total_count,
            companies: [], // Could be populated from customer relationships
            avatar: customer.name.split(' ').map(n => n[0]).join('').toUpperCase()
          }
        } catch (error) {
          // If we can't get messages for this customer, still include them with zero counts
          console.warn(`Could not load messages for customer ${customer.id}:`, error)
          return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            status: 'active' as const,
            unread_count: 0,
            total_messages: 0,
            companies: [],
            avatar: customer.name.split(' ').map(n => n[0]).join('').toUpperCase()
          }
        }
      })
    )
    
    // Sort customers by message activity:
    // 1. Customers with unread messages first
    // 2. Then by most recent contact
    // 3. Then by total message count
    // 4. Finally alphabetically by name
    const sortedCustomers = customersWithMessages.sort((a, b) => {
      // Unread messages take priority
      if (a.unread_count !== b.unread_count) {
        return b.unread_count - a.unread_count
      }
      
      // Then sort by most recent contact
      if (a.last_contact && b.last_contact) {
        return new Date(b.last_contact).getTime() - new Date(a.last_contact).getTime()
      }
      if (a.last_contact && !b.last_contact) return -1
      if (!a.last_contact && b.last_contact) return 1
      
      // Then by total message count
      if (a.total_messages !== b.total_messages) {
        return b.total_messages - a.total_messages
      }
      
      // Finally alphabetically
      return a.name.localeCompare(b.name)
    })
    
    return sortedCustomers
  } catch (error) {
    console.error('Error fetching customers with message summary:', error)
    return []
  }
}

/**
 * Bulk validate multiple phone numbers
 */
export async function validateMultiplePhoneNumbers(
  phoneNumbers: string[]
): Promise<Array<{ phone_number: string; is_valid: boolean; formatted_for_whatsapp?: string }>> {
  const validationPromises = phoneNumbers.map(async (phoneNumber) => {
    try {
      const result = await validatePhoneNumber(phoneNumber)
      return {
        phone_number: phoneNumber,
        is_valid: result.data.is_valid,
        formatted_for_whatsapp: result.data.formatted_for_whatsapp
      }
    } catch (error) {
      return {
        phone_number: phoneNumber,
        is_valid: false
      }
    }
  })
  
  return Promise.all(validationPromises)
}

/**
 * Get message analytics data based on practice stats
 */
export async function getMessageAnalytics(): Promise<{
  total_messages: number
  weekly_messages: number
  whatsapp_percentage: number
  email_percentage: number
  growth_rate?: number
}> {
  try {
    const stats = await getMessagingStats()
    
    const whatsapp_percentage = stats.total_messages > 0 
      ? Math.round((stats.whatsapp_messages / stats.total_messages) * 100)
      : 0
    
    const email_percentage = stats.total_messages > 0
      ? Math.round((stats.email_messages / stats.total_messages) * 100)
      : 0
    
    return {
      total_messages: stats.total_messages,
      weekly_messages: stats.weekly_messages,
      whatsapp_percentage,
      email_percentage
    }
  } catch (error) {
    console.error('Error fetching message analytics:', error)
    throw error
  }
}

/**
 * Check Twilio sandbox setup status
 */
export async function checkTwilioSetupStatus(): Promise<{
  qr_available: boolean
  participants_count: number
  setup_complete: boolean
}> {
  try {
    const [qrResponse, participantsResponse] = await Promise.all([
      getTwilioSandboxQR().catch(() => ({ success: false })),
      getTwilioSandboxParticipants().catch(() => ({ success: false, data: { total_count: 0 } }))
    ])
    
    return {
      qr_available: qrResponse.success,
      participants_count: participantsResponse.data?.total_count || 0,
      setup_complete: qrResponse.success && (participantsResponse.data?.total_count || 0) > 0
    }
  } catch (error) {
    console.error('Error checking Twilio setup status:', error)
    return {
      qr_available: false,
      participants_count: 0,
      setup_complete: false
    }
  }
}
