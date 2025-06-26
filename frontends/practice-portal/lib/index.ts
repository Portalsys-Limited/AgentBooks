// lib/index.ts
// ==========================================
// MAIN LIB EXPORTS
// Clean imports for all services and types
// ==========================================

// Export API client (most commonly needed)
export * from './api-client'

// Export shared types (used across services)
export * from './shared/types'

// Export all service modules
export * from './search'
export * from './clients'
export * from './customers'
export * from './associations'
export * from './users'

// For convenience, also provide namespaced exports
import * as Search from './search'
import * as Clients from './clients'
import * as Customers from './customers'
import * as Associations from './associations'
import * as Users from './users'

export { Search, Clients, Customers, Associations, Users } 