'use client'

import { Bell, CheckCircle2, Package, Search, PlusCircle, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const notifications = [
  {
    id: 1,
    title: 'Order Completed',
    description: 'Order #ORD-8291 for "Advanced Underwater Welding Kit" has been successfully delivered and completed.',
    type: 'order',
    time: '2 minutes ago',
    unread: true,
    icon: CheckCircle2,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    id: 2,
    title: 'New Equipment Added',
    description: 'A new "Industrial Grade ROV System" has been added to the equipment marketplace.',
    type: 'equipment',
    time: '45 minutes ago',
    unread: true,
    icon: Package,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    id: 3,
    title: 'Service Request Approved',
    description: 'Your request for "Marine Hull Inspection" service has been approved by the provider.',
    type: 'service',
    time: '2 hours ago',
    unread: false,
    icon: PlusCircle,
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    id: 4,
    title: 'New Service Provider',
    description: 'Atlantic Marine Services has joined the platform as a new service provider.',
    type: 'service',
    time: '5 hours ago',
    unread: false,
    icon: PlusCircle,
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    id: 5,
    title: 'Equipment Stock Alert',
    description: 'Only 2 units remaining for "Satellite Navigation Pro" in your watchlist.',
    type: 'equipment',
    time: 'Yesterday',
    unread: false,
    icon: Package,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    id: 6,
    title: 'Payment Confirmed',
    description: 'Payment for Order #ORD-8274 has been confirmed. Processing shipment.',
    type: 'order',
    time: 'Yesterday',
    unread: false,
    icon: CheckCircle2,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-50',
  },
]

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search notifications..." 
            className="pl-10 bg-white border-slate-200 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-slate-600">
            Mark all as read
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-6 transition-all duration-200 hover:bg-slate-50 cursor-pointer relative group ${
                notification.unread ? 'bg-slate-50/50' : ''
              }`}
            >
              {notification.unread && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              )}
              
              <div className="flex gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${notification.bgColor} flex items-center justify-center`}>
                  <notification.icon className={`w-6 h-6 ${notification.iconColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold text-slate-900 truncate ${notification.unread ? 'font-bold' : ''}`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mb-2">
                    {notification.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wider font-bold">
                      {notification.type}
                    </Badge>
                    {notification.unread && (
                      <Badge className="bg-primary hover:bg-primary text-[10px] uppercase tracking-wider font-bold">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-primary hover:text-primary hover:bg-primary/5">
                     View Details
                   </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-center">
          <Button variant="ghost" className="text-slate-500 font-bold text-sm">
            Load more notifications
          </Button>
        </div>
      </div>
    </div>
  )
}
