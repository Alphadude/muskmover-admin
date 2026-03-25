'use client'

import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Package,
  Calendar,
  Clock,
  MapPin,
  Shield,
  Zap,
  Tag,
  ChevronRight,
  Edit,
  ShoppingCart,
  Star,
  CheckCircle2,
  Info,
  Scale,
  Construction,
} from 'lucide-react'
import { equipmentService } from '@/lib/services/equipment'
import { companyService } from '@/lib/services/company'
import { Equipment, MarineCompany } from '@/lib/types'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EquipmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [item, setItem] = useState<Equipment | null>(null)
  const [company, setCompany] = useState<MarineCompany | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await equipmentService.getById(id)
        
        // Handle potential 'data' wrapper from API
        const asset = (response as any).data || response;
        
        // Handle images splitting if it's a string
        const imagesArr = typeof asset.images === 'string' 
          ? (asset.images as string).split(',').filter(Boolean) 
          : (Array.isArray(asset.images) ? asset.images : []);
          
        const formattedAsset = {
          ...asset,
          images: imagesArr
        }
        
        setItem(formattedAsset)
        if (imagesArr.length > 0) setActiveImage(imagesArr[0])
        
        if (asset.companyId) {
          const companyData = await companyService.getById(asset.companyId)
          // Also handle wrapper for company
          const rawCompany = (companyData as any).data || companyData;
          setCompany(rawCompany)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch asset details')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading premium asset details...</p>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="space-y-6">
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto border border-slate-100">
            <Package className="w-10 h-10 text-slate-300" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Asset Not Found</h2>
            <p className="text-slate-500 max-w-md mx-auto mt-2 text-sm leading-relaxed">
              {error || 'This equipment might have been moved or deleted from the marketplace.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => router.back()} className="rounded-xl font-bold h-12 px-8">Go Back</Button>
            <Button onClick={() => window.location.reload()} className="rounded-xl bg-[#050B20] hover:bg-[#050B20]/90 font-bold h-12 px-8">Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Premium Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2 border-b border-slate-100">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Link href="/dashboard/equipment" className="hover:text-[#EA580C] transition-colors">Marketplace</Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <Link href={`/dashboard/equipment?category=${item.category}`} className="hover:text-[#EA580C] transition-colors">{item.category || 'Asset'}</Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-900">{item.name}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Asset Overview
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="lg" asChild className="rounded-2xl border-slate-200 font-black h-14 px-8 text-slate-600 shadow-sm hover:bg-slate-50 transition-all active:scale-95">
            <Link href={`/dashboard/equipment/${item.id}/edit`} className="gap-2">
              <Edit className="w-4 h-4" />
              Edit Specification
            </Link>
          </Button>
          <Button size="lg" className="rounded-2xl bg-[#050B20] hover:bg-[#050B20]/90 font-black h-14 px-8 shadow-xl shadow-slate-200 transition-all active:scale-95">
             Generate Quote
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Media & Details Tabs */}
        <div className="lg:col-span-8 space-y-10">
          {/* Asset Title & Category Badge */}
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200 font-bold px-3 py-1 rounded-lg uppercase tracking-widest text-[10px]">
                  {(item.category || 'Equipment').replace('-', ' ')}
                </Badge>
                <div className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {item.id}</span>
             </div>
             <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
                {item.name}
             </h2>
          </div>

          {/* Featured Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[16/9] w-full rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden relative group shadow-inner">
               {activeImage ? (
                 <img src={activeImage} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                    <Package className="w-16 h-16 stroke-[1.5]" />
                    <p className="font-bold text-sm tracking-widest uppercase">No Visual available</p>
                 </div>
               )}
               <div className="absolute top-6 left-6 flex gap-2">
                 <Badge className="bg-[#EA580C] text-white border-0 font-black text-[10px] px-3 py-1.5 rounded-lg shadow-lg">
                    {(item.status || 'Available').toUpperCase()}
                 </Badge>
                 <Badge className="bg-white text-slate-900 border-0 font-black text-[10px] px-3 py-1.5 rounded-lg shadow-lg flex gap-1.5 items-center">
                    <CheckCircle2 className="w-3 h-3 text-green-500 fill-green-500/20" />
                    CERTIFIED
                 </Badge>
               </div>
            </div>
            
            {(item.images?.length ?? 0) > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
                {item.images.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`flex-shrink-0 w-24 h-18 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-[#EA580C] scale-95 shadow-lg' : 'border-white hover:border-slate-200'}`}
                  >
                    <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tabbed Info */}
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="bg-white border-b border-slate-100 rounded-none w-full justify-start h-auto p-0 gap-8 mb-8">
              <TabsTrigger value="specifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#EA580C] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-black text-sm uppercase tracking-widest px-0 pb-4 text-slate-400 data-[state=active]:text-slate-900 transition-all">
                Specifications
              </TabsTrigger>
              <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#EA580C] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-black text-sm uppercase tracking-widest px-0 pb-4 text-slate-400 data-[state=active]:text-slate-900 transition-all">
                Asset Description
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="specifications" className="mt-0">
               <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0 text-sm">
                    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Manufacturer Year</span>
                      <span className="text-slate-900 font-bold">{item.yearManufactured || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Net Weight</span>
                      <span className="text-slate-900 font-bold text-right">{item.weight ? `${item.weight.toLocaleString()} ${item.category === 'vessels' ? 'Tons' : 'kg'}` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Condition Grade</span>
                      <span className="text-slate-900 font-bold">{item.condition}</span>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Asset Category</span>
                      <span className="text-slate-900 font-bold capitalize">{(item.category || 'Equipment').replace('-', ' ')}</span>
                    </div>
                  </div>
               </div>
            </TabsContent>
            
            <TabsContent value="details" className="mt-0">
               <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {item.details || 'No extended technical description provided for this asset.'}
                  </p>
               </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Status, Pricing & Provider */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Stats Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2">
               <Scale className="w-5 h-5 text-[#EA580C]" />
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weight Class</p>
                  <p className="text-lg font-black text-slate-900">{item.weight > 0 ? `${item.weight.toLocaleString()}` : '-'}</p>
               </div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2">
               <Construction className="w-5 h-5 text-[#EA580C]" />
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Year Model</p>
                  <p className="text-lg font-black text-slate-900">{item.yearManufactured || '-'}</p>
               </div>
            </div>
          </div>

          <div className="bg-[#050B20] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#EA580C]/20 blur-[60px] rounded-full -mr-16 -mt-16" />
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 border-l-2 border-[#EA580C] pl-4">Premium Rates</p>
            <div className="space-y-8">
              <div>
                <p className="text-5xl font-black tracking-tighter text-[#EA580C]">₦{(item?.dailyRate || 0).toLocaleString()}</p>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2 ml-1">Flat Daily Rate</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
                <div>
                   <p className="text-xl font-bold">₦{(item?.hourlyRate || 0).toLocaleString()}</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">per hour</p>
                </div>
                <div>
                   <p className="text-xl font-bold">₦{(item?.monthlyRate || 0).toLocaleString()}</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">monthly</p>
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full py-7 rounded-2xl bg-white text-[#050B20] hover:bg-slate-100 font-black border-0 transition-all active:scale-95 shadow-xl shadow-white/5 text-base tracking-tight">
                  Reserve This Asset
                </Button>
                <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-tighter mt-4 opacity-60 italic">
                  * Final pricing may vary based on deployment duration
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 border-l-2 border-slate-200 pl-4">Managed By</p>
            {company && (
              <div className="space-y-6">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-2 shadow-inner">
                      {company.logo && company.logo !== 'string' ? (
                        <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                           <Package className="w-8 h-8" />
                        </div>
                      )}
                   </div>
                   <div>
                      <p className="font-black text-slate-900 text-lg leading-tight tracking-tight">{company.name || 'Unknown Provider'}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
                        <p className="text-xs font-bold text-slate-500">{company.location}, {company.country}</p>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-2 pb-2">
                   {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                   <span className="text-xs font-black text-slate-900 ml-2">5.0</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">(12 Reviews)</span>
                </div>
                <Button variant="outline" className="w-full rounded-2xl border-slate-200 text-slate-600 font-black h-14 bg-white hover:bg-slate-50 transition-all active:scale-95" asChild>
                   <Link href={`/dashboard/companies/${company.id}`}>View Portfolio</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="bg-slate-50/50 rounded-3xl p-8 border border-white shadow-sm space-y-4">
             <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#EA580C]/10 text-[#EA580C]">
                  <Shield className="w-5 h-5" />
                </div>
                <p className="text-sm font-black text-slate-900 uppercase tracking-wider">MuskMover Verified</p>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed font-medium">
               This asset has undergone a full technical inspection. All specifications provided are guaranteed by our maritime quality assurance team.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
