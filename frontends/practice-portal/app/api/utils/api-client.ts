import axios from 'axios'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export const createApiClient = async () => {
  const session = await getServerSession(authOptions)
  const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL
  
  return axios.create({
    baseURL: apiUrl,
    headers: {
      'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : undefined,
      'Content-Type': 'application/json'
    }
  })
}

export const createApiClientWithToken = (token: string) => {
  const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL
  
  return axios.create({
    baseURL: apiUrl,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
} 