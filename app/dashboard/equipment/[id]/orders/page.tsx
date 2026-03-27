'use client'

import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, ArrowLeft, Download, ShoppingCart } from 'lucide-react'
import { orderService } from '@/lib/services/order'
import { equipmentService } from '@/lib/services/equipment'
import { Order, Equipment } from '@/lib/types'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function EquipmentOrdersPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [equipmentData, ordersData] = await Promise.all([
          equipmentService.getById(id),
          orderService.getByEquipmentId(id)
        ])
        
        const ordersArray = Array.isArray(ordersData) ? ordersData : (ordersData as any)?.orders || (ordersData as any)?.data || []
        
        setEquipment(equipmentData)
        setOrders(ordersArray)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch equipment orders')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-muted-foreground">Loading order history...</p>
      </div>
    )
  }

  if (error || !equipment) {
    return (
      <div className="space-y-6">
        <Header title={error ? "Error" : "Asset Not Found"} />
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {error || "The equipment you are looking for does not exist."}
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const columns = [
    {
      key: 'id' as const,
      label: 'Order ID',
      width: '15%',
      render: (value: string) => <span className="font-bold text-slate-900">{value}</span>,
    },
    {
      key: 'renterName' as const,
      label: 'Rented By',
      width: '25%',
      render: (value: string, order: Order) => (
        <div>
          <p className="font-bold text-slate-900">{value}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{order.renterEmail}</p>
        </div>
      ),
    },
    {
      key: 'startDate' as const,
      label: 'Duration',
      width: '20%',
      render: (_: Date, order: Order) => (
        <div className="text-xs font-bold text-slate-600">
          {new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'totalPrice' as const,
      label: 'Total Price',
      width: '15%',
      render: (value: number) => (
        <span className="font-black text-slate-900">
          ₦{value.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      width: '15%',
      render: (value: string) => {
        const variants: Record<string, 'default' | 'secondary'> = {
          active: 'default',
          completed: 'secondary',
          pending: 'secondary',
          confirmed: 'default',
        }
        return (
          <Badge variant={variants[value] || 'secondary'} className="font-bold uppercase tracking-wider text-[10px]">
            {value}
          </Badge>
        )
      },
    },
    {
      key: 'actions' as const,
      label: 'Actions',
      width: '10%',
      render: (value: string) => (
        <Button variant="ghost" size="sm" className="font-bold text-primary hover:text-primary hover:bg-primary/5">
          View
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6 pb-10">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
          <Link href="/dashboard/equipment" className="hover:text-slate-900 transition-colors">Equipment</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/dashboard/equipment/${equipment.id}`} className="hover:text-slate-900 transition-colors">{equipment.name}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900">Orders</span>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="rounded-lg border-slate-200 font-bold text-slate-600 gap-2">
             <Download className="w-4 h-4" />
             Export Orders
           </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-slate-400" />
               </div>
               <div>
                  <h2 className="text-lg font-black text-slate-900 leading-tight">Order History</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{orders.length} total orders for this asset</p>
               </div>
            </div>
        </div>
        <DataTable
          data={orders}
          columns={columns}
          totalItems={orders.length}
          itemsPerPage={10}
          totalPages={1}
        />
      </div>
    </div>
  )
}
