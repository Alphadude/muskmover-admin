'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

type Tab = 'equipment' | 'vessel'

const inputCls =
  'w-full h-12 rounded-lg border-slate-300 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900'
const selectCls =
  'w-full h-12 rounded-lg border-slate-300 bg-white text-sm focus:ring-1 focus:ring-slate-900'

export default function AddEquipmentPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('equipment')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])

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
      toast(`${activeTab === 'vessel' ? 'Vessel' : 'Equipment'} added successfully!`, {
        description: 'The new asset has been listed in the marketplace.',
      })
      router.push('/dashboard/equipment')
    }, 1500)
  }

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
        <span
          className="hover:text-foreground cursor-pointer transition-colors"
          onClick={() => router.push('/dashboard')}
        >
          Dashboard
        </span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span
          className="hover:text-foreground cursor-pointer transition-colors"
          onClick={() => router.push('/dashboard/equipment')}
        >
          Equipment
        </span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium">Add Asset</span>
      </div>

      {/* Tab Switcher */}
      <div className="flex rounded-full border border-slate-200 bg-slate-100 p-1 w-fit gap-1 mb-10">
        <button
          type="button"
          onClick={() => setActiveTab('equipment')}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'equipment'
              ? 'bg-[#050B20] text-white shadow'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Equipment
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vessel')}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
            activeTab === 'vessel'
              ? 'bg-[#050B20] text-white shadow'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Vessel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">

        {/* ── Assign to Company (shared) ── */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Assign to Company</h2>
          <div className="space-y-3">
            <Select required>
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
              <Select defaultValue="available">
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
              <Select defaultValue="excellent">
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
                <Input placeholder="Equipment Name" required className={inputCls} />
                <Select required>
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
                  placeholder="Technical details, features, use case..."
                  className="rounded-lg border-slate-300 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900 min-h-[100px]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Dimensions & Specs</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder="Weight (tons)" className={inputCls} />
                  <Input type="number" min="1950" max={new Date().getFullYear()} placeholder="Year Manufactured" className={inputCls} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Pricing</h2>
              <div className="space-y-3">
                <Input type="number" min="0" placeholder="Hourly Rate (₦)" className={inputCls} />
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" min="0" placeholder="Daily Rate (₦)" required className={inputCls} />
                  <Input type="number" min="0" placeholder="Monthly Rate (₦)" className={inputCls} />
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
                <Input placeholder="Vessel Name" required className={inputCls} />
                <Input placeholder="Vessel Type (e.g. 1,200 BHP Security/Utility OVS/PVS)" className={inputCls} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Builder" className={inputCls} />
                  <Input placeholder="Year Built / Rebuilt (e.g. 1980 / 2015)" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Flag / Home Port (e.g. Nigeria / Lagos)" className={inputCls} />
                  <Input type="number" step="0.1" placeholder="Total HP (e.g. 1200)" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" step="0.1" placeholder="Max Speed (knots)" className={inputCls} />
                  <Input type="number" step="0.1" placeholder="Economical Speed (knots)" className={inputCls} />
                </div>
                <Input placeholder="Engine Configuration (e.g. 2 × 600HP)" className={inputCls} />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Dimensions & Capacities</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" step="0.01" placeholder="Length (m)" className={inputCls} />
                  <Input type="number" step="0.01" placeholder="Breadth (m)" className={inputCls} />
                </div>
                <Input type="number" step="0.01" placeholder="Depth (m)" className={inputCls} />
                <Input placeholder="Clear Deck Space (e.g. 70' × 30')" className={inputCls} />
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder="Deck Cargo Capacity (tons)" className={inputCls} />
                  <Input type="number" placeholder="Fuel Consumption (liters/day)" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder="Fuel Capacity (US gal)" className={inputCls} />
                  <Input type="number" placeholder="Water Capacity (US gal)" className={inputCls} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Machinery & Equipment</h2>
              <div className="space-y-3">
                <Input placeholder="Main Engines (e.g. 16 V92 GM Twin)" className={inputCls} />
                <Input placeholder="Generators (e.g. (2) 40KW 4-71 GM)" className={inputCls} />
                <Textarea
                  placeholder="Special Equipment (e.g. Fire Fighting Hale GPM 800, Oil Dispersant System, Life Saving equipment...)"
                  className="rounded-lg border-slate-300 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900 min-h-[90px]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Accommodations</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder="Person Capacity (Certified)" className={inputCls} />
                  <Select defaultValue="full">
                    <SelectTrigger className={selectCls}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Air Conditioning</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Additional amenities (e.g. Walk-in cooler/freezer, full galley...)"
                  className="rounded-lg border-slate-300 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900 min-h-[80px]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Pricing</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" min="0" placeholder="Daily Rate (₦)" className={inputCls} />
                  <Input type="number" min="0" placeholder="Monthly Rate (₦)" className={inputCls} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── MEDIA & IMAGES (shared) ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Media & Images</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {images.length} / 10 Images
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((src, index) => (
              <div key={index} className="relative group aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
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
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-3">Upload</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            )}
            {images.length === 0 && (
              <div className="col-span-full py-10 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-400">No images uploaded yet</p>
                <p className="text-xs text-slate-400 mt-1">Upload at least one image of the {activeTab}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-8 rounded-lg bg-[#050B20] hover:bg-[#050B20]/90 text-white font-semibold text-sm transition-all"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {activeTab === 'vessel' ? 'Save Vessel' : 'Save Equipment'}
              </span>
            )}
          </Button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Return to Equipment
          </button>
        </div>

      </form>
    </div>
  )
}
