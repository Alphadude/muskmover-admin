'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Save, Upload, X, Image as ImageIcon, Loader2, Package, Anchor } from 'lucide-react'
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
import { equipmentService } from '@/lib/services/equipment'
import { companyService } from '@/lib/services/company'
import { MarineCompany } from '@/lib/types'
import { SuccessModal } from '@/components/ui/success-modal'

type Tab = 'equipment' | 'vessel'

export default function AddEquipmentPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('equipment')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [companies, setCompanies] = useState<MarineCompany[]>([])

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await companyService.getAll()
        const companiesArray = Array.isArray(data) ? data : (data as any)?.companies || (data as any)?.data || []
        setCompanies(companiesArray)
      } catch (err) {
        toast.error('Failed to load companies')
      }
    }
    fetchCompanies()
  }, [])

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
    
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      const data = Object.fromEntries(formData.entries())
      
      await equipmentService.create({
        name: data.name as string,
        category: (activeTab === 'vessel' ? 'vessels' : data.category) as EquipmentCategory,
        companyId: data.companyId as string,
        description: data.description as string,
        availability: data.availability as string || 'available',
        condition: data.condition as string || 'excellent',
        images: images,
        hourlyRate: Number(data.hourlyRate) || 0,
        dailyRate: Number(data.dailyRate) || 0,
        monthlyRate: Number(data.monthlyRate) || 0,
        specifications: activeTab === 'vessel' ? { vesselType: data.category as string } : {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any)

      setShowSuccess(true)
      toast.success(`${activeTab === 'vessel' ? 'Vessel' : 'Equipment'} added successfully!`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create asset')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* Breadcrumb */}
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
          onClick={() => router.push('/dashboard/equipment')}
        >
          Equipment
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-bold">Add Asset</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Asset</h1>
          <p className="text-sm text-slate-500">List a new vessel or equipment in the marketplace</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex rounded-xl border border-slate-200 bg-slate-100/50 p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('equipment')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'equipment'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Equipment
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vessel')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'vessel'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Anchor className="w-3.5 h-3.5" />
            Vessel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8 space-y-10">
          {/* ── Assign & Basic Settings ── */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
               <div className="w-1.5 h-5 bg-primary rounded-full" />
               Assignment & Status
            </h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assign to Company</label>
                <Select name="companyId" required>
                  <SelectTrigger className="w-full h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus:ring-1 focus:ring-slate-900 text-slate-700">
                    <SelectValue placeholder="Select a marine company" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {(companies || []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Availability Status</label>
                  <Select name="availability" defaultValue="available">
                    <SelectTrigger className="w-full h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus:ring-1 focus:ring-slate-900 text-slate-700">
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Condition</label>
                  <Select name="condition" defaultValue="excellent">
                    <SelectTrigger className="w-full h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus:ring-1 focus:ring-slate-900 text-slate-700">
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* ── Asset Details ── */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
               <div className="w-1.5 h-5 bg-primary rounded-full" />
               Asset Details
            </h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  {activeTab === 'vessel' ? 'Vessel Name' : 'Equipment Name'}
                </label>
                <Input 
                  name="name"
                  placeholder={activeTab === 'vessel' ? "e.g. MV Silver Sea" : "e.g. Caterpillar 3516B"} 
                  required 
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" 
                />
              </div>

              {activeTab === 'equipment' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <Select name="category" required>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus:ring-1 focus:ring-slate-900">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="vessels">Vessels</SelectItem>
                        <SelectItem value="cargo-equipment">Cargo Equipment</SelectItem>
                        <SelectItem value="diving-gear">Diving Gear</SelectItem>
                        <SelectItem value="navigation">Navigation</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="propulsion">Propulsion</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Year Manufactured</label>
                    <Input 
                      name="yearManufactured"
                      type="number" 
                      min="1950" 
                      max={new Date().getFullYear()} 
                      placeholder="e.g. 2020" 
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" 
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Vessel Type</label>
                    <Input name="vesselType" placeholder="e.g. Utility OVS" className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Year Built/Rebuilt</label>
                    <Input name="yearBuilt" placeholder="e.g. 1980 / 2015" className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description & Specs</label>
                <Textarea
                  name="description"
                  placeholder="Technical details, features, specifications, and use cases..."
                  className="rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900 min-h-[120px] p-4"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* ── Pricing ── */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
               <div className="w-1.5 h-5 bg-primary rounded-full" />
               Pricing
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Hourly Rate (₦)</label>
                <Input name="hourlyRate" type="number" min="0" placeholder="0.00" className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Daily Rate (₦)</label>
                <Input name="dailyRate" type="number" min="0" placeholder="0.00" required className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Monthly Rate (₦)</label>
                <Input name="monthlyRate" type="number" min="0" placeholder="0.00" className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* ── Media ── */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <div className="w-1.5 h-5 bg-primary rounded-full" />
                 Media & Images
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                {images.length} / 10 Images
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((src, index) => (
                <div key={index} className="relative group aspect-square rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm transition-transform hover:scale-[1.02]">
                  <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-slate-600 hover:text-destructive shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {images.length < 10 && (
                <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-primary/50 transition-all cursor-pointer group">
                  <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-3">Upload Images</span>
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
            
            {images.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-300 mb-4">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-slate-400">No images uploaded yet</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-tight font-medium">Add at least one photo of the {activeTab}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-14 px-10 rounded-2xl bg-[#050B20] hover:bg-[#050B20]/90 text-white font-bold text-base transition-all shadow-xl shadow-slate-200 hover:shadow-primary/20 hover:scale-[1.02]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Save className="w-5 h-5" />
                {activeTab === 'vessel' ? 'Save Vessel' : 'Save Equipment'}
              </span>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="h-14 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl px-6"
          >
            Return to List
          </Button>
        </div>

      </form>

      <SuccessModal 
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          router.push('/dashboard/equipment')
        }}
        title={`${activeTab === 'vessel' ? 'Vessel' : 'Equipment'} Added!`}
        message={`Your new ${activeTab} has been successfully registered in the marketplace inventory.`}
        actionLabel="View All Assets"
        onAction={() => router.push('/dashboard/equipment')}
        secondaryActionLabel={`Add Another ${activeTab === 'vessel' ? 'Vessel' : 'Asset'}`}
        onSecondaryAction={() => {
          setShowSuccess(false)
          // Reset form or stay on page
          window.location.reload()
        }}
      />
    </div>
  )
}
