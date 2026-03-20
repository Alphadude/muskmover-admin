'use client'

import { settingsService } from '@/lib/services/settings'
import { PlatformSettings } from '@/lib/types'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Bell, Shield, Package, Lock, Globe, Save, User } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [activeTab, setActiveTab] = useState('general')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState({ name: '', email: '', role: 'Administrator' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await settingsService.getSettings()
        setSettings(data)
        
        // Fetch local profile data
        const name = sessionStorage.getItem('userName') || 'Admin User'
        const email = sessionStorage.getItem('userEmail') || 'admin@muskmover.ng'
        setProfileData({ name, email, role: 'Administrator' })
      } catch (err: any) {
        toast.error('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleUpdateSettings = async (updates: Partial<PlatformSettings>) => {
    if (!settings) return
    try {
      setIsSaving(true)
      const updated = await settingsService.updateSettings({ ...settings, ...updates })
      setSettings(updated)
      toast.success('Settings updated successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    sessionStorage.setItem('userName', profileData.name)
    sessionStorage.setItem('userEmail', profileData.email)
    toast.success('Profile updated locally')
    // In a real app, we'd call an API here
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border border-border overflow-hidden sticky top-20">
            <nav className="space-y-0">
              {[
                { icon: User, label: 'Profile', id: 'profile' },
                { icon: Globe, label: 'General', id: 'general' },
                { icon: Shield, label: 'Security', id: 'security' },
                { icon: Bell, label: 'Notifications', id: 'notifications' },
                { icon: Package, label: 'Marketplace', id: 'marketplace' },
                { icon: Lock, label: 'Privacy', id: 'privacy' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors border-l-2 ${
                    activeTab === item.id 
                    ? 'bg-primary/5 border-primary text-primary' 
                    : 'text-foreground hover:bg-accent/10 border-transparent'
                  }`}
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
          {activeTab === 'profile' && (
            <div className="bg-card rounded-lg border border-border p-6 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-lg font-semibold text-foreground mb-6">Profile Settings</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Display Name</label>
                  <Input 
                    value={profileData.name} 
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                    className="max-w-md" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Email Address</label>
                  <Input 
                    type="email" 
                    value={profileData.email} 
                    onChange={e => setProfileData({...profileData, email: e.target.value})}
                    className="max-w-md" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Role</label>
                  <Input value={profileData.role} disabled className="max-w-md bg-slate-50" />
                  <p className="text-xs text-muted-foreground mt-2">Role permissions are managed by system administrators.</p>
                </div>
                <Button type="submit" className="gap-2">
                  <Save className="w-4 h-4" />
                  Update Profile
                </Button>
              </form>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="bg-card rounded-lg border border-border p-6 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-lg font-semibold text-foreground mb-6">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Platform Name</label>
                  <Input
                    defaultValue={settings.name}
                    onChange={e => setSettings({...settings, name: e.target.value})}
                    className="max-w-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Platform Email</label>
                  <Input
                    type="email"
                    defaultValue={settings.email}
                    onChange={e => setSettings({...settings, email: e.target.value})}
                    className="max-w-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Support Phone</label>
                  <Input
                    defaultValue={settings.phone}
                    onChange={e => setSettings({...settings, phone: e.target.value})}
                    className="max-w-md"
                  />
                </div>
                <Button 
                  className="gap-2" 
                  disabled={isSaving}
                  onClick={() => handleUpdateSettings({ name: settings.name, email: settings.email, phone: settings.phone })}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'marketplace' && (
            <div className="bg-card rounded-lg border border-border p-6 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-lg font-semibold text-foreground mb-6">Commission Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Platform Commission Rate (%)</label>
                  <Input
                    type="number"
                    defaultValue={settings.commissionRate}
                    onChange={e => setSettings({...settings, commissionRate: Number(e.target.value)})}
                    className="max-w-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Minimum Order Value (₦)</label>
                  <Input
                    type="number"
                    defaultValue={settings.minOrderValue}
                    onChange={e => setSettings({...settings, minOrderValue: Number(e.target.value)})}
                    className="max-w-md"
                  />
                </div>
                <Button 
                  className="gap-2"
                  disabled={isSaving}
                  onClick={() => handleUpdateSettings({ commissionRate: settings.commissionRate, minOrderValue: settings.minOrderValue })}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-card rounded-lg border border-border p-6 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-lg font-semibold text-foreground mb-6">Security Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Session Timeout (minutes)</label>
                  <Input
                    type="number"
                    defaultValue={settings.sessionTimeout}
                    onChange={e => setSettings({...settings, sessionTimeout: Number(e.target.value)})}
                    className="max-w-md"
                  />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50">
                  <input
                    type="checkbox"
                    checked={settings.require2FA}
                    onChange={e => handleUpdateSettings({ require2FA: e.target.checked })}
                    className="w-4 h-4 rounded border-border cursor-pointer"
                  />
                  <label className="text-sm text-foreground cursor-pointer flex-1">Require Two-Factor Authentication for Admins</label>
                </div>
                <Button 
                  className="gap-2"
                  disabled={isSaving}
                  onClick={() => handleUpdateSettings({ sessionTimeout: settings.sessionTimeout })}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
