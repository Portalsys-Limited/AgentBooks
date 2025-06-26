# API Services Documentation

## 🏗️ **New Architecture Overview**

This project now uses **direct backend calls** instead of Next.js API routes for better scalability and maintainability.

### **Structure:**
```
lib/
├── api-client.ts          # Central fetchFromBackend function
├── types.ts              # All TypeScript interfaces  
├── services/
│   ├── search-service.ts    # Search functionality
│   ├── client-service.ts    # Client CRUD operations
│   ├── customer-service.ts  # Customer CRUD operations
│   ├── association-service.ts # Customer-Client relationships
│   └── index.ts            # Clean exports
└── README.md             # This file
```

## 🚀 **Quick Usage Examples**

### **Search (Most Common)**
```typescript
import { search } from '../../lib/services'

// Simple search
const results = await search('John Doe', 20)

// Advanced search options
import { searchCustomersAndClients } from '../../lib/services'
const results = await searchCustomersAndClients({
  q: 'company',
  limit: 50,
  search_customers: true,
  search_clients: false
})
```

### **Client Operations**
```typescript
import { 
  getClients, 
  getClient, 
  createClient, 
  updateClient,
  deleteClient 
} from '../../lib/services'

// Get all clients
const clients = await getClients()

// Get specific client with full details
const client = await getClient('client-id')

// Create new client
const newClient = await createClient({
  name: 'ACME Corp',
  business_type: 'limited_company',
  email: 'info@acme.com'
})

// Update client with services
await updateClient('client-id', {
  name: 'Updated Name',
  services: [
    { service_id: 'bookkeeping', is_enabled: true },
    { service_id: 'payroll', is_enabled: false }
  ]
})
```

### **Customer Operations**
```typescript
import { 
  getCustomers, 
  getCustomer, 
  createCustomer, 
  updateCustomer 
} from '../../lib/services'

// Get all customers
const customers = await getCustomers()

// Create new customer
const customer = await createCustomer({
  name: 'John Doe',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com'
})
```

### **Error Handling**
```typescript
import { ApiError } from '../../lib/services'

try {
  const results = await search('query')
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.status}: ${error.message}`)
    // Handle specific status codes
    if (error.status === 401) {
      // Handle auth error (already handled automatically)
    }
  } else {
    console.error('Network error:', error.message)
  }
}
```

## 🔧 **Converting Existing Pages**

### **Before (❌ Old Way):**
```typescript
const response = await fetch('/api/search/?q=query', {
  headers: { 'Content-Type': 'application/json' }
})
const data = await response.json()
```

### **After (✅ New Way):**
```typescript
import { search } from '../../lib/services'
const data = await search('query')
```

## 🎯 **Benefits**

1. **Reusable**: Same functions across all components
2. **Type Safe**: Full TypeScript support
3. **Error Handling**: Centralized error management
4. **Authentication**: Automatic token handling
5. **Maintainable**: API changes in one place
6. **Testable**: Easy to unit test

## 🔄 **Migration Guide**

1. **Replace fetch calls** with service functions
2. **Remove duplicate interfaces** (use centralized types)
3. **Update error handling** to use ApiError
4. **Remove Next.js API routes** (optional - they're now redundant)

## 📝 **Environment Variables**

Make sure you have:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
``` 