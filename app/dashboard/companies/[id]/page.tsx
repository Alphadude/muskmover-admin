'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
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
  Trash2,
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
import { companyService } from '@/lib/services/company'
import { equipmentService } from '@/lib/services/equipment'
import { orderService } from '@/lib/services/order'
import { MarineCompany, Equipment, Order, CompanyVerificationStatus } from '@/lib/types'
import { useEffect } from 'react'
import { DataTable } from '@/components/data-table'

export default function CompanyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  const [company, setCompany] = useState<MarineCompany | null>(null)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'suspend' | 'delete' | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Fetch company first as it is essential
        const companyData = await companyService.getById(companyId)
        
        // Handle potential 'data' wrapper from API
        const rawCompany = (companyData as any).data || companyData;
        
        // Fetch equipment and orders cautiously
        const [equipmentData, ordersData] = await Promise.all([
          equipmentService.getByCompanyId(companyId).catch(err => {
            console.warn('Failed to fetch equipment:', err)
            return []
          }),
          orderService.getByCompanyId(companyId).catch(err => {
            console.warn('Failed to fetch orders:', err)
            return []
          })
        ])
        
        const equipmentArray = Array.isArray(equipmentData) ? equipmentData : (equipmentData as any)?.equipment || (equipmentData as any)?.data || (equipmentData as any)?.equipments || []
        const ordersArray = Array.isArray(ordersData) ? ordersData : (ordersData as any)?.orders || (ordersData as any)?.data || []
        
        const mappedCompany = {
          ...rawCompany,
          name: rawCompany.name || 'Unknown Company',
          contactEmail: rawCompany.contactEmail || rawCompany.email || '',
          joinedDate: rawCompany.joinedDate || rawCompany.createdAt || new Date(),
          totalEquipment: rawCompany.totalEquipment ?? (Array.isArray(rawCompany.equipments) ? rawCompany.equipments.length : 0),
          totalVessels: Array.isArray(rawCompany.vessels) ? rawCompany.vessels.length : 0,
        }
        
        setCompany(mappedCompany as MarineCompany)
        setEquipment(equipmentArray)
        setOrders(ordersArray)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch company details')
      } finally {
        setIsLoading(false)
      }
    }

    if (companyId) {
      fetchData()
    }
  }, [companyId])

  const handleStatusUpdate = async (newStatus: string) => {
    if (!company) return
    const toastId = toast.loading(`Updating company status to ${newStatus}...`)
    try {
      await companyService.update(companyId, { status: newStatus })
      setCompany({ ...company, status: newStatus })
      toast.success(`Company status updated to ${newStatus}`, { id: toastId })
      // Refresh to ensure any server components or global state are in sync
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status', { id: toastId })
    }
  }

  const handleStatusDelete = async () => {
    if (!company) return
    const toastId = toast.loading('Deleting company...')
    try {
      await companyService.delete(companyId)
      toast.success('Company deleted successfully', { id: toastId })
      router.push('/dashboard/companies')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete company', { id: toastId })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-muted-foreground">Loading company details...</p>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="space-y-6">
        <div className="text-center py-20 bg-white rounded-2xl border border-destructive/10 shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Oops! Something went wrong</h2>
            <p className="text-muted-foreground max-w-md mx-auto mt-2">
              {error || 'The company you are looking for does not exist or could not be loaded.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  const statusConfig = {
    Approved: {
      icon: <Check className="w-5 h-5 text-emerald-500" />,
      label: 'Approved',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    Pending: {
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      label: 'Pending',
      className: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    Unverified: {
      icon: <Clock className="w-5 h-5 text-slate-500" />,
      label: 'Unverified',
      className: 'bg-slate-50 text-slate-700 border-slate-100',
    },
  }

  const currentStatus = (company.status || 'Unverified') as keyof typeof statusConfig
  const status = statusConfig[currentStatus] || statusConfig.Unverified

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
      key: 'status' as const,
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
      key: 'actions' as const,
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
      key: 'renterName' as const,
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
      key: 'actions' as const,
      label: 'Actions',
      width: '10%',
      render: () => <Button variant="ghost" size="sm">View</Button>,
    },
  ]

  return (
    <div className="space-y-10 pb-20">

      {/* Company Header Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-border/50 shadow-soft overflow-hidden glass">
        {/* Banner Section */}
        <div className="relative h-48 sm:h-64 w-full bg-slate-100">
          {company.banner ? (
            <img 
              src={company.banner} 
              alt={`${company.name} banner`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <Package className="w-12 h-12 text-slate-300" />
            </div>
          )}
          
          {/* Logo Overlay */}
          <div className="absolute -bottom-12 left-10 p-2 rounded-3xl bg-white shadow-xl border border-slate-100">
            <div className="w-24 h-24 rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center p-2">
              {company.logo ? (
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-2xl font-black text-slate-200">
                  {(company.name || 'CO').substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-10 pt-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
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
                  {company.postalCode && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Zip</span>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        {company.postalCode}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {status?.icon}
                    <Badge className={`font-bold uppercase tracking-wider text-[10px] px-3 py-1 shadow-sm border ${status?.className || ''}`} variant="outline">
                      {status?.label || 'Unknown'}
                    </Badge>
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
                  {company.rating || 0}
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Equipment</p>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {company.totalEquipment}
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-3">
                   <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-[#050B20] group-hover:text-white transition-colors">
                    <Package className="w-4 h-4" />
                   </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Vessels</p>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {(company as any).totalVessels || 0}
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
                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(company.totalRevenue || 0)}
                  </span>
                  <span className="text-xs font-medium text-[#EA580C]">+12.5%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                onClick={() => router.push(`/dashboard/companies/${companyId}/edit`)}
                className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold border-0 transition-transform hover:scale-105 active:scale-95"
              >
                Edit Profile
              </Button>
              <Button 
                onClick={() => { setActionType('approve'); setIsModalOpen(true); }}
                disabled={company.status === 'Approved'}
                className="flex-1 h-12 rounded-xl bg-[#EA580C] hover:bg-[#D44D0A] font-bold shadow-[#EA580C]/20 shadow-lg border-0 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100"
              >
                {company.status === 'Approved' ? 'Already Approved' : 'Approve Business'}
              </Button>
            </div>
            <div className="flex gap-3 mt-3">
              <Button 
                onClick={() => { setActionType('suspend'); setIsModalOpen(true); }}
                disabled={company.status === 'Unverified'}
                variant="outline" 
                className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all disabled:opacity-50 disabled:bg-slate-50"
              >
                {company.status === 'Unverified' ? 'Account Suspended' : 'Suspend Account'}
              </Button>
              <Button 
                onClick={() => { setActionType('delete'); setIsModalOpen(true); }}
                variant="ghost" 
                className="flex-1 h-12 rounded-xl text-destructive hover:bg-destructive/10 font-bold transition-all"
              >
                Delete Company
              </Button>
            </div>

            <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <AlertDialogContent className="rounded-2xl border-slate-200">
                <AlertDialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      actionType === 'delete' ? 'bg-red-50 text-red-600' :
                      actionType === 'suspend' ? 'bg-orange-50 text-orange-600' : 
                      'bg-green-50 text-green-600'
                    }`}>
                      {actionType === 'delete' ? <Trash2 className="w-5 h-5" /> :
                       actionType === 'suspend' ? <AlertTriangle className="w-5 h-5" /> : 
                       <Check className="w-5 h-5" />}
                    </div>
                    <AlertDialogTitle className="text-xl font-bold text-slate-900">
                      {actionType === 'approve' ? 'Approve Business' : 
                       actionType === 'suspend' ? 'Suspend Account' :
                       'Delete Company'}
                    </AlertDialogTitle>
                  </div>
                  <AlertDialogDescription className="text-slate-600 text-base leading-relaxed">
                    {actionType === 'approve' 
                      ? `Are you sure you want to approve "${company.name}"? This will mark the business as verified and visible on the marketplace.`
                      : actionType === 'suspend'
                      ? `Are you sure you want to suspend the account for "${company.name}"? This will restrict their access to the platform and hide their listings.`
                      : `Are you sure you want to delete "${company.name}"? This action is permanent and cannot be undone.`
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6">
                  <AlertDialogCancel className="rounded-xl font-bold h-11 border-slate-200 text-slate-600 hover:bg-slate-50">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    className={`rounded-xl font-bold h-11 border-0 shadow-lg transition-transform active:scale-95 ${
                      actionType === 'delete' || actionType === 'suspend'
                        ? 'bg-destructive hover:bg-destructive/90 shadow-destructive/20' 
                        : 'bg-[#EA580C] hover:bg-[#D44D0A] shadow-[#EA580C]/20'
                    }`}
                    onClick={() => {
                      if (actionType === 'approve') {
                        handleStatusUpdate('Approved')
                      } else if (actionType === 'suspend') {
                        handleStatusUpdate('Unverified')
                      } else if (actionType === 'delete') {
                        handleStatusDelete()
                      }
                      setIsModalOpen(false);
                    }}
                  >
                    Confirm {actionType === 'approve' ? 'Approval' : actionType === 'suspend' ? 'Suspension' : 'Deletion'}
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
