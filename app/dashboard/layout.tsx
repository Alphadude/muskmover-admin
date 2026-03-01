'use client'

import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Map pathnames to titles
  const getTitle = (path: string) => {
    if (path === '/dashboard') return 'Dashboard'
    if (path.startsWith('/dashboard/companies/')) return 'Company Details'
    if (path === '/dashboard/companies/new') return 'Add Company'
    if (path === '/dashboard/companies') return 'Marine Companies'
    
    if (path.endsWith('/edit') && path.includes('/equipment/')) return 'Edit Asset'
    if (path.endsWith('/orders') && path.includes('/equipment/')) return 'Asset Orders'
    if (path === '/dashboard/equipment/new') return 'Add Asset'
    if (path.startsWith('/dashboard/equipment/')) return 'Asset Details'
    if (path === '/dashboard/equipment') return 'Equipment Inventory'
    
    if (path.startsWith('/dashboard/orders')) return 'Order Registry'
    if (path.startsWith('/dashboard/analytics')) return 'Analytics'
    if (path.startsWith('/dashboard/users')) return 'Admin Users'
    if (path.startsWith('/dashboard/settings')) return 'Settings'
    if (path === '/dashboard/notifications') return 'Notifications'
    return 'Admin Portal'
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={getTitle(pathname)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
