'use client'
import { useState } from 'react'
import { NavBar } from '@/components/NavBar'
import { Sidebar } from '@/components/Sidebar'

export function ChatLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always visible on md+, drawer on mobile */}
      <div className={[
        'fixed inset-y-0 left-0 z-50 md:relative md:z-auto',
        sidebarOpen ? 'flex' : 'hidden md:flex',
      ].join(' ')}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <NavBar onMenuClick={() => setSidebarOpen(prev => !prev)} />
        {children}
      </div>
    </div>
  )
}
