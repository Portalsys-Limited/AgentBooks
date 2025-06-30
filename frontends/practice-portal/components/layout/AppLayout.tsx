'use client'

import React from 'react'
import Sidebar from '../navigation/Sidebar'
import TopNavBar from '../navigation/TopNavBar'
import { useAuth } from '../../hooks/useAuth'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useAuth hook
  }

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Top Navigation Bar - Full Width Overlay */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopNavBar user={user} onLogout={logout} />
      </div>
      
      {/* Sidebar */}
      <div className="flex-none">
        <Sidebar user={user} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Add top padding to account for fixed nav bar */}
        <div className="h-16"></div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
} 