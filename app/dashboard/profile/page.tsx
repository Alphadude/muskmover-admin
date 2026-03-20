'use client'

import { useEffect, useState } from 'react'
import { authService } from '@/lib/services/auth'
import { AdminUser } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Shield, 
  Clock, 
  Calendar,
  ChevronRight,
  Camera,
  Lock,
  LogOut
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getMe()
        setUser(data as any)
      } catch (err) {
        toast.error('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSignOut = () => {
    sessionStorage.clear()
    router.push('/auth/login')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Could not load profile. Please try again.</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
          Reload
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header & Avatar */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-700">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        </div>
        <div className="absolute -bottom-12 left-8 flex items-end gap-6 text-white sm:text-slate-900">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-primary overflow-hidden">
               {user.avatar ? (
                 <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                 <User className="w-10 h-10" />
               )}
            </div>
            <button className="absolute -bottom-1 -right-1 p-2 rounded-lg bg-primary text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="pb-2">
            <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)} · Administrator
            </p>
          </div>
        </div>
        <div className="absolute -bottom-8 right-8 flex items-center gap-3">
          <Button variant="outline" onClick={handleSignOut} className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive h-10 px-4 rounded-xl">
             <LogOut className="w-4 h-4" /> Sign Out
          </Button>
          <Button className="bg-[#050B20] hover:bg-[#050B20]/90 text-white h-10 px-6 rounded-xl font-bold">
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
        {/* Left Column: Stats & Meta */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Account Overview</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                     <Calendar className="w-4 h-4" />
                   </div>
                   <span className="text-sm text-slate-500">Joined</span>
                 </div>
                 <span className="text-sm font-bold text-slate-900">
                   {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Mar 2024'}
                 </span>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                     <Clock className="w-4 h-4" />
                   </div>
                   <span className="text-sm text-slate-500">Last Login</span>
                 </div>
                 <span className="text-sm font-bold text-slate-900">
                   {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Today'}
                 </span>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                     <Shield className="w-4 h-4" />
                   </div>
                   <span className="text-sm text-slate-500">Status</span>
                 </div>
                 <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="rounded-md uppercase text-[10px] tracking-widest font-bold">
                   {user.status || 'active'}
                 </Badge>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Personal Data & Settings */}
        <div className="md:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
             <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
               <User className="w-5 h-5 text-primary" />
               Personal Information
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                 <Input value={user.name} readOnly className="h-11 rounded-xl bg-slate-50 border-slate-200" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                 <Input value={user.email} readOnly className="h-11 rounded-xl bg-slate-50 border-slate-200" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Role</label>
                 <Input value={user.role} readOnly className="h-11 rounded-xl bg-slate-50 border-slate-200" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account ID</label>
                 <Input value={user.id} readOnly className="h-11 rounded-xl bg-slate-50 border-slate-200 font-mono text-[10px]" />
               </div>
             </div>
           </div>

           <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
             <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
               <Lock className="w-5 h-5 text-primary" />
               Security Settings
             </h2>
             <div className="divide-y divide-slate-100">
                <div className="py-4 flex items-center justify-between">
                   <div>
                     <p className="text-sm font-bold text-slate-900">Change Password</p>
                     <p className="text-xs text-slate-500">Update your account password periodically.</p>
                   </div>
                   <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-slate-50">
                     <ChevronRight className="w-5 h-5" />
                   </Button>
                </div>
                <div className="py-4 flex items-center justify-between">
                   <div>
                     <p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
                     <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                   </div>
                   <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">Disabled</Badge>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
