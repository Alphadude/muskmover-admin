'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Package, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Building,
  Mail,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { orderService } from '@/lib/services/order'
import { equipmentService } from '@/lib/services/equipment'
import { Order, Equipment, MarineCompany } from '@/lib/types'
import { companyService } from '@/lib/services/company'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'

export default function OrderDetailsPage() {
  const router = useRouter()
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [asset, setAsset] = useState<Equipment | null>(null)
  const [company, setCompany] = useState<MarineCompany | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true)
        const orderData = await orderService.getById(id as string)
        
        // Unwrap order data if nested
        const resolvedOrder = (orderData as any).data || orderData
        setOrder(resolvedOrder)

        // Fetch asset (Equipment or Vessel)
        if (resolvedOrder.equipmentId) {
          const equipmentData = await equipmentService.getById(String(resolvedOrder.equipmentId))
          const resolvedAsset = (equipmentData as any).data || equipmentData
          setAsset(resolvedAsset)

          // Fetch company if companyId exists
          if (resolvedAsset.companyId) {
            const companyData = await companyService.getById(String(resolvedAsset.companyId))
            setCompany((companyData as any).data || companyData)
          }
        } else if (resolvedOrder.vesselId) {
          // Fallback for vessels (assuming they use equipment endpoints or similar)
          try {
             const vesselData = await equipmentService.getById(String(resolvedOrder.vesselId))
             const resolvedVessel = (vesselData as any).data || vesselData
             setAsset(resolvedVessel)
             if (resolvedVessel.companyId) {
                const companyData = await companyService.getById(String(resolvedVessel.companyId))
                setCompany((companyData as any).data || companyData)
             }
          } catch (e) {
             console.error('Vessel fetch failed:', e)
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch order details')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) fetchDetails()
  }, [id])

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { icon: <CheckCircle className="w-4 h-4" />, className: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Completed' }
      case 'active':
        return { icon: <TrendingUp className="w-4 h-4" />, className: 'bg-blue-50 text-blue-600 border-blue-100', label: 'Active' }
      case 'pending':
        return { icon: <Clock className="w-4 h-4" />, className: 'bg-amber-50 text-amber-600 border-amber-100', label: 'Pending Payment' }
      case 'confirmed':
        return { icon: <ShieldCheck className="w-4 h-4" />, className: 'bg-indigo-50 text-indigo-600 border-indigo-100', label: 'Confirmed' }
      case 'cancelled':
        return { icon: <AlertCircle className="w-4 h-4" />, className: 'bg-rose-50 text-rose-600 border-rose-100', label: 'Cancelled' }
      default:
        return { icon: <Clock className="w-4 h-4" />, className: 'bg-slate-50 text-slate-600 border-slate-100', label: status }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Retrieving agreement details...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="p-10 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'The requested lease agreement could not be retrieved from the server.'}</p>
        <Button onClick={() => router.push('/dashboard/orders')} variant="outline">Return to Orders</Button>
      </div>
    )
  }

  const status = getStatusConfig(order.status)
  const startDate = new Date(order.startDate)
  const endDate = new Date(order.endDate)
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C]/80">
            <span className="cursor-pointer hover:text-[#EA580C]" onClick={() => router.push('/dashboard/orders')}>Orders</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-400">Agreement {order.orderNumber}</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push('/dashboard/orders')}
                className="rounded-full hover:bg-slate-100 -ml-2"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lease Agreement</h1>
            <Badge className={`${status.className} border rounded-md px-2 py-1 text-[10px] uppercase font-bold flex items-center gap-1.5 shadow-none ml-2`}>
              {status.icon}
              {status.label}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border-slate-200">
            <FileText className="w-4 h-4 mr-2 text-slate-400" />
            Download PDF
          </Button>
          <div className="flex h-10 items-center bg-[#EA580C] rounded-xl overflow-hidden shadow-sm shadow-[#EA580C]/20 hover:shadow-md hover:shadow-[#EA580C]/30 transition-all">
            <Button 
              onClick={() => router.push(`/dashboard/orders/${id}/manage`)}
              className="h-full px-5 bg-transparent hover:bg-white/10 text-white border-0 text-xs font-bold uppercase tracking-wider rounded-none"
            >
              Manage Status
            </Button>
            <Separator orientation="vertical" className="h-4 bg-white/20" />
            <Button size="icon" className="h-full w-10 bg-transparent hover:bg-white/10 text-white border-0 rounded-none">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: Information Cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Renter Information Card */}
          <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden group transition-all hover:border-[#EA580C]/30 hover:shadow-md cursor-default">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#EA580C] rounded-full" />
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Renter Profile</CardTitle>
              </div>
              <User className="w-4 h-4 text-slate-300" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-[#EA580C] shrink-0 border border-slate-200">
                  <User size={32} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 flex-1">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                    <p className="text-base font-bold text-slate-900">{order.renterName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-base font-bold text-slate-900 flex items-center gap-2">
                       {order.renterEmail}
                       <Mail className="w-3.5 h-3.5 text-slate-300" />
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                    <p className="text-sm font-bold text-slate-900">{order.phone || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company</p>
                    <p className="text-sm font-bold text-slate-900">{order.company || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Person</p>
                    <p className="text-sm font-bold text-slate-900">{order.contactPerson || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Industry Sector</p>
                    <p className="text-sm font-bold text-slate-900">{order.industrySector || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Location</p>
                    <p className="text-sm font-bold text-slate-900">{order.projectLocation || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration / Crew</p>
                    <p className="text-sm font-bold text-slate-900">
                      {order.totalDuration || 'N/A'} {order.crewRequested ? '(With Crew)' : ''}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-1 md:col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Status</p>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs capitalize">
                       <CheckCircle size={14} /> Verified Account
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asset Information Card */}
          <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden group transition-all hover:border-blue-500/30 hover:shadow-md cursor-default">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Asset Specifications</CardTitle>
              </div>
              <Package className="w-4 h-4 text-slate-300" />
            </CardHeader>
            <CardContent className="p-6">
              {asset ? (
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="relative w-full md:w-48 h-32 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0 group-hover:border-blue-500/20 transition-colors">
                    {asset.images?.[0] ? (
                      <Image 
                        src={asset.images[0]} 
                        alt={asset.name} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <Package size={32} />
                        <span className="text-[10px] font-bold uppercase mt-2">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 flex-1 pt-1">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Equipment Name</p>
                      <p className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{asset.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asset Category</p>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-600 rounded-md font-bold text-[10px] uppercase border-none px-2 shadow-none">
                        {asset.category?.replace('-', ' ')}
                      </Badge>
                    </div>
                    {company && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Owner Company</p>
                        <p className="text-sm font-bold text-slate-900 hover:underline cursor-pointer flex items-center gap-1.5" onClick={() => router.push(`/dashboard/companies/${company.id}`)}>
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {company.name}
                          <ExternalLink className="w-3 h-3 text-slate-300" />
                        </p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Condition</p>
                      <p className="text-sm font-bold text-slate-700 capitalize flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {asset.condition || 'Good'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center space-y-2">
                  <p className="text-sm font-bold text-slate-400">Asset Data Missing</p>
                  <p className="text-xs text-slate-300 tracking-tighter uppercase font-medium">Internal Reference: ID {order.equipmentId || order.vesselId}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Section: Valuation & Summary */}
        <div className="space-y-6">
          {/* Valuation Card */}
          <Card className="rounded-2xl border-none bg-slate-900 text-white shadow-xl shadow-slate-200 overflow-hidden relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/10 transition-colors" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#EA580C]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl group-hover:bg-[#EA580C]/20 transition-colors" />
            
            <CardHeader className="pt-8 px-8 border-none relative z-10 text-center">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Total Agreement Value</CardTitle>
              <p className="text-5xl font-black tracking-tighter text-white">
                 ₦{order.totalPrice.toLocaleString()}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                 <Badge variant="outline" className="border-white/10 text-white/60 bg-white/5 text-[9px] uppercase font-bold tracking-widest rounded-full py-0.5 px-3">
                   Vat Inclusive
                 </Badge>
                 <Badge variant="outline" className="border-[#EA580C]/30 text-[#EA580C] bg-[#EA580C]/10 text-[9px] uppercase font-bold tracking-widest rounded-full py-0.5 px-3">
                   Secured Payment
                 </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6 relative z-10">
              <Separator className="bg-white/10" />
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">Agreement Term</span>
                  <span className="font-bold">{durationDays} Days</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">Daily Asset Rate</span>
                  <span className="font-bold text-[#EA580C]">₦{(order.totalPrice / Math.max(1, durationDays)).toLocaleString()} / day</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">Service Fee</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-tighter">₦0.00 (Promo)</span>
                </div>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 group-hover:border-white/10 transition-all">
                <CreditCard className="w-5 h-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payment Strategy</p>
                  <p className="text-xs font-bold text-white capitalize">{order.paymentStatus || 'Secured Gateway'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logistics Summary */}
          <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Lease Logistics</CardTitle>
              </div>
              <Calendar className="w-4 h-4 text-slate-300" />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="relative pl-8 border-l-2 border-slate-100 space-y-8 py-2">
                <div className="relative">
                  <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-white border-4 border-[#EA580C] shadow-sm z-10" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#EA580C] uppercase tracking-widest">Handover Date</p>
                    <p className="text-sm font-bold text-slate-900">{startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-[10px] font-medium text-slate-400">Deployment begins at 08:00 AM WAT</p>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-white border-4 border-slate-200 shadow-sm z-10 group-hover:border-slate-400 transition-colors" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Return Date</p>
                    <p className="text-sm font-bold text-slate-900">{endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-[10px] font-medium text-slate-400">Scheduled inspection at return hub</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-900 border border-slate-100 shadow-sm">
                   <ShieldCheck size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lease Insurance</p>
                   <p className="text-xs font-bold text-slate-900">Full Operational Coverage Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
