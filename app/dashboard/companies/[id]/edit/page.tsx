'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChevronRight, Save, Upload, X, Image as ImageIcon, Loader2, AlertTriangle } from 'lucide-react'
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
import { toast } from 'sonner'
import { companyService } from '@/lib/services/company'
import { SuccessModal } from '@/components/ui/success-modal'
import { MarineCompany } from '@/lib/types'

export default function EditCompanyPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [logo, setLogo] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [error, setError] = useState('')

  const countryNames: Record<string, string> = {
    ng: 'Nigeria',
    gh: 'Ghana',
    za: 'South Africa',
    uk: 'United Kingdom',
    us: 'United States',
  }

  // Reverse mapping for select component
  const getCountryCode = (name: string) => {
    return Object.keys(countryNames).find(key => countryNames[key] === name) || 'ng'
  }

  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    phone: '',
    country: 'ng',
    location: '',
    postalCode: '',
    description: '',
    verificationStatus: 'pending' as 'verified' | 'pending' | 'unverified',
  })

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setIsLoading(true)
        const data = await companyService.getById(companyId)
        
        // Handle potential 'data' wrapper
        const rawCompany = (data as any).data || data
        
        setFormData({
          name: rawCompany.name || '',
          contactEmail: rawCompany.contactEmail || rawCompany.email || '',
          phone: rawCompany.phone || '',
          country: getCountryCode(rawCompany.country),
          location: rawCompany.location || '',
          postalCode: rawCompany.postalCode || '',
          description: rawCompany.description || '',
          verificationStatus: rawCompany.verificationStatus || 'pending',
        })
        setLogo(rawCompany.logo || null)
        setBanner(rawCompany.banner || null)
      } catch (err: any) {
        setError(err.message || 'Failed to load company details')
        toast.error('Failed to load company details')
      } finally {
        setIsLoading(false)
      }
    }

    if (companyId) {
      fetchCompany()
    }
  }, [companyId])

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

    // Handle different possible response structures
    const url = (response as any).url || (response as any).secure_url || (response as any).data?.url
    if (!url) {
      const errorMsg = (response as any).message || (response as any).error || 'No URL returned from server'
      throw new Error(`Platform Error: ${errorMsg}`)
    }
    return url
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Set local preview immediately
      const localUrl = URL.createObjectURL(file)
      setLogoPreview(localUrl)
      
      const toastId = toast.loading('Uploading logo...')
      setIsUploading(true)
      try {
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('File too large (max 5MB)')
        }

        const url = await uploadToBackend(file, 'company')
        setLogo(url) // Final URL for database
        toast.success('Logo uploaded', { id: toastId })
      } catch (err: any) {
        console.error('Logo upload detailed error:', err)
        setMediaError(err.message || 'An unexpected error occurred during logo upload.')
        toast.error('Logo upload failed')
        setLogo(null)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Set local preview immediately
      const localUrl = URL.createObjectURL(file)
      setBannerPreview(localUrl)

      const toastId = toast.loading('Uploading banner...')
      setIsUploading(true)
      try {
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('File too large (max 5MB)')
        }

        const url = await uploadToBackend(file, 'company')
        setBanner(url) // Final URL for database
        toast.success('Banner uploaded', { id: toastId })
      } catch (err: any) {
        console.error('Banner upload detailed error:', err)
        setMediaError(err.message || 'An unexpected error occurred during banner upload.')
        toast.error('Banner upload failed')
        setBanner(null)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await companyService.update(companyId, {
        ...formData,
        email: formData.contactEmail,
        country: countryNames[formData.country] || formData.country,
        logo: logo || undefined,
        banner: banner || undefined,
      })
      
      setShowSuccess(true)
      toast.success('Company updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update company')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Loading company details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Failed to load company</h2>
          <p className="text-slate-500 mt-2">{error}</p>
        </div>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
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
          onClick={() => router.push('/dashboard/companies')}
        >
          Marine Companies
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span
            className="hover:text-foreground cursor-pointer transition-colors font-medium"
            onClick={() => router.push(`/dashboard/companies/${companyId}`)}
        >
            Company Details
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-bold">Edit Company</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8 space-y-10">
          {/* Media & Branding */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
               <div className="w-1.5 h-5 bg-primary rounded-full" />
               Media & Branding
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Logo Upload */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company Logo</p>
                <div className="relative aspect-square w-32 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center overflow-hidden group hover:border-primary/50 transition-colors">
                  {logoPreview || logo ? (
                    <>
                      <img src={logoPreview || logo || undefined} alt="Logo preview" className="w-full h-full object-contain p-3" />
                      <button
                        type="button"
                        onClick={() => { setLogo(null); setLogoPreview(null); }}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-white/90 text-slate-600 hover:text-destructive shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-slate-100/50 transition-colors">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 text-center px-3">Upload Logo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* Banner Upload */}
              <div className="md:col-span-2 space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company Banner</p>
                <div className="relative aspect-[21/9] w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center overflow-hidden group hover:border-primary/50 transition-colors">
                  {bannerPreview || banner ? (
                    <>
                      <img src={bannerPreview || banner || undefined} alt="Banner preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setBanner(null); setBannerPreview(null); }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-slate-600 hover:text-destructive shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-slate-100/50 transition-colors">
                      <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-100 transition-transform group-hover:scale-110">
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-3">Upload Banner</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Company Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
               <div className="w-1.5 h-5 bg-primary rounded-full" />
               Basic Information
            </h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                <Input
                  placeholder="e.g. MuskMover Logistics"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Email</label>
                  <Input
                    type="email"
                    placeholder="contact@company.com"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="+234..."
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Country</label>
                  <Select 
                    value={formData.country} 
                    onValueChange={(val) => setFormData({...formData, country: val})}
                  >
                    <SelectTrigger className="w-full h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus:ring-1 focus:ring-slate-900">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ng">Nigeria</SelectItem>
                      <SelectItem value="gh">Ghana</SelectItem>
                      <SelectItem value="za">South Africa</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location / City</label>
                  <Input
                    placeholder="City Name"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Postal Code</label>
                  <Input
                    placeholder="e.g. 101233"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Verification Status</label>
                  <Select 
                    value={formData.verificationStatus} 
                    onValueChange={(val: any) => setFormData({...formData, verificationStatus: val})}
                  >
                    <SelectTrigger className={`w-full h-12 rounded-xl border-slate-200 font-bold text-xs ring-offset-background focus:ring-1 focus:ring-slate-900 ${
                      formData.verificationStatus === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      formData.verificationStatus === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-slate-50 text-slate-700 border-slate-100'
                    }`}>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                      <SelectItem value="verified" className="text-emerald-600 font-bold focus:bg-emerald-50 focus:text-emerald-700">Verified</SelectItem>
                      <SelectItem value="pending" className="text-amber-600 font-bold focus:bg-amber-50 focus:text-amber-700">Pending Review</SelectItem>
                      <SelectItem value="unverified" className="text-slate-600 font-bold focus:bg-slate-50 focus:text-slate-700">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company Description</label>
                <Textarea
                  placeholder="Overview of marine services, fleet capacity, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus-visible:ring-1 focus-visible:ring-slate-900 min-h-[120px] p-4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={
              isSubmitting || 
              isUploading || 
              (!!logoPreview && !logo) || 
              (!!bannerPreview && !banner)
            }
            className="h-14 px-10 rounded-2xl bg-[#050B20] hover:bg-[#050B20]/90 text-white font-bold text-base transition-all shadow-xl shadow-slate-200 hover:shadow-primary/20 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </span>
            ) : isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading Media...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Save className="w-5 h-5" />
                Update Company
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
            Cancel
          </Button>
        </div>
      </form>

      <SuccessModal 
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false)
          router.push(`/dashboard/companies/${companyId}`)
        }}
        title="Details Updated!"
        message={`${formData.name}'s information has been successfully updated.`}
        actionLabel="View Details"
        onAction={() => router.push(`/dashboard/companies/${companyId}`)}
        secondaryActionLabel="Return to List"
        onSecondaryAction={() => {
          setShowSuccess(false)
          router.push('/dashboard/companies')
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
                Upload Error
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-600 text-base leading-relaxed">
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
