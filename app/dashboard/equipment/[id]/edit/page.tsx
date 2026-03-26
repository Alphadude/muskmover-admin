'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronRight, Save, Upload, X, Package, CheckCircle2 } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { equipmentService } from '@/lib/services/equipment'
import { companyService } from '@/lib/services/company'
import { Equipment, MarineCompany } from '@/lib/types'

const inputCls =
  'w-full h-12 rounded-xl border-slate-200 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900 font-bold transition-all shadow-sm'
const selectCls =
  'w-full h-12 rounded-xl border-slate-200 bg-white text-sm focus:ring-1 focus:ring-slate-900 font-bold shadow-sm'

export default function EditEquipmentPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [companies, setCompanies] = useState<MarineCompany[]>([])
  const [error, setError] = useState('')
  
  // Controlled form state
  const [formData, setFormData] = useState<Partial<Equipment>>({
    name: '',
    category: '',
    details: '',
    companyId: '',
    availability: 'available',
    condition: 'excellent',
    weight: 0,
    yearManufactured: new Date().getFullYear(),
    hourlyRate: 0,
    dailyRate: 0,
    monthlyRate: 0,
    images: []
  })

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [equipmentResponse, companiesResponse] = await Promise.all([
        equipmentService.getById(id),
        companyService.getAll()
      ])
      
      // Handle wrappers
      const asset = (equipmentResponse as any).data || equipmentResponse;
      const companiesArray = (companiesResponse as any).data || (companiesResponse as any).companies || (Array.isArray(companiesResponse) ? companiesResponse : []);
      
      setCompanies(companiesArray)
      
      // Map API fields to form fields
      const imagesArr = typeof asset.images === 'string' 
        ? (asset.images as string).split(',').filter(Boolean) 
        : (Array.isArray(asset.images) ? asset.images : []);

      setFormData({
        ...asset,
        id: String(asset.id),
        details: asset.details || asset.description || '', // Map description to details if needed
        images: imagesArr,
        weight: Number(asset.weight) || 0,
        yearManufactured: Number(asset.yearManufactured) || new Date().getFullYear(),
        hourlyRate: Number(asset.hourlyRate) || 0,
        dailyRate: Number(asset.dailyRate) || 0,
        monthlyRate: Number(asset.monthlyRate) || 0,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load asset data')
      toast.error('Could not load asset details')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) fetchData()
  }, [fetchData])

  const handleInputChange = (field: keyof Equipment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const toastId = toast.loading('Uploading visuals to Cloudinary...')

    try {
      const uploadedUrls = []
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large (max 5MB)`)
          continue
        }

        const base64 = await fileToBase64(file)
        const base64Data = base64.split(',')[1]
        
        const response = await companyService.uploadImage({
          data: base64Data,
          type: formData.category === 'vessels' ? 'vessel' : 'equipment'
        })

        const url = (response as any).url || (response as any).secure_url || (response as any).data?.url
        if (url) uploadedUrls.push(url)
      }

      if (uploadedUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), ...uploadedUrls]
        }))
        toast.success(`Successfully uploaded ${uploadedUrls.length} file(s)`, { id: toastId })
      } else {
        toast.error('No files were successfully uploaded.', { id: toastId })
      }
    } catch (err: any) {
      toast.error(err.message || 'Media upload failed. Please try again.', { id: toastId })
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Serialize images array back to string for backend
      const payload = {
        ...formData,
        id: Number(id), // Backend expects number ID in payload usually
        companyId: Number(formData.companyId),
        weight: Number(formData.weight),
        yearManufactured: Number(formData.yearManufactured),
        hourlyRate: Number(formData.hourlyRate),
        dailyRate: Number(formData.dailyRate),
        monthlyRate: Number(formData.monthlyRate),
        images: (formData.images || []).join(',')
      }

      // Remove unwanted internal fields
      delete (payload as any)._type;
      delete (payload as any).createdAt;
      delete (payload as any).updatedAt;

      await equipmentService.update(id, payload)
      
      toast.success('Asset updated successfully', {
        description: `${formData.name} has been synchronized with the marketplace.`
      })
      router.push(`/dashboard/equipment/${id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update asset')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Asset Data</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
        <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <h3 className="text-lg font-black text-slate-900">Oops! Something went wrong</h3>
        <p className="text-slate-500 font-medium mt-2 max-w-xs mx-auto">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-6 rounded-xl font-bold border-slate-200">Try Again</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Premium Header/Breadcrumb */}
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span className="hover:text-[#EA580C] cursor-pointer transition-colors" onClick={() => router.push('/dashboard/equipment')}>Inventory</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-900">Edit {formData.name}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Edit Specification</h1>
        </div>
        <div className="flex items-center gap-2">
           <Badge className="bg-white text-slate-900 border border-slate-100 font-black text-[10px] px-3 py-1.5 rounded-lg shadow-sm flex gap-1.5 items-center">
              <CheckCircle2 className="w-3 h-3 text-green-500 fill-green-500/20" />
              DRAFT SAVED
           </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Core Data */}
        <div className="lg:col-span-12 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* 1. Basic Information */}
            <div className="space-y-6">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] border-l-4 border-[#EA580C] pl-4">Basic Information</h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Asset Name</label>
                  <Input 
                    value={formData.name} 
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Caterpillar 320 GC" 
                    required 
                    className={inputCls} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</label>
                    <Select value={formData.category} onValueChange={v => handleInputChange('category', v)}>
                      <SelectTrigger className={selectCls}>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vessels">Vessels</SelectItem>
                        <SelectItem value="cargo-equipment">Cargo Equipment</SelectItem>
                        <SelectItem value="navigation">Navigation</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="propulsion">Propulsion</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Asset Status</label>
                    <Select value={formData.status || formData.availability} onValueChange={v => handleInputChange('status', v)}>
                      <SelectTrigger className={selectCls}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Technical Description</label>
                  <Textarea
                    value={formData.details}
                    onChange={e => handleInputChange('details', e.target.value)}
                    placeholder="Provide depth technical details..."
                    className="rounded-xl border-slate-200 bg-white text-sm font-bold placeholder:text-slate-300 focus-visible:ring-1 focus-visible:ring-slate-900 min-h-[120px] shadow-sm p-4 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 2. Technical Specs & Pricing */}
            <div className="space-y-6">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] border-l-4 border-slate-900 pl-4">Asset Performance</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Gross Weight (kg)</label>
                    <Input 
                      value={formData.weight || ''} 
                      onChange={e => handleInputChange('weight', e.target.value)}
                      type="number" 
                      placeholder="0" 
                      className={inputCls} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Year Manufactured</label>
                    <Input 
                      value={formData.yearManufactured || ''} 
                      onChange={e => handleInputChange('yearManufactured', e.target.value)}
                      type="number" 
                      placeholder="2024" 
                      className={inputCls} 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-[#EA580C] ml-1">Company Assignment</label>
                  <Select value={String(formData.companyId)} onValueChange={v => handleInputChange('companyId', v)}>
                    <SelectTrigger className={`${selectCls} border-[#EA580C]/20 bg-orange-50/10`}>
                      <SelectValue placeholder="Select Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                   <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1 text-center block">Hourly (₦)</label>
                      <Input value={formData.hourlyRate || ''} onChange={e => handleInputChange('hourlyRate', e.target.value)} type="number" className={`${inputCls} h-10 border-slate-100 text-center`} />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-[#EA580C] ml-1 text-center block font-black">Daily (₦)</label>
                      <Input value={formData.dailyRate || ''} onChange={e => handleInputChange('dailyRate', e.target.value)} type="number" className={`${inputCls} h-10 border-[#EA580C]/30 text-center bg-orange-50/10`} />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1 text-center block">Monthly (₦)</label>
                      <Input value={formData.monthlyRate || ''} onChange={e => handleInputChange('monthlyRate', e.target.value)} type="number" className={`${inputCls} h-10 border-slate-100 text-center`} />
                   </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Media & Images Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] border-l-4 border-[#050B20] pl-4">Media Assets</h2>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                {formData.images?.length || 0} / 10 VISUALS
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
              {(formData.images || []).map((src, index) => (
                <div key={index} className="relative group aspect-square rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm transition-transform hover:scale-105">
                  <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2.5 rounded-xl bg-white text-destructive shadow-xl hover:scale-110 transition-transform active:scale-90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {(formData.images?.length || 0) < 10 && (
                <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#EA580C] hover:shadow-lg hover:shadow-orange-500/5 transition-all cursor-pointer group relative overflow-hidden">
                  <div className="p-4 rounded-2xl bg-white shadow-md border border-slate-100 group-hover:bg-[#EA580C] group-hover:text-white transition-all">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">Append Visual</span>
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
          <div className="flex items-center gap-6 pt-12">
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="h-16 px-12 rounded-2xl bg-[#050B20] hover:bg-black text-white font-black text-sm shadow-2xl shadow-slate-300 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  SYNCHRONIZING...
                </span>
              ) : isUploading ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  UPLOADING...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <Save className="w-5 h-5 text-[#EA580C]" />
                  COMMIT CHANGES
                </span>
              )}
            </Button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.2em] px-4"
            >
              Discard & Abandon
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
