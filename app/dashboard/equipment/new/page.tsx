'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Save, Upload, X, Image as ImageIcon, Loader2, Package, Anchor, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

interface MediaItem {
  id: string;
  url: string;
  isUploading: boolean;
  localPreview: string;
}

export default function AddEquipmentPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('equipment')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [images, setImages] = useState<MediaItem[]>([])
  const [mediaError, setMediaError] = useState<string | null>(null)
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const uploadToBackend = async (file: File, type: 'company' | 'vessel' | 'equipment'): Promise<string> => {
    const base64 = await fileToBase64(file)
    const base64Data = base64.split(',')[1]

    const response = await companyService.uploadImage({
      data: base64Data,
      type
    })

    const url = (response as any).url || (response as any).secure_url || (response as any).data?.url
    if (!url) {
      const errorMsg = (response as any).message || (response as any).error || 'No URL returned'
      throw new Error(errorMsg)
    }
    return url
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    if (images.length + newFiles.length > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }

    const newItems: MediaItem[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7) + Date.now(),
      url: '',
      isUploading: true,
      localPreview: URL.createObjectURL(file)
    }))
    
    setImages(prev => [...prev, ...newItems])

    // Parallel uploads
    newItems.forEach(async (item, index) => {
      const file = newFiles[index]
      try {
        const url = await uploadToBackend(file, activeTab === 'vessel' ? 'vessel' : 'equipment')
        setImages(prev => prev.map(img => 
          img.id === item.id ? { ...img, url, isUploading: false } : img
        ))
      } catch (err: any) {
        toast.error(`Upload error: ${err.message}`)
        setImages(prev => prev.filter(img => img.id !== item.id))
      }
    })
    
    e.target.value = ''
  }

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter(img => img.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.some(img => img.isUploading)) {
      toast.error('Wait for all images to upload.')
      return
    }

    setIsSubmitting(true)
    
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      const data = Object.fromEntries(formData.entries())
      
      await equipmentService.create({
        id: 0,
        name: data.name as string,
        category: (activeTab === 'vessel' ? 'vessels' : data.category) as string,
        companyId: Number(data.companyId) || 0,
        details: data.details as string,
        status: (data.status as string) || 'Available',
        condition: data.condition as string || 'Excellent',
        images: images.map(img => img.url).filter(url => url && !url.startsWith('blob:')).join(','), 
        weight: Number(data.weight) || 0,
        yearManufactured: Number(data.yearManufactured) || Number(data.yearBuilt) || 0,
        hourlyRate: Number(data.hourlyRate) || 0,
        dailyRate: Number(data.dailyRate) || 0,
        monthlyRate: Number(data.monthlyRate) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any)

      setShowSuccess(true)
      toast.success(`${activeTab === 'vessel' ? 'Vessel' : 'Equipment'} added successfully!`)
    } catch (err: any) {
      console.error('Submission error:', err)
      setMediaError(err.message || 'An unexpected error occurred while creating the asset.')
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
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Availability Status</label>
                  <Select name="status" defaultValue="Available">
                    <SelectTrigger className="w-full h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus:ring-1 focus:ring-slate-900 text-slate-700">
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Rented">Rented</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Condition</label>
                  <Select name="condition" defaultValue="Excellent">
                    <SelectTrigger className="w-full h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus:ring-1 focus:ring-slate-900 text-slate-700">
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                    <Input name="weight" type="number" placeholder="0" className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" />
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Vessel Type</label>
                    <Input name="vesselType" placeholder="Utility OVS" className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Weight (Tons)</label>
                    <Input name="weight" type="number" placeholder="0" className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Year Built/Rebuilt</label>
                    <Input name="yearBuilt" placeholder="1980 / 2015" className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Technical Details & Specs</label>
                <Textarea
                  name="details"
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
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm transition-transform hover:scale-[1.02]">
                  <img 
                    src={img.localPreview || img.url} 
                    alt="Preview" 
                    className={`w-full h-full object-cover transition-opacity duration-300 ${img.isUploading ? 'opacity-40 grayscale' : 'opacity-100'}`} 
                  />
                  {img.isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        <span className="text-[8px] font-bold text-primary uppercase tracking-widest">Uploading</span>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-slate-600 hover:text-destructive shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || images.some(img => img.isUploading)}
            className="h-14 px-10 rounded-2xl bg-[#050B20] hover:bg-[#050B20]/90 text-white font-bold text-base transition-all shadow-xl shadow-slate-200 hover:shadow-primary/20 hover:scale-[1.02] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </span>
            ) : images.some(img => img.isUploading) ? (
              <span className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
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
          window.location.reload()
        }}
      />

      <AlertDialog open={!!mediaError} onOpenChange={(open) => !open && setMediaError(null)}>
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
              {mediaError}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogAction 
              className="rounded-xl font-bold h-11 border-0 shadow-lg bg-[#050B20] hover:bg-[#050B20]/90 transition-transform active:scale-95 px-8"
            >
              Okay, I'll fix it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
