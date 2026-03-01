'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronRight, Save, Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { mockEquipment } from '@/lib/mock-data'
import { Equipment } from '@/lib/types'

type Tab = 'equipment' | 'vessel'

const inputCls =
  'w-full h-12 rounded-lg border-slate-300 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900 font-medium'
const selectCls =
  'w-full h-12 rounded-lg border-slate-300 bg-white text-sm focus:ring-1 focus:ring-slate-900 font-medium'

export default function EditEquipmentPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [activeTab, setActiveTab] = useState<Tab>('equipment')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [equipment, setEquipment] = useState<Equipment | null>(null)

  useEffect(() => {
    const item = mockEquipment.find((e) => e.id === id)
    if (item) {
      setEquipment(item)
      setImages(item.images)
      setActiveTab(item.category === 'vessels' ? 'vessel' : 'equipment')
    }
  }, [id])

  if (!equipment) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 font-medium">Loading asset details...</p>
      </div>
    )
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
    setImages((prev) => [...prev, ...newImages])
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast(`${activeTab === 'vessel' ? 'Vessel' : 'Equipment'} updated successfully!`, {
        description: 'The changes have been saved to the marketplace.',
      })
      router.push(`/dashboard/equipment/${id}`)
    }, 1500)
  }

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-8 font-medium">
        <span
          className="hover:text-slate-900 cursor-pointer transition-colors"
          onClick={() => router.push('/dashboard')}
        >
          Dashboard
        </span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span
          className="hover:text-slate-900 cursor-pointer transition-colors"
          onClick={() => router.push('/dashboard/equipment')}
        >
          Equipment
        </span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span
          className="hover:text-slate-900 cursor-pointer transition-colors"
          onClick={() => router.push(`/dashboard/equipment/${id}`)}
        >
          {equipment.name}
        </span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-black">Edit Asset</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Tab Indicator (Locked for Edit) */}
        <div className="flex flex-col gap-2">
           <h2 className="text-xl font-black text-slate-900">Editing {activeTab === 'vessel' ? 'Vessel' : 'Equipment'}</h2>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Asset Type: {activeTab}</p>
        </div>

        {/* ── Assign to Company (shared) ── */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Assign to Company</h2>
          <div className="space-y-3">
            <Select required defaultValue={equipment.companyId}>
              <SelectTrigger className={selectCls}>
                <SelectValue placeholder="Select Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comp-001">Atlantic Marine Solutions</SelectItem>
                <SelectItem value="comp-002">Gulf Cargo Transport</SelectItem>
                <SelectItem value="comp-003">Deep Sea Exploration</SelectItem>
                <SelectItem value="comp-004">Coastal Navigation Ltd</SelectItem>
                <SelectItem value="comp-005">Maritime Safety Systems</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Select defaultValue={equipment.availability}>
                <SelectTrigger className={selectCls}>
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue={equipment.condition}>
                <SelectTrigger className={selectCls}>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ── EQUIPMENT TAB ── */}
        {activeTab === 'equipment' && (
          <>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Equipment Details</h2>
              <div className="space-y-3">
                <Input defaultValue={equipment.name} placeholder="Equipment Name" required className={inputCls} />
                <Select required defaultValue={equipment.category}>
                  <SelectTrigger className={selectCls}>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vessels">Vessels</SelectItem>
                    <SelectItem value="cargo-equipment">Cargo Equipment</SelectItem>
                    <SelectItem value="diving-gear">Diving Gear</SelectItem>
                    <SelectItem value="navigation">Navigation</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="propulsion">Propulsion</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  defaultValue={equipment.description}
                  placeholder="Technical details, features, use case..."
                  className="rounded-lg border-slate-300 bg-white text-sm font-medium placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900 min-h-[100px]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Dimensions & Specs</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input defaultValue={equipment.weight} type="number" placeholder="Weight (tons)" className={inputCls} />
                  <Input defaultValue={equipment.yearManufactured} type="number" min="1950" max={new Date().getFullYear()} placeholder="Year Manufactured" className={inputCls} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Pricing</h2>
              <div className="space-y-3">
                <Input defaultValue={equipment.hourlyRate} type="number" min="0" placeholder="Hourly Rate (₦)" className={inputCls} />
                <div className="grid grid-cols-2 gap-3">
                  <Input defaultValue={equipment.dailyRate} type="number" min="0" placeholder="Daily Rate (₦)" required className={inputCls} />
                  <Input defaultValue={equipment.monthlyRate} type="number" min="0" placeholder="Monthly Rate (₦)" className={inputCls} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── VESSEL TAB ── */}
        {activeTab === 'vessel' && (
          <>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Core Identity & Performance</h2>
              <div className="space-y-3">
                <Input defaultValue={equipment.name} placeholder="Vessel Name" required className={inputCls} />
                <Input defaultValue={equipment.specifications.vessel_type} placeholder="Vessel Type (e.g. 1,200 BHP Security/Utility OVS/PVS)" className={inputCls} />
                <div className="grid grid-cols-2 gap-3">
                  <Input defaultValue={equipment.specifications.builder} placeholder="Builder" className={inputCls} />
                  <Input defaultValue={equipment.specifications.year_built} placeholder="Year Built / Rebuilt (e.g. 1980 / 2015)" className={inputCls} />
                </div>
                {/* ... other fields similarly pre-filled ... */}
                <div className="grid grid-cols-2 gap-3">
                   <Input defaultValue={equipment.dailyRate} type="number" min="0" placeholder="Daily Rate (₦)" className={inputCls} />
                   <Input defaultValue={equipment.monthlyRate} type="number" min="0" placeholder="Monthly Rate (₦)" className={inputCls} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── MEDIA & IMAGES (shared) ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Media & Images</h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {images.length} / 10 Images
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((src, index) => (
              <div key={index} className="relative group aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm">
                <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-slate-600 hover:text-destructive shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {images.length < 10 && (
              <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer group">
                <div className="p-3 rounded-full bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">Upload</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-10 rounded-xl bg-[#050B20] hover:bg-[#050B20]/90 text-white font-bold text-sm shadow-lg shadow-slate-200 transition-all active:scale-95"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving Changes...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Update Asset
              </span>
            )}
          </Button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors px-4"
          >
            Cancel & Return
          </button>
        </div>
      </form>
    </div>
  )
}
