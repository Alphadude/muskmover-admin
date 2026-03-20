'use client'

import { notificationService } from '@/lib/services/notification'
import { Message } from '@/lib/types'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const data = await notificationService.getAll()
      const notificationsArray = Array.isArray(data) ? data : (data as any)?.notifications || (data as any)?.data || []
      setNotifications(notificationsArray)
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
      toast.success('Notification marked as read')
    } catch (err) {
      toast.error('Failed to update notification')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read')
    } catch (err) {
      toast.error('Failed to update notifications')
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await notificationService.delete(id)
      setNotifications(notifications.filter(n => n.id !== id))
      toast.success('Notification deleted')
    } catch (err) {
      toast.error('Failed to delete notification')
    }
  }

  const getIconConfig = (type?: string) => {
    switch (type) {
      case 'order':
        return { icon: CheckCircle2, iconColor: 'text-green-500', bgColor: 'bg-green-50' }
      case 'equipment':
        return { icon: Package, iconColor: 'text-blue-500', bgColor: 'bg-blue-50' }
      default:
        return { icon: Bell, iconColor: 'text-purple-500', bgColor: 'bg-purple-50' }
    }
  }

  const filteredNotifications = notifications.filter(n => 
    n.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.body.toLowerCase().includes(searchTerm.toLowerCase())
  )
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search notifications..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-slate-200 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-slate-600"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-muted-foreground">Loading alerts...</p>
          </div>
        ) : error ? (
          <div className="p-20 text-center space-y-4">
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" onClick={fetchNotifications}>Try Again</Button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <Bell className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-500 font-medium">No notifications found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notification) => {
              const { icon: Icon, iconColor, bgColor } = getIconConfig((notification as any).type)
              return (
                <div 
                  key={notification.id}
                  onClick={() => handleMarkAsRead(notification.id)}
                  className={`p-6 transition-all duration-200 hover:bg-slate-50 cursor-pointer relative group ${
                    !notification.isRead ? 'bg-slate-50/50' : ''
                  }`}
                >
                  {!notification.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  
                  <div className="flex gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold text-slate-900 truncate ${!notification.isRead ? 'font-bold' : ''}`}>
                          {notification.subject}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mb-2">
                        {notification.body}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wider font-bold">
                          {(notification as any).type || 'info'}
                        </Badge>
                        {!notification.isRead && (
                          <Badge className="bg-primary hover:bg-primary text-[10px] uppercase tracking-wider font-bold">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-destructive"
                        onClick={(e) => handleDelete(notification.id, e)}
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                       <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-primary hover:text-primary hover:bg-primary/5">
                         View
                       </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {!isLoading && filteredNotifications.length > 0 && (
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-center">
            <Button variant="ghost" className="text-slate-500 font-bold text-sm">
              Load more notifications
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
