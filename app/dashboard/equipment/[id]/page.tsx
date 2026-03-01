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
} from 'lucide-react'
import { mockEquipment, mockCompanies } from '@/lib/mock-data'
import Link from 'next/link'

export default function EquipmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const item = mockEquipment.find((e) => e.id === id)
  const company = item ? mockCompanies.find((c) => c.id === item.companyId) : null

  if (!item) {
    return (
      <div className="space-y-6">
        <Header title="Asset Not Found" />
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            The equipment you are looking for does not exist.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const statusVariants: Record<string, 'default' | 'secondary'> = {
    available: 'default',
    rented: 'secondary',
    maintenance: 'secondary',
    unavailable: 'secondary',
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
          <Link href="/dashboard/equipment" className="hover:text-slate-900 transition-colors">Equipment</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900">{item.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="rounded-lg border-slate-200 font-bold text-slate-600">
            <Link href={`/dashboard/equipment/${item.id}/orders`} className="gap-2">
              <ShoppingCart className="w-4 h-4" />
              View Orders
            </Link>
          </Button>
          <Button size="sm" asChild className="rounded-lg bg-[#050B20] hover:bg-[#050B20]/90 font-bold">
            <Link href={`/dashboard/equipment/${item.id}/edit`} className="gap-2">
              <Edit className="w-4 h-4" />
              Edit Asset
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main Info & Specs */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <Badge variant="secondary" className="mb-3 uppercase tracking-widest text-[10px] font-bold">
                  {item.category.replace('-', ' ')}
                </Badge>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                  {item.name}
                </h1>
                <p className="text-slate-500 font-medium leading-relaxed max-w-xl">
                  {item.description}
                </p>
              </div>
              <div className="text-right">
                <Badge variant={statusVariants[item.availability]} className="px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
                  {item.availability}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Condition</p>
                <p className="font-bold text-slate-900 capitalize">{item.condition}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Year</p>
                <p className="font-bold text-slate-900">{item.yearManufactured || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Weight</p>
                <p className="font-bold text-slate-900">{item.weight ? `${item.weight.toLocaleString()} tons` : '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Listed On</p>
                <p className="font-bold text-slate-900">{new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6">Technical Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
              {Object.entries(item.specifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{key.replace(/_/g, ' ')}</span>
                  <span className="text-slate-900 font-bold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
             <h2 className="text-xl font-black text-slate-900 mb-6">Media Gallery</h2>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {item.images.map((img, i) => (
                 <div key={i} className="aspect-video rounded-xl bg-slate-50 border border-slate-100 overflow-hidden group relative">
                    <img src={img} alt={`${item.name} gallery ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
               ))}
               {item.images.length === 0 && (
                 <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Package className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-400">No images available for this asset</p>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Right: Pricing & Company */}
        <div className="space-y-6">
          <div className="bg-[#050B20] rounded-2xl p-8 text-white shadow-xl shadow-slate-200">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-6">Pricing Information</p>
            <div className="space-y-6">
              <div>
                <p className="text-4xl font-black tracking-tighter text-[#EA580C]">₦{item.hourlyRate.toLocaleString()}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Hourly Rate</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                <div>
                   <p className="text-lg font-bold">₦{item.dailyRate.toLocaleString()}</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Daily</p>
                </div>
                <div>
                   <p className="text-lg font-bold">₦{item.monthlyRate.toLocaleString()}</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monthly</p>
                </div>
              </div>
              <Button className="w-full py-6 rounded-xl bg-white text-[#050B20] hover:bg-slate-100 font-bold border-0 mt-4 transition-transform active:scale-95 shadow-lg shadow-white/5">
                Generate Quotation
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">Service Provider</p>
            {company && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                      <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-2" />
                   </div>
                   <div>
                      <p className="font-black text-slate-900 leading-tight">{company.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <p className="text-xs font-bold text-slate-500">{company.location}, {company.country}</p>
                      </div>
                   </div>
                </div>
                <Button variant="outline" className="w-full rounded-xl border-slate-200 text-slate-600 font-bold h-11" asChild>
                   <Link href={`/dashboard/companies/${company.id}`}>View Company Profile</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
             <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <p className="text-sm font-bold text-slate-900">Platform Verified</p>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed">
               This asset has been verified by the MuskMover team to ensure it matches the technical specifications and condition stated.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
