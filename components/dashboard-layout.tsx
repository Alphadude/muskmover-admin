'use client'

import { Sidebar } from './sidebar'
import { Header } from './header'

interface DashboardLayoutProps {
  title: string
  children: React.ReactNode
}

export function DashboardLayout({ title, children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header title={title} />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
