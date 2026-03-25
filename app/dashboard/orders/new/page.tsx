'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Save, Calendar, User, Package, CreditCard, Ship, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { orderService } from '@/lib/services/order'
import { equipmentService } from '@/lib/services/equipment'
import { Equipment, Order } from '@/lib/types'

const inputCls =
  'w-full h-12 rounded-xl border-slate-200 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900 font-bold transition-all shadow-sm'
const selectCls =
  'w-full h-12 rounded-xl border-slate-200 bg-white text-sm focus:ring-1 focus:ring-slate-900 font-bold shadow-sm'

export default function NewOrderPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingItems, setIsLoadingItems] = useState(true)
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([])
  const [vesselsList, setVesselsList] = useState<any[]>([])
  
  const [formData, setFormData] = useState<Partial<Order>>({
    orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    renterName: '',
    renterEmail: '',
    equipmentId: 0,
    vesselId: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    totalPrice: 0,
    status: 'pending',
    paymentStatus: 'pending'
  })

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoadingItems(true)
        const [eqRes, vRes] = await Promise.all([
          equipmentService.getAll(),
          equipmentService.getAllVessels()
        ])
        
        const eqData = (eqRes as any).data?.equipment || (eqRes as any).equipment || (Array.isArray(eqRes) ? eqRes : [])
        const vData = (vRes as any).data?.vessels || (vRes as any).vessels || (Array.isArray(vRes) ? vRes : [])
        
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
    
    try {
      await orderService.create(formData)
      toast.success('Lease agreement created', {
        description: `Order ${formData.orderNumber} has been recorded.`
      })
      router.push('/dashboard/orders')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Premium Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span className="hover:text-[#EA580C] cursor-pointer transition-colors" onClick={() => router.push('/dashboard/orders')}>Bookings</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-900">New Lease Order</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Initiate Agreement</h1>
        </div>
        <Badge className="bg-orange-50 text-[#EA580C] border-orange-100 font-black text-[10px] px-3 py-1.5 rounded-lg">
           DRAFT #{formData.orderNumber?.split('-')[1]}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Customer & Asset */}
        <div className="space-y-10">
          <section className="space-y-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] border-l-4 border-[#EA580C] pl-4">Renter Identity</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name / Entity</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    value={formData.renterName} 
                    onChange={e => handleInputChange('renterName', e.target.value)}
                    placeholder="e.g. Chevron Nigeria Ltd" 
                    required 
                    className={`${inputCls} pl-12`} 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Contact Email</label>
                <Input 
                  value={formData.renterEmail} 
                  onChange={e => handleInputChange('renterEmail', e.target.value)}
                  type="email"
                  placeholder="procurement@entity.com" 
                  required 
                  className={inputCls} 
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] border-l-4 border-slate-900 pl-4">Asset Selection</h2>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Select Machinery or Vessel</label>
              <Select onValueChange={handleAssetSelect} required>
                <SelectTrigger className={selectCls}>
                  <SelectValue placeholder={isLoadingItems ? "Loading Assets..." : "Choose Asset"} />
                </SelectTrigger>
                <SelectContent>
                  {equipmentList.length > 0 && (
                    <div className="px-2 py-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest">Equipments</div>
                  )}
                  {equipmentList.map(item => (
                    <SelectItem key={`e-${item.id}`} value={`equipment:${item.id}`}>
                      {item.name} (₦{Number(item.dailyRate).toLocaleString()}/day)
                    </SelectItem>
                  ))}
                  {vesselsList.length > 0 && (
                    <div className="px-2 py-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2 border-t border-slate-50">Vessels</div>
                  )}
                  {vesselsList.map(v => (
                    <SelectItem key={`v-${v.id}`} value={`vessel:${v.id}`}>
                      {v.name} (₦{Number(v.dailyRate).toLocaleString()}/day)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>
        </div>

        {/* Right: Lease Duration & Financials */}
        <div className="space-y-10">
          <section className="space-y-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] border-l-4 border-[#050B20] pl-4">Lease Duration</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 text-center block">Mobilization</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="date" 
                    value={formData.startDate}
                    onChange={e => handleInputChange('startDate', e.target.value)}
                    required 
                    className={`${inputCls} pl-12`} 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 text-center block">Demobilization</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="date" 
                    value={formData.endDate}
                    onChange={e => handleInputChange('endDate', e.target.value)}
                    required 
                    className={`${inputCls} pl-12`} 
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#050B20] rounded-3xl p-8 text-white space-y-8 shadow-2xl shadow-slate-300">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <CreditCard className="w-5 h-5 text-[#EA580C]" />
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Total Valuations</p>
                <p className="text-3xl font-black tracking-tighter mt-1">₦{formData.totalPrice?.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase tracking-widest text-white/30 ml-1">Order Status</label>
                <Select value={formData.status} onValueChange={v => handleInputChange('status', v)}>
                   <SelectTrigger className="bg-white/5 border-white/10 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                   </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase tracking-widest text-white/30 ml-1">Payment</label>
                <Select value={formData.paymentStatus} onValueChange={v => handleInputChange('paymentStatus', v)}>
                   <SelectTrigger className="bg-white/5 border-white/10 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                   </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-black text-sm transition-all active:scale-[0.98]"
            >
              {isSubmitting ? "PROCESSING AGREEMENT..." : "GENERATE LEASE ORDER"}
            </Button>
          </section>
        </div>
      </form>
    </div>
  )
}
