'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Save, Calendar, User, Package, CreditCard, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { orderService } from '@/lib/services/order'
import { equipmentService } from '@/lib/services/equipment'
import { Equipment, Order } from '@/lib/types'
import { SuccessModal } from '@/components/ui/success-modal'

export default function NewOrderPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingItems, setIsLoadingItems] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([])
  const [vesselsList, setVesselsList] = useState<any[]>([])
  
  const [formData, setFormData] = useState<Partial<Order>>({
    orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    renterName: '',
    renterEmail: '',
    company: '',
    contactPerson: '',
    phone: '',
    industrySector: '',
    projectLocation: '',
    totalDuration: '',
    crewRequested: false,
    equipmentId: 0,
    vesselId: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    totalPrice: 0,
    status: 'pending',
    paymentStatus: 'pending'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const eqId = searchParams.get('equipmentId')
      const vId = searchParams.get('vesselId')
      if (eqId) {
        setFormData(prev => ({ ...prev, equipmentId: Number(eqId), vesselId: 0 }))
      } else if (vId) {
        setFormData(prev => ({ ...prev, vesselId: Number(vId), equipmentId: 0 }))
      }
    }
  }, [])

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoadingItems(true)
        const [eqRes, vRes] = await Promise.all([
          equipmentService.getAll(),
          equipmentService.getAllVessels()
        ])
        
        const eqData = 
          (eqRes as any).data?.equipment || 
          (eqRes as any).equipment || 
          (Array.isArray((eqRes as any).data) ? (eqRes as any).data : null) ||
          (Array.isArray(eqRes) ? eqRes : [])

        const vData = 
          (vRes as any).data?.vessels || 
          (vRes as any).vessels || 
          (Array.isArray((vRes as any).data) ? (vRes as any).data : null) ||
          (Array.isArray(vRes) ? vRes : [])
        
        setEquipmentList(eqData)
        setVesselsList(vData)
      } catch (err: any) {
        toast.error('Failed to load assets')
      } finally {
        setIsLoadingItems(false)
      }
    }
    fetchAssets()
  }, [])

  // Dynamic Price Calculation
  useEffect(() => {
    const selectedItem = [...equipmentList, ...vesselsList].find(
      item => Number(item.id) === (formData.equipmentId || formData.vesselId)
    )
    
    if (selectedItem && formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
      
      const rate = Number(selectedItem.dailyRate) || 0
      setFormData(prev => ({ ...prev, totalPrice: rate * diffDays }))
    }
  }, [formData.equipmentId, formData.vesselId, formData.startDate, formData.endDate, equipmentList, vesselsList])

  const handleInputChange = (field: keyof Order, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAssetSelect = (value: string) => {
    const [type, id] = value.split(':')
    if (type === 'equipment') {
      setFormData(prev => ({ ...prev, equipmentId: Number(id), vesselId: 0 }))
    } else {
      setFormData(prev => ({ ...prev, vesselId: Number(id), equipmentId: 0 }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmissionError(null)
    
    try {
      await orderService.create(formData)
      setShowSuccess(true)
      toast.success('Lease agreement created successfully!')
    } catch (err: any) {
      console.error('Submission error:', err)
      setSubmissionError(err.message || 'An unexpected error occurred while generating the lease order.')
      toast.error(err.message || 'Failed to create order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Breadcrumb - Aligned with Equipment pattern */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
        <span
          className="hover:text-foreground cursor-pointer transition-colors font-medium"
          onClick={() => router.push('/dashboard')}
        >
          Dashboard
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span
          className="hover:text-foreground cursor-pointer transition-colors font-medium"
          onClick={() => router.push('/dashboard/orders')}
        >
          Orders
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-bold">New Lease Order</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Initiate Agreement</h1>
          <p className="text-sm text-slate-500 italic">Generate a professional maritime lease documentation</p>
        </div>
        <Badge className="bg-orange-50 text-[#EA580C] border-orange-100 font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm">
           DRAFT #{formData.orderNumber?.split('-')[1]}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Identity & Asset Selection (Unified Card) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8 space-y-10">
            {/* Identity */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <div className="w-1.5 h-5 bg-primary rounded-full" />
                 Renter Identity
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name / Entity</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      value={formData.renterName} 
                      onChange={e => handleInputChange('renterName', e.target.value)}
                      placeholder="e.g. Chevron Nigeria Ltd" 
                      required 
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900 pl-12" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                    <Input 
                      value={formData.renterEmail} 
                      onChange={e => handleInputChange('renterEmail', e.target.value)}
                      type="email"
                      placeholder="procurement@entity.com" 
                      required 
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <Input 
                      value={formData.phone} 
                      onChange={e => handleInputChange('phone', e.target.value)}
                      type="tel"
                      placeholder="+234..." 
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company / Organization</label>
                    <Input 
                      value={formData.company} 
                      onChange={e => handleInputChange('company', e.target.value)}
                      placeholder="Company Name" 
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Person</label>
                    <Input 
                      value={formData.contactPerson} 
                      onChange={e => handleInputChange('contactPerson', e.target.value)}
                      placeholder="Name of Contact" 
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Industry Sector</label>
                    <Input 
                      value={formData.industrySector} 
                      onChange={e => handleInputChange('industrySector', e.target.value)}
                      placeholder="e.g. Oil & Gas" 
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Project Location</label>
                    <Input 
                      value={formData.projectLocation} 
                      onChange={e => handleInputChange('projectLocation', e.target.value)}
                      placeholder="Site or City" 
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Total Duration</label>
                    <Input 
                      value={formData.totalDuration} 
                      onChange={e => handleInputChange('totalDuration', e.target.value)}
                      placeholder="e.g. 6 Months" 
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" 
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">Crew Requested</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={formData.crewRequested || false} 
                        onChange={e => handleInputChange('crewRequested', e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-sm font-medium text-slate-700">Yes, include crew</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Asset Selection */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <div className="w-1.5 h-5 bg-primary rounded-full" />
                 Asset Selection
              </h2>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Machinery or Vessel</label>
                <Select value={formData.equipmentId ? `equipment:${formData.equipmentId}` : (formData.vesselId ? `vessel:${formData.vesselId}` : undefined)} onValueChange={handleAssetSelect} required>
                  <SelectTrigger className="w-full h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus:ring-1 focus:ring-slate-900 text-slate-700">
                    <SelectValue placeholder={isLoadingItems ? "Synchronizing Assets..." : "Choose an Asset"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {equipmentList.length > 0 && (
                      <div className="px-2 py-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">Equipments</div>
                    )}
                    {equipmentList.map(item => (
                      <SelectItem key={`e-${item.id}`} value={`equipment:${item.id}`} className="rounded-lg">
                        {item.name} (₦{Number(item.dailyRate).toLocaleString()}/day)
                      </SelectItem>
                    ))}
                    {vesselsList.length > 0 && (
                      <div className="px-2 py-1.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2 border-t border-slate-50 bg-slate-50/50">Vessels</div>
                    )}
                    {vesselsList.map(v => (
                      <SelectItem key={`v-${v.id}`} value={`vessel:${v.id}`} className="rounded-lg">
                        {v.name} (₦{Number(v.dailyRate).toLocaleString()}/day)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Right: Duration & Financial summary */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <div className="w-1.5 h-5 bg-primary rounded-full" />
                 Lease Duration
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mobilization</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      type="date" 
                      value={formData.startDate}
                      onChange={e => handleInputChange('startDate', e.target.value)}
                      required 
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900 pl-12" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Demobilization</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      type="date" 
                      value={formData.endDate}
                      onChange={e => handleInputChange('endDate', e.target.value)}
                      required 
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900 pl-12" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Card (High-Contrast) */}
            <div className="bg-[#050B20] rounded-2xl p-8 text-white space-y-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <CreditCard className="w-5 h-5 text-[#EA580C]" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Total Valuation</p>
                  <p className="text-3xl font-black tracking-tighter">₦{formData.totalPrice?.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold uppercase tracking-widest text-white/30 ml-1">Booking Status</label>
                  <Select value={formData.status} onValueChange={v => handleInputChange('status', v)}>
                     <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                     </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold uppercase tracking-widest text-white/30 ml-1">Payment Type</label>
                  <Select value={formData.paymentStatus} onValueChange={v => handleInputChange('paymentStatus', v)}>
                     <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl">
                        <SelectItem value="pending">Due on Recipt</SelectItem>
                        <SelectItem value="paid">Prepaid</SelectItem>
                        <SelectItem value="refunded">Escrow</SelectItem>
                     </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 rounded-xl bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-bold text-base transition-all active:scale-[0.98] shadow-lg shadow-orange-950/20"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    GENERATING...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <Save className="w-5 h-5" />
                    GENERATE LEASE ORDER
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <SuccessModal 
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          router.push('/dashboard/orders')
        }}
        title="Lease Agreement Generated!"
        message={`Order ${formData.orderNumber} has been successfully recorded in the system. The agreement is now in ${formData.status} status.`}
        actionLabel="View All Orders"
        onAction={() => router.push('/dashboard/orders')}
        secondaryActionLabel="Open in Workspace"
        onSecondaryAction={() => {
          setShowSuccess(false)
          router.push('/dashboard/orders')
        }}
      />

      <AlertDialog open={!!submissionError} onOpenChange={(open) => !open && setSubmissionError(null)}>
        <AlertDialogContent className="rounded-2xl border-slate-200">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-red-50 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-slate-900">
                Action Error
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap">
              {submissionError}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogAction 
              className="rounded-xl font-bold h-11 border-0 shadow-lg bg-[#050B20] hover:bg-[#050B20]/90 transition-transform active:scale-95 px-8"
            >
              Okay, I'll check
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
