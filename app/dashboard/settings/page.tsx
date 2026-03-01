'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, Shield, Package, Lock, Globe, Save } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border border-border overflow-hidden sticky top-20">
            <nav className="space-y-0">
              {[
                { icon: Globe, label: 'General', id: 'general' },
                { icon: Shield, label: 'Security', id: 'security' },
                { icon: Bell, label: 'Notifications', id: 'notifications' },
                { icon: Package, label: 'Marketplace', id: 'marketplace' },
                { icon: Lock, label: 'Privacy', id: 'privacy' },
              ].map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-accent/10 transition-colors border-l-2 border-transparent hover:border-primary"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              General Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Platform Name
                </label>
                <Input
                  defaultValue="MuskMover Marine Marketplace"
                  className="max-w-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Platform Email
                </label>
                <Input
                  type="email"
                  defaultValue="admin@muskmover.ng"
                  className="max-w-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Support Phone
                </label>
                <Input
                  defaultValue="+234 701 234 5678"
                  className="max-w-md"
                />
              </div>
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Commission Settings */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Commission Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Platform Commission Rate (%)
                </label>
                <Input
                  type="number"
                  defaultValue="15"
                  min="0"
                  max="100"
                  className="max-w-md"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Percentage charged on each transaction
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Minimum Order Value (₦)
                </label>
                <Input
                  type="number"
                  defaultValue="50000"
                  className="max-w-md"
                />
              </div>
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Verification Settings */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Verification Requirements
            </h3>
            <div className="space-y-3">
              {[
                'Company Registration Certificate',
                'Tax Identification Number',
                'Business License',
                'Bank Account Verification',
                'Insurance Certificate',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-border cursor-pointer"
                  />
                  <label className="text-sm text-foreground cursor-pointer flex-1">
                    {item}
                  </label>
                </div>
              ))}
              <Button className="gap-2 mt-4">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Security Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Session Timeout (minutes)
                </label>
                <Input
                  type="number"
                  defaultValue="30"
                  className="max-w-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Maximum Login Attempts
                </label>
                <Input
                  type="number"
                  defaultValue="5"
                  className="max-w-md"
                />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-border cursor-pointer"
                />
                <label className="text-sm text-foreground cursor-pointer flex-1">
                  Require Two-Factor Authentication for Admins
                </label>
              </div>
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
