'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Save, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
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
import { companyService } from '@/lib/services/company'
import { SuccessModal } from '@/components/ui/success-modal'

export default function AddCompanyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [logo, setLogo] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    phone: '',
    country: 'ng',
    location: '',
    postalCode: '',
    description: '',
  })

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64 = await fileToBase64(file)
        setLogo(base64)
      } catch (err) {
        toast.error('Failed to process logo')
      }
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64 = await fileToBase64(file)
        setBanner(base64)
      } catch (err) {
        toast.error('Failed to process banner')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await companyService.create({
        ...formData,
        logo: logo || undefined,
        banner: banner || undefined,
        verificationStatus: 'pending',
        rating: 0,
        totalEquipment: 0,
        totalOrders: 0,
        totalRevenue: 0,
        joinedDate: new Date(),
      })
      
      setShowSuccess(true)
      toast.success('Company created successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create company')
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
          onClick={() => router.push('/dashboard/companies')}
        >
          Marine Companies
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-bold">Add Company</span>
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
                  {logo ? (
                    <>
                      <img src={logo} alt="Logo preview" className="w-full h-full object-contain p-3" />
                      <button
                        type="button"
                        onClick={() => setLogo(null)}
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
                  {banner ? (
                    <>
                      <img src={banner} alt="Banner preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setBanner(null)}
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
                    defaultValue="ng" 
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
                Save Company
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
          router.push('/dashboard/companies')
        }}
        title="Company Registered!"
        message={`${formData.name} has been successfully added to the MuskMover directory.`}
        actionLabel="View All Companies"
        onAction={() => router.push('/dashboard/companies')}
        secondaryActionLabel="Add Another Company"
        onSecondaryAction={() => {
          setShowSuccess(false)
          setFormData({
            name: '',
            contactEmail: '',
            phone: '',
            country: 'ng',
            location: '',
            postalCode: '',
            description: '',
          })
          setLogo(null)
          setBanner(null)
        }}
      />
    </div>
  )
}

