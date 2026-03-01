'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Star,
  Package,
  ShoppingCart,
  TrendingUp,
  Check,
  Clock,
  AlertTriangle,
} from 'lucide-react'
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
  mockCompanies,
  getCompanyById,
  getEquipmentByCompanyId,
  getOrdersByCompanyId,
} from '@/lib/mock-data'
import { DataTable } from '@/components/data-table'

export default function CompanyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'suspend' | null>(null)

  const company = getCompanyById(companyId)
  const equipment = getEquipmentByCompanyId(companyId)
  const orders = getOrdersByCompanyId(companyId)

  if (!company) {
    return (
      <div className="space-y-6">
        <Header title="Company Not Found" />
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            The company you are looking for does not exist.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const statusConfig = {
    verified: {
      icon: <Check className="w-5 h-5 text-green-500" />,
      label: 'Verified',
      variant: 'default' as const,
    },
    pending: {
      icon: <Clock className="w-5 h-5 text-orange-500" />,
      label: 'Pending',
      variant: 'secondary' as const,
    },
    unverified: {
      icon: <Clock className="w-5 h-5 text-red-500" />,
      label: 'Unverified',
      variant: 'secondary' as const,
    },
  }

  const status =
    statusConfig[company.verificationStatus as keyof typeof statusConfig]

  const equipmentColumns = [
    {
      key: 'name' as const,
      label: 'Equipment Name',
      width: '30%',
    },
    {
      key: 'category' as const,
      label: 'Category',
      width: '20%',
    },
    {
      key: 'hourlyRate' as const,
      label: 'Hourly Rate',
      width: '15%',
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
    {
      key: 'availability' as const,
      label: 'Status',
      width: '20%',
      render: (value: string) => (
        <Badge
          variant={
            value === 'available' ? 'default' : 'secondary'
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'id' as const,
      label: 'Actions',
      width: '15%',
      render: () => <Button variant="ghost" size="sm">View</Button>,
    },
  ]

  const ordersColumns = [
    {
      key: 'id' as const,
      label: 'Order ID',
      width: '20%',
    },
    {
      key: 'rentedBy' as const,
      label: 'Rented By',
      width: '25%',
    },
    {
      key: 'startDate' as const,
      label: 'Start Date',
      width: '15%',
      render: (value: Date) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'totalPrice' as const,
      label: 'Total Price',
      width: '15%',
      render: (value: number) => `₦${value.toLocaleString()}`,
    },
    {
      key: 'status' as const,
      label: 'Status',
      width: '15%',
      render: (value: string) => (
        <Badge
          variant={value === 'active' ? 'default' : 'secondary'}
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'id' as const,
      label: 'Actions',
      width: '10%',
      render: () => <Button variant="ghost" size="sm">View</Button>,
    },
  ]

  return (
    <div className="space-y-10 pb-20">

      {/* Company Header Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-border/50 p-10 shadow-soft glass">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left side - Basic info */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  {company.name}
                </h1>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 shadow-sm">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {company.location}, {company.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {status.icon}
                    <Badge className="font-bold uppercase tracking-wider text-[10px] px-3 py-1 shadow-sm border-0" variant={status.variant}>{status.label}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {company.description && (
              <div className="mb-8">
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  {company.description}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-6 border-t border-slate-100 pt-8 mt-4">
              <div className="flex items-center gap-3 group">
                <div className="p-2.5 rounded-xl bg-slate-50 text-slate-900 group-hover:bg-[#050B20] group-hover:text-white transition-all shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Email Address</p>
                  <a
                    href={`mailto:${company.contactEmail}`}
                    className="text-sm font-bold text-slate-900 hover:text-[#EA580C] transition-colors underline decoration-slate-200 underline-offset-4"
                  >
                    {company.contactEmail}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="p-2.5 rounded-xl bg-orange-50 text-[#EA580C] group-hover:bg-[#EA580C] group-hover:text-white transition-all shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Phone Number</p>
                  <a href={`tel:${company.phone}`} className="text-sm font-bold text-slate-900 hover:text-[#EA580C] transition-colors">
                    {company.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Stats Overlay */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Company Rating</span>
                {company.rating > 0 && (
                  <div className="flex items-center gap-1 bg-[#EA580C]/10 px-2 py-0.5 rounded-lg border border-[#EA580C]/20">
                    <Star className="w-3.5 h-3.5 text-[#EA580C] fill-[#EA580C]" />
                    <span className="text-xs font-bold text-[#EA580C]">TOP VENDOR</span>
                  </div>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-5xl font-black text-slate-900 tracking-tighter">
                  {company.rating > 0 ? company.rating : '-'}
                </p>
                <span className="text-lg font-bold text-slate-300">/ 5.0</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-3">
                   <div className="p-2 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-[#050B20] group-hover:text-white transition-colors">
                    <Package className="w-4 h-4" />
                   </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Items listed</p>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {company.totalEquipment}
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-3">
                   <div className="p-2 rounded-lg bg-orange-50 text-[#EA580C] group-hover:bg-[#EA580C] group-hover:text-white transition-colors">
                    <ShoppingCart className="w-4 h-4" />
                   </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Orders</p>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {company.totalOrders}
                </span>
              </div>

              <div className="bg-[#050B20] rounded-2xl p-5 shadow-lg col-span-2 group">
                <div className="flex items-center justify-between mb-3">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Total Revenue Generated</p>
                   <TrendingUp className="w-5 h-5 text-[#EA580C]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white tracking-tighter">
                    ₦{(company.totalRevenue / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-xs font-medium text-[#EA580C]">+12.5%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                onClick={() => { setActionType('approve'); setIsModalOpen(true); }}
                className="flex-1 h-12 rounded-xl bg-[#EA580C] hover:bg-[#D44D0A] font-bold shadow-[#EA580C]/20 shadow-lg border-0 transition-transform hover:scale-105 active:scale-95"
              >
                Approve Business
              </Button>
              <Button 
                onClick={() => { setActionType('suspend'); setIsModalOpen(true); }}
                variant="outline" 
                className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all"
              >
                Suspend Account
              </Button>
            </div>

            <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <AlertDialogContent className="rounded-2xl border-slate-200">
                <AlertDialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${actionType === 'suspend' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {actionType === 'suspend' ? <AlertTriangle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                    </div>
                    <AlertDialogTitle className="text-xl font-bold text-slate-900">
                      {actionType === 'approve' ? 'Approve Business' : 'Suspend Account'}
                    </AlertDialogTitle>
                  </div>
                  <AlertDialogDescription className="text-slate-600 text-base leading-relaxed">
                    {actionType === 'approve' 
                      ? `Are you sure you want to approve "${company.name}"? This will mark the business as verified and visible on the marketplace.`
                      : `Are you sure you want to suspend the account for "${company.name}"? This will restrict their access to the platform and hide their listings.`
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6">
                  <AlertDialogCancel className="rounded-xl font-bold h-11 border-slate-200 text-slate-600 hover:bg-slate-50">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    className={`rounded-xl font-bold h-11 border-0 shadow-lg transition-transform active:scale-95 ${
                      actionType === 'suspend' 
                        ? 'bg-destructive hover:bg-destructive/90 shadow-destructive/20' 
                        : 'bg-[#EA580C] hover:bg-[#D44D0A] shadow-[#EA580C]/20'
                    }`}
                    onClick={() => {
                      // Implementation logic would go here
                      setIsModalOpen(false);
                    }}
                  >
                    Confirm {actionType === 'approve' ? 'Approval' : 'Suspension'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Equipment Section */}
      {equipment.length > 0 && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Available Equipment</h2>
              <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                {equipment.length} items currently listed by vendor
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-600 font-bold h-10 px-6">Export List</Button>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-border/40 shadow-soft overflow-hidden">
            <DataTable data={equipment} columns={equipmentColumns} />
          </div>
        </div>
      )}

      {/* Orders Section */}
      {orders.length > 0 && (
        <div className="space-y-6 pt-6 pb-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Orders</h2>
              <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                Transaction history for this company
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-600 font-bold h-10 px-6">View All Orders</Button>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-border/40 shadow-soft overflow-hidden">
            <DataTable data={orders} columns={ordersColumns} />
          </div>
        </div>
      )}
    </div>
  )
}
