'use client'

import { useEffect, useState, use } from 'react'
import { userService } from '@/lib/services/user'
import { AdminUser, UserRole, UserStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Shield, 
  Clock, 
  Calendar,
  ChevronLeft,
  Activity,
  UserCheck
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getById(id)
        const userData = (data as any).admin || (data as any).data || data
        setUser(userData)
      } catch (err) {
        toast.error('Failed to load user data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mx-auto mb-4">
          <User className="w-8 h-8" />
        </div>
        <p className="text-slate-500 font-medium">User not found or has been deleted.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/users')} className="mt-6 rounded-xl">
          Back to Team
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:border-slate-400 transition-colors shadow-sm">
            <ChevronLeft className="w-4 h-4" />
          </div>
          Back to Team
        </button>
        <div className="flex items-center gap-2">
           <Badge variant={user.status === 'active' ? 'outline' : 'secondary'} className={`rounded-full px-4 py-1.5 uppercase text-[10px] tracking-widest font-bold ${user.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : ''}`}>
             {user.status || 'Active'}
           </Badge>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
           <div className="relative group">
            <div className="w-32 h-32 rounded-[2rem] bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center text-slate-400 overflow-hidden">
                <span className="text-4xl font-black text-slate-300">
                   {user.name.charAt(0).toUpperCase()}
                </span>
            </div>
            <div className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-primary text-white shadow-lg">
               <Shield className="w-5 h-5" />
            </div>
           </div>
           
           <div className="flex-1 text-center md:text-left space-y-2">
             <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</h1>
               <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#050B20] text-white text-[10px] uppercase font-bold tracking-widest">
                  {user.role}
               </div>
             </div>
             <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
               <Mail className="w-4 h-4" />
               {user.email}
             </p>
             <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                <div className="flex flex-col items-center md:items-start">
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Team Access</span>
                   <span className="text-sm font-bold text-slate-700">Full Portal</span>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div className="flex flex-col items-center md:items-start">
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Last Activity</span>
                   <span className="text-sm font-bold text-slate-700">Today · 09:42 AM</span>
                </div>
             </div>
           </div>
           
           <div className="flex md:flex-col gap-3">
              <Button onClick={() => router.push(`/dashboard/users?edit=${user.id}`)} className="bg-[#050B20] hover:bg-[#050B20]/90 text-white font-bold h-12 px-8 rounded-2xl shadow-lg shadow-slate-200">
                Edit Details
              </Button>
              <Button variant="outline" className="font-bold h-12 border-slate-200 rounded-2xl px-6">
                Activity Logs
              </Button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Account Info */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Account Info</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Date Joined</span>
              </div>
              <span className="text-sm font-bold text-slate-900">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : '20 Mar 2026'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Last Login</span>
              </div>
              <span className="text-sm font-bold text-slate-900">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Active Now'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-400">
                <UserCheck className="w-4 h-4" />
                <span className="text-sm font-medium">Permissions</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Verified</span>
            </div>
          </div>
        </div>

        {/* Detailed Stats / Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm flex flex-col justify-between">
             <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mb-6">
                <Shield className="w-6 h-6" />
             </div>
             <div>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Security Score</p>
               <h4 className="text-3xl font-black text-slate-900">92%</h4>
               <p className="text-xs text-slate-500 mt-2 font-medium">Excellent protection level · 2FA Active</p>
             </div>
           </div>
           
           <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm flex flex-col justify-between">
             <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 mb-6">
                <Activity className="w-6 h-6" />
             </div>
             <div>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Actions Count</p>
               <h4 className="text-3xl font-black text-slate-900">4,120</h4>
               <p className="text-xs text-slate-500 mt-2 font-medium">Total operational actions performed</p>
             </div>
           </div>
        </div>
      </div>

      {/* System Access Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full filter blur-[100px] opacity-10 -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="space-y-3 max-w-lg">
             <h2 className="text-2xl font-black tracking-tight underline decoration-primary decoration-4 underline-offset-8 mb-4">Role Privileges</h2>
             <p className="text-slate-400 font-medium leading-relaxed">
               As a <span className="text-white font-bold">{user.role}</span>, this user has permissions to modify core system data, manage marine companies, and oversee all operational logistics.
             </p>
           </div>
           <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                 <p className="text-2xl font-black text-primary">Full</p>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Read Access</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                 <p className="text-2xl font-black text-primary">Write</p>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Write Access</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
