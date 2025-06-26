import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '../utils/api-client'
import { requireAuth, handleApiError } from '../utils/auth-helpers'

export async function GET() {
  try {
    const { error, session } = await requireAuth()
    if (error) return error
    
    const apiClient = await createApiClient()
    const response = await apiClient.get('/customers')
    
    return NextResponse.json(response.data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error
    
    const body = await request.json()
    const apiClient = await createApiClient()
    const response = await apiClient.post('/customers', body)
    
    return NextResponse.json(response.data, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
} 