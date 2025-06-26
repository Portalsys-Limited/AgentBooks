// lib/services/index.ts
// ==========================================
// BARREL EXPORTS FOR CLEAN IMPORTS
// Import all services from one place
// ==========================================

// Re-export all service functions
export * from './search-service'
export * from './client-service'
export * from './customer-service'
export * from './association-service'

// Re-export API client and types
export * from '../api-client'
export * from '../types' 