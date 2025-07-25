import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      role: string
      practiceId: string
      clientIds: string[]
      accessToken: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
    practiceId: string
    clientIds: string[]
    accessToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: string
    practiceId: string
    clientIds: string[]
    accessToken: string
  }
} 