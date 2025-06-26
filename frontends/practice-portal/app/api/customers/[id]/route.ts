import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '../../utils/api-client'
import { requireAuth, handleApiError } from '../../utils/auth-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error
    
    const apiClient = await createApiClient()
    const response = await apiClient.get(`/customers/${params.id}`)
    
    return NextResponse.json(response.data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error
    
    const body = await request.json()
    const apiClient = await createApiClient()
    const response = await apiClient.put(`/customers/${params.id}`, body)
    
    return NextResponse.json(response.data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error
    
    const apiClient = await createApiClient()
    const response = await apiClient.delete(`/customers/${params.id}`)
    
    return NextResponse.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
} 