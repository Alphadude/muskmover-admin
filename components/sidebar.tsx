'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  Anchor,
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    icon: <BarChart3 className="w-5 h-5" />,
    label: 'Dashboard',
  },
  {
    href: '/dashboard/companies',
    icon: <Users className="w-5 h-5" />,
    label: 'Marine Companies',
  },
  {
    href: '/dashboard/equipment',
    icon: <Package className="w-5 h-5" />,
    label: 'Equipment',
  },
  {
    href: '/dashboard/orders',
    icon: <ShoppingCart className="w-5 h-5" />,
    label: 'Orders',
  },
  {
    href: '/dashboard/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    label: 'Analytics',
  },
  {
    href: '/dashboard/users',
    icon: <Users className="w-5 h-5" />,
    label: 'Admin Users',
  },
  {
    href: '/dashboard/settings',
    icon: <Settings className="w-5 h-5" />,
    label: 'Settings',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [userData, setUserData] = useState({ name: '', email: '', role: 'Administrator' })

  const toggleMenu = () => setIsOpen(!isOpen)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = sessionStorage.getItem('userName') || 'Admin User'
      const email = sessionStorage.getItem('userEmail') || ''
      setUserData(prev => ({ ...prev, name, email }))
    }
  }, [])

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.clear()
      router.push('/auth/login')
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <Menu className="w-6 h-6 text-foreground" />
        )}
      </button>

      {/* Sidebar overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="p-6 border-b border-border flex items-center gap-3">
            <div className="flex-shrink-0">
              <img 
                src="https://muskmover.ng/logo.png" 
                alt="MuskMover Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#050B20] tracking-tight">MuskMover</h1>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent/10'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-border p-4 space-y-3">
            <div className="px-4 py-3 rounded-lg bg-accent/10">
              <p className="text-sm font-medium text-foreground">{userData.name}</p>
              <p className="text-xs text-muted-foreground">{userData.role}</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-foreground hover:bg-accent/10 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer for desktop */}
      <div className="hidden lg:block w-64" />
    </>
  )
}
