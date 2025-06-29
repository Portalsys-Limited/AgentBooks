// lib/individuals/service.ts
// ==========================================
// INDIVIDUAL SERVICE FUNCTIONS
// Direct calls to backend individual endpoints
// ==========================================

import { api } from '../api-client'
import { PaginatedResponse } from '../shared/types'
import { Individual } from './types'

/**
 * Get all individuals
 */
