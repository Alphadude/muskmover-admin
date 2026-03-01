'use client'

import { Bell, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-white/80 backdrop-blur-xl transition-all duration-300 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500/80">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* User Profile */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-slate-100 transition-colors"
            aria-label="User Profile"
          >
            <User className="w-5 h-5 text-slate-600" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
          </Button>

          {/* Quick filter */}
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 hover:bg-slate-50 rounded-lg ml-1"
          >
            <Calendar className="w-4 h-4" />
            <span className="font-bold">This Month</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
