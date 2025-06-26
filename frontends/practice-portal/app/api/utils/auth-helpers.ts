import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user?.accessToken) {
    return {
      error: NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      ),
      session: null
    }
  }
  
  return { error: null, session }
}

export function handleApiError(error: any) {
  console.error('API Error:', error)
  
  if (error.response?.status === 401) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    )
  }
  
  if (error.response?.status === 403) {
    return NextResponse.json(
      { error: 'Forbidden' }, 
      { status: 403 }
    )
  }
  
  if (error.response?.status === 404) {
    return NextResponse.json(
      { error: 'Resource not found' }, 
      { status: 404 }
    )
  }
  
  return NextResponse.json(
    { error: error.response?.data?.message || 'Internal server error' }, 
    { status: error.response?.status || 500 }
  )
} 