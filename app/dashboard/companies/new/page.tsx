'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Save } from 'lucide-react'
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

export default function AddCompanyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast('Company created successfully!', {
        description: 'The new company and vessel have been added to the system.',
      })
      router.push('/dashboard/companies')
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
          onClick={() => router.push('/dashboard/companies')}
        >
          Marine Companies
        </span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium">Add Company</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">

        {/* Company Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Company Information</h2>
          <div className="space-y-3">
            <Input
              placeholder="Company Name"
              required
              className="h-12 rounded-lg border-slate-300 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900"
            />
            <Input
              type="email"
              placeholder="Contact Email"
              required
              className="h-12 rounded-lg border-slate-300 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900"
            />
            <Input
              type="tel"
              placeholder="Phone Number"
              className="h-12 rounded-lg border-slate-300 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900"
            />
            <Select defaultValue="ng">
              <SelectTrigger className="w-full h-12 rounded-lg border-slate-300 bg-white text-sm text-slate-400 data-[placeholder]:text-slate-400 focus:ring-1 focus:ring-slate-900">
                <SelectValue placeholder="Country / Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ng">Nigeria</SelectItem>
                <SelectItem value="gh">Ghana</SelectItem>
                <SelectItem value="za">South Africa</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="us">United States</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="City / Location"
                required
                className="h-12 rounded-lg border-slate-300 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900"
              />
              <Input
                placeholder="Postal Code (optional)"
                className="h-12 rounded-lg border-slate-300 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900"
              />
            </div>
            <Textarea
              placeholder="Company description / overview of services..."
              className="rounded-lg border-slate-300 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900 min-h-[100px]"
            />
          </div>
        </div>

        {/* Vessel / Equipment */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Initial Vessel / Equipment</h2>
          <div className="space-y-3">
            <Input
              placeholder="Equipment / Vessel Name"
              required
              className="h-12 rounded-lg border-slate-300 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900"
            />
            <div className="grid grid-cols-2 gap-3">
              <Select required>
                <SelectTrigger className="h-12 rounded-lg border-slate-300 bg-white text-sm focus:ring-1 focus:ring-slate-900">
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
              <Select defaultValue="excellent">
                <SelectTrigger className="h-12 rounded-lg border-slate-300 bg-white text-sm focus:ring-1 focus:ring-slate-900">
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
            <Textarea
              placeholder="Technical details, features, specifications..."
              className="rounded-lg border-slate-300 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900 min-h-[90px]"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min="0"
                placeholder="Daily Rate (₦)"
                required
                className="h-12 rounded-lg border-slate-300 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900"
              />
              <Input
                type="number"
                min="1950"
                max={new Date().getFullYear()}
                placeholder="Year Manufactured"
                className="h-12 rounded-lg border-slate-300 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900"
              />
            </div>
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
                Save Company
              </span>
            )}
          </Button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Return to Companies
          </button>
        </div>

      </form>
    </div>
  )
}
