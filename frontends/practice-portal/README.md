# Practice Portal - Professional Frontend Structure

## 🏗️ Architecture Overview

This is a professional, scalable frontend structure for the AgentBooks Practice Portal built with Next.js 13+ App Router, TypeScript, and Tailwind CSS.

## 📁 Folder Structure

```
practice-portal/
├── app/                      # Next.js App Router pages
│   ├── dashboard/           # Dashboard page
│   ├── clients/             # Client management page  
│   ├── invoices/            # Invoice management page
│   ├── users/               # User management page
│   ├── api/                 # API routes (NextAuth)
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (redirects to dashboard)
│   ├── providers.tsx        # Context providers
│   └── globals.css          # Global styles
├── components/              # Reusable React components
│   ├── layout/              # Layout components
│   │   └── AppLayout.tsx    # Main application layout with sidebar
│   └── navigation/          # Navigation components
│       └── Sidebar.tsx      # Vertical navigation sidebar
├── constants/               # Application constants
│   ├── navigation.tsx       # Navigation configuration with RBAC
│   └── permissions.ts       # Role-based permission definitions
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts          # Authentication management
│   └── usePermissions.ts   # Permission checking utilities
├── types/                   # TypeScript type definitions
│   └── index.ts            # All application types
├── utils/                   # Utility functions
│   └── navigation.ts       # Navigation helpers
└── README.md               # This documentation
```

## 🔐 Role-Based Access Control (RBAC)

### User Roles & Permissions

| Feature | Practice Owner | Accountant | Bookkeeper | Payroll |
|---------|---------------|------------|------------|---------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Clients | ✅ | ✅ | ✅ | ❌ |
| Manage Clients | ✅ | ✅ | ❌ | ❌ |
| View Invoices | ✅ | ✅ | ❌ | ❌ |
| Manage Invoices | ✅ | ✅ | ❌ | ❌ |
| View Users | ✅ | ❌ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ❌ | ❌ |

### Navigation Access

The sidebar navigation automatically adjusts based on user role:
- **Practice Owner**: Dashboard, Clients, Invoice Management, User Management
- **Accountant**: Dashboard, Clients, Invoice Management  
- **Bookkeeper**: Dashboard, Clients
- **Payroll**: Dashboard only

## 🎨 Design System

- **Framework**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS
- **Icons**: Heroicons (SVG)
- **Typography**: Inter font family
- **Color Scheme**: Professional blue/gray palette

### Role Color Coding
- **Practice Owner**: Purple (`bg-purple-500`)
- **Accountant**: Blue (`bg-blue-500`)
- **Bookkeeper**: Green (`bg-green-500`) 
- **Payroll**: Orange (`bg-orange-500`)

## 🔌 Integration

### Authentication Flow
1. Users authenticate via Auth Portal (port 3000)
2. JWT token passed via URL parameter or localStorage
3. Token validated with backend API
4. User redirected to appropriate dashboard

### API Integration
- Backend API: `http://localhost:8000`
- Endpoints: `/users/me/token-data`, `/customers/practice/{id}`, `/users/practice/{id}`
- Authentication: Bearer token in Authorization header

## 🚀 Key Features

### 1. **Professional Dashboard**
- Role-specific content and metrics
- Quick actions based on permissions
- Recent activity feed
- Beautiful stat cards with icons

### 2. **Client Management**
- Full client directory with search/filter
- Client status tracking
- Company associations
- Permission-based edit controls

### 3. **Invoice Management** (Practice Owner & Accountant)
- Invoice listing with status indicators
- Revenue analytics
- Payment tracking
- Create/edit capabilities

### 4. **User Management** (Practice Owner only)
- Staff member management
- Client user access control
- Role assignment
- Activity monitoring

### 5. **Responsive Design**
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interface
- Professional appearance on all devices

## 🛡️ Security Features

- **Authentication**: JWT token validation
- **Authorization**: Route-level permission checks
- **RBAC**: Component-level access control
- **Session Management**: Automatic token refresh/logout
- **Error Handling**: Graceful permission denied states

## 🔧 Development

### Adding New Pages
1. Create page in `app/` directory
2. Add navigation item to `constants/navigation.tsx`
3. Define permissions in `constants/permissions.ts`
4. Update types in `types/index.ts`

### Adding New Roles
1. Add role to `UserRole` enum in `types/index.ts`
2. Define permissions in `constants/permissions.ts`
3. Add role colors in components
4. Update navigation access

### Custom Hooks Pattern
- `useAuth()`: Authentication state management
- `usePermissions()`: Permission checking utilities
- Follow same pattern for new hooks

## 📱 Mobile Support

The interface is fully responsive with:
- Collapsible sidebar on mobile
- Touch-friendly navigation
- Optimized layouts for small screens
- Progressive enhancement

## 🎯 Performance

- **Code Splitting**: Automatic with Next.js App Router
- **Lazy Loading**: Components load on demand
- **Optimized Builds**: Production-ready optimizations
- **Caching**: Efficient API response caching

This structure provides a solid foundation for scaling the practice portal with additional features, roles, and functionality while maintaining clean code organization and professional design standards. 