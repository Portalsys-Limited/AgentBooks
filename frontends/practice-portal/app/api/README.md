# Practice Portal Frontend API

This directory contains the frontend API routes for the Practice Portal. These routes act as a proxy layer between the frontend components and the backend API, providing authentication, error handling, and a consistent interface.

## 📁 Directory Structure

```
app/api/
├── auth/
│   └── [...nextauth]/route.ts     # NextAuth configuration
├── utils/
│   ├── api-client.ts              # Shared axios configuration
│   └── auth-helpers.ts            # Authentication utilities
├── users/
│   ├── route.ts                   # GET /api/users, POST /api/users
│   └── [id]/route.ts              # GET/PUT/DELETE /api/users/[id]
├── practices/
│   ├── route.ts                   # GET /api/practices, POST /api/practices
│   └── [id]/route.ts              # GET/PUT/DELETE /api/practices/[id]
├── clients/
│   ├── route.ts                   # GET /api/clients, POST /api/clients
│   └── [id]/route.ts              # GET/PUT/DELETE /api/clients/[id]
├── customers/
│   ├── route.ts                   # GET /api/customers, POST /api/customers
│   └── [id]/route.ts              # GET/PUT/DELETE /api/customers/[id]
├── search/
│   └── route.ts                   # GET /api/search
└── README.md                      # This file
```

## 🔧 How It Works

### Authentication Flow
1. User logs in through NextAuth (handled in `/auth/[...nextauth]/route.ts`)
2. NextAuth stores user session with access token
3. API routes use `requireAuth()` to validate sessions
4. Authenticated requests are proxied to backend with Bearer token

### Request Flow
```
Frontend Component → Frontend API Route → Backend API → Database
     ↓                      ↓                ↓
  fetch('/api/users')  →  createApiClient() → http://backend:8000/users
     ↓                      ↓                ↓
  Response with data  ←   Handle errors    ← JSON response
```

## 🚀 Using the API

### From Frontend Components

```typescript
// Get all users
const response = await fetch('/api/users')
const users = await response.json()

// Get specific client
const response = await fetch('/api/clients/123')
const client = await response.json()

// Create new user
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com', 
    role: 'bookkeeper' 
  })
})

// Update client
const response = await fetch('/api/clients/123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Updated Name' })
})

// Delete user
const response = await fetch('/api/users/123', {
  method: 'DELETE'
})

// Search
const response = await fetch('/api/search?q=searchterm&limit=20')
const results = await response.json()
```

## 🔨 Creating New API Routes

### Step 1: Create the Route File

For a new resource (e.g., "invoices"), create:

```
app/api/invoices/
├── route.ts           # Collection operations (GET, POST)
└── [id]/route.ts      # Individual operations (GET, PUT, DELETE)
```

### Step 2: Collection Route (`route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '../utils/api-client'
import { requireAuth, handleApiError } from '../utils/auth-helpers'

export async function GET() {
  try {
    const { error, session } = await requireAuth()
    if (error) return error
    
    const apiClient = await createApiClient()
    const response = await apiClient.get('/invoices')
    
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
    const response = await apiClient.post('/invoices', body)
    
    return NextResponse.json(response.data, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Step 3: Individual Route (`[id]/route.ts`)

```typescript
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
    const response = await apiClient.get(`/invoices/${params.id}`)
    
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
    const response = await apiClient.put(`/invoices/${params.id}`, body)
    
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
    const response = await apiClient.delete(`/invoices/${params.id}`)
    
    return NextResponse.json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Step 4: Custom Routes

For custom endpoints (non-CRUD), create specific route files:

```typescript
// app/api/reports/monthly/route.ts
export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error
    
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    
    const apiClient = await createApiClient()
    const response = await apiClient.get(`/reports/monthly?month=${month}&year=${year}`)
    
    return NextResponse.json(response.data)
  } catch (error) {
    return handleApiError(error)
  }
}
```

## 🛠️ Utility Functions

### `requireAuth()`
Validates user authentication and returns session data.

```typescript
const { error, session } = await requireAuth()
if (error) return error // Returns 401 if not authenticated
```

### `createApiClient()`
Creates an authenticated axios instance for backend requests.

```typescript
const apiClient = await createApiClient()
const response = await apiClient.get('/endpoint')
```

### `handleApiError()`
Standardizes error responses and status codes.

```typescript
catch (error) {
  return handleApiError(error) // Returns appropriate HTTP status
}
```

## 📋 Best Practices

### 1. Always Use Authentication
```typescript
const { error, session } = await requireAuth()
if (error) return error
```

### 2. Handle Errors Consistently
```typescript
try {
  // API logic
} catch (error) {
  return handleApiError(error)
}
```

### 3. Use Proper HTTP Status Codes
```typescript
// Created
return NextResponse.json(data, { status: 201 })

// No content
return NextResponse.json({ message: 'Deleted' }, { status: 200 })

// Bad request
return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
```

### 4. Validate Input Parameters
```typescript
const { searchParams } = new URL(request.url)
const limit = searchParams.get('limit') || '20'

if (!params.id) {
  return NextResponse.json({ error: 'ID is required' }, { status: 400 })
}
```

### 5. Follow RESTful Conventions

| Method | Route Pattern | Purpose |
|--------|--------------|---------|
| GET | `/api/resource` | List all items |
| POST | `/api/resource` | Create new item |
| GET | `/api/resource/[id]` | Get specific item |
| PUT | `/api/resource/[id]` | Update specific item |
| DELETE | `/api/resource/[id]` | Delete specific item |

## 🔐 Security Features

- **Automatic Authentication**: All routes require valid NextAuth session
- **Token Management**: Access tokens are handled server-side
- **Error Sanitization**: Sensitive information is not exposed in errors
- **CORS Protection**: Routes are protected by Next.js CORS policies

## 🐛 Debugging

### Common Issues

1. **401 Unauthorized**: User not logged in or session expired
2. **404 Not Found**: Backend endpoint doesn't exist
3. **405 Method Not Allowed**: HTTP method not implemented for route
4. **500 Internal Server Error**: Backend is down or returning errors

### Debugging Tips

1. Check browser network tab for actual requests
2. Look at server logs for detailed error information
3. Verify backend API endpoints exist and are accessible
4. Ensure environment variables are set correctly

## 🌐 Environment Variables

Required environment variables:

```env
# Backend API URL (internal Docker network)
INTERNAL_API_URL=http://backend:8000

# Public API URL (fallback)
NEXT_PUBLIC_API_URL=http://localhost:8000

# NextAuth configuration
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3001
```

## 📝 Examples

### Adding a New "Documents" Resource

1. Create files:
   - `app/api/documents/route.ts`
   - `app/api/documents/[id]/route.ts`

2. Use the templates above, replacing "invoices" with "documents"

3. Update backend to include `/documents` endpoints

4. Use in frontend:
   ```typescript
   const documents = await fetch('/api/documents').then(r => r.json())
   ```

This API structure provides a secure, consistent, and maintainable way to handle all frontend-to-backend communication in the Practice Portal. 