import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '../utils/api-client'
import { requireAuth, handleApiError } from '../utils/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = searchParams.get('limit') || '20'
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }
    
    const apiClient = await createApiClient()
    const response = await apiClient.get(`/search/?q=${encodeURIComponent(query)}&limit=${limit}`)
    
    return NextResponse.json(response.data)
  } catch (error) {
    return handleApiError(error)
  }
} 