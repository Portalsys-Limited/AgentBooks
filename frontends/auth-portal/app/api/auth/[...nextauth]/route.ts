import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Use internal Docker network URL for server-side requests
          const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL
          const response = await axios.post(`${apiUrl}/auth/login`, {
            email: credentials.email,
            password: credentials.password
          })

          if (response.data.access_token) {
            // Get user data from token
            const tokenResponse = await axios.get(`${apiUrl}/users/me/token-data`, {
              headers: {
                Authorization: `Bearer ${response.data.access_token}`
              }
            })

            const userData = tokenResponse.data
            
            return {
              id: userData.user_id,
              email: userData.email,
              role: userData.role,
              practiceId: userData.practice_id,
              clientIds: userData.client_ids,
              accessToken: response.data.access_token
            }
          }
          return null
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.practiceId = user.practiceId
        token.clientIds = user.clientIds
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string
        session.user.practiceId = token.practiceId as string
        session.user.clientIds = token.clientIds as string[]
        session.user.accessToken = token.accessToken as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle role-based redirection after login
      return url.startsWith(baseUrl) ? url : baseUrl
    },
  },
  pages: {
    signIn: '/login',
  },
})

export { handler as GET, handler as POST } 