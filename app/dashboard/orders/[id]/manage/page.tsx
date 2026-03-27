'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  Save,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { orderService } from '@/lib/services/order'
import { equipmentService } from '@/lib/services/equipment'
import { Order } from '@/lib/types'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function ManageOrderStatusPage() {
  const router = useRouter()
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [asset, setAsset] = useState<any | null>(null)

  // Form State
  const [status, setStatus] = useState<string>('')
  const [paymentStatus, setPaymentStatus] = useState<string>('')

  useEffect(() => {
    const fetchOrderAndAsset = async () => {
      try {
        setIsLoading(true)
        const orderData = await orderService.getById(id as string)
        const resolvedOrder = (orderData as any).data || orderData
        setOrder(resolvedOrder)
        setStatus(resolvedOrder.status)
        setPaymentStatus(resolvedOrder.paymentStatus || 'pending')

        // Fetch associated asset for sync later
        const assetId = resolvedOrder.equipmentId || resolvedOrder.vesselId
        if (assetId) {
          try {
            const assetData = await equipmentService.getById(String(assetId))
            setAsset((assetData as any).data || assetData)
          } catch (e) {
            console.error('Failed to pre-fetch asset:', e)
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch order details')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) fetchOrderAndAsset()
  }, [id])

  const handleSave = async () => {
    try {
      if (!order) return
      setIsSaving(true)
      
      // 1. Prepare Full Order Payload (Backend requires full schema for PUT)
      const updatePayload = {
        ...order,
        status,
        paymentStatus
      }
      delete (updatePayload as any).equipment
      delete (updatePayload as any).vessel
      delete (updatePayload as any).id

      // 2. Update Order Status
      await orderService.update(id as string, updatePayload)

      // 3. Automated Asset Sync (Side Effect)
      // Use the pre-fetched asset to provide a full schema update
      if (asset) {
        let newAssetStatus = ''
        if (status === 'active') newAssetStatus = 'rented'
        else if (status === 'completed' || status === 'cancelled') newAssetStatus = 'available'
        
        if (newAssetStatus && newAssetStatus !== asset.status) {
          try {
            const assetUpdatePayload = {
              ...asset,
              status: newAssetStatus
            }
            delete (assetUpdatePayload as any).id // ID in URL
            await equipmentService.update(String(asset.id), assetUpdatePayload)
          } catch (syncErr) {
            console.error('Asset status sync failed:', syncErr)
          }
        }
      }

      toast.success('Agreement and Asset updated successfully')
      router.push(`/dashboard/orders/${id}`)
    } catch (err: any) {
      console.error('Save failed:', err)
      toast.error(err.message || 'Failed to update status')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading management console...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="p-10 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-sm text-slate-500">{error || 'Unable to retrieve agreement record for modification.'}</p>
        <Button onClick={() => router.push(`/dashboard/orders/${id}`)} variant="outline">Return to Details</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Header & Navigation */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#EA580C]/80">
          <span className="cursor-pointer hover:text-[#EA580C]" onClick={() => router.push('/dashboard/orders')}>Orders</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="cursor-pointer hover:text-[#EA580C]" onClick={() => router.push(`/dashboard/orders/${id}`)}>
            Agreement {order.orderNumber}
          </span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-400">Manage Status</span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push(`/dashboard/orders/${id}`)}
              className="rounded-full hover:bg-slate-100 -ml-2"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight text-left">Manage Agreement Lifecycle</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Agreement Summary Card (Snapshot) */}
        <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-slate-50/30">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6">
              <div className="flex items-center gap-4 col-span-2 md:col-span-1 border-r border-slate-200 pr-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#EA580C] shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Target</p>
                   <p className="text-lg font-bold text-slate-900">{order.orderNumber}</p>
                </div>
              </div>
              
              <div className="space-y-1 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Company / Entity</p>
                <p className="text-sm font-bold text-slate-700 truncate">{order.company || order.renterName}</p>
                <p className="text-xs font-semibold text-slate-400 truncate tracking-tight">{order.renterEmail}</p>
              </div>

              <div className="space-y-1 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contact Person</p>
                <p className="text-sm font-bold text-slate-700 truncate">{order.contactPerson || order.renterName}</p>
                <p className="text-xs font-semibold text-slate-400 truncate tracking-tight">{order.phone || 'No phone provided'}</p>
              </div>

              <div className="space-y-1 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Value</p>
                <p className="text-lg font-black text-[#EA580C]">₦{(order.totalPrice || 0).toLocaleString()}</p>
              </div>
              
              <div className="space-y-1 flex flex-col justify-center col-span-2 md:col-span-2 border-t border-slate-100 pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Logistics & Location</p>
                <p className="text-sm font-bold text-slate-700">{order.projectLocation || 'N/A'}</p>
                <p className="text-xs font-semibold text-slate-400">{order.industrySector || 'N/A'}</p>
              </div>
              
              <div className="space-y-1 flex flex-col justify-center col-span-2 md:col-span-2 border-t border-slate-100 pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operation Scope</p>
                <p className="text-sm font-bold text-slate-700">Duration: {order.totalDuration || '1 Day'}</p>
                <p className="text-xs font-semibold text-emerald-600">{order.crewRequested ? 'Includes Operational Crew' : 'Equipment Only (No Crew)'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Controllers */}
        <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-8">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Status Controllers</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-10">
            
            {/* Lease Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#EA580C]" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Lease Status</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">Define the current operational phase of this equipment lease.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-[#EA580C] focus:border-[#EA580C]">
                    <SelectValue placeholder="Select Lease Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="pending" className="py-3 focus:bg-amber-50 focus:text-amber-700 font-medium">
                       <div className="flex items-center gap-2">
                         <Clock className="w-3.5 h-3.5 text-amber-500" />
                         <span>Pending Setup</span>
                       </div>
                    </SelectItem>
                    <SelectItem value="active" className="py-3 focus:bg-blue-50 focus:text-blue-700 font-medium">
                       <div className="flex items-center gap-2">
                         <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                         <span>Active Operational</span>
                       </div>
                    </SelectItem>
                    <SelectItem value="completed" className="py-3 focus:bg-emerald-50 focus:text-emerald-700 font-medium">
                       <div className="flex items-center gap-2">
                         <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                         <span>Completed / Returned</span>
                       </div>
                    </SelectItem>
                    <SelectItem value="cancelled" className="py-3 focus:bg-rose-50 focus:text-rose-700 font-medium text-rose-600">
                       <div className="flex items-center gap-2">
                         <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                         <span>Cancelled Agreement</span>
                       </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <Info className="w-4 h-4 text-slate-400 shrink-0" />
                   <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
                     Changing to <span className="font-bold text-slate-900 uppercase">Active</span> indicates the equipment has been handed over to the renter.
                   </p>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Payment Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#EA580C]" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Financial Status</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">Manage the financial clearance for this specific transaction.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-[#EA580C] focus:border-[#EA580C]">
                    <SelectValue placeholder="Select Payment Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="pending" className="py-3 font-medium">
                       Pending Payment
                    </SelectItem>
                    <SelectItem value="paid" className="py-3 font-medium text-emerald-600">
                       Paid & Settled
                    </SelectItem>
                    <SelectItem value="refunded" className="py-3 font-medium text-rose-600">
                       Refunded
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                   <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                   <p className="text-[10px] leading-relaxed text-emerald-700 font-medium">
                     Payment is handled via the <span className="font-bold uppercase tracking-tight">MuskPay Secure Gateway</span>. Confirm local settlement manually if necessary.
                   </p>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-100" />
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
               <Button 
                 onClick={handleSave} 
                 disabled={isSaving}
                 className="w-full sm:w-auto px-8 h-12 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white rounded-xl shadow-lg shadow-[#EA580C]/20 text-sm font-bold uppercase tracking-widest"
               >
                 {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Lifecycle Changes
                    </>
                 )}
               </Button>
               <Button 
                 variant="ghost" 
                 onClick={() => router.push(`/dashboard/orders/${id}`)}
                 className="w-full sm:w-auto h-12 px-8 text-slate-500 font-bold uppercase tracking-widest text-xs"
               >
                 Cancel
               </Button>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  )
}
