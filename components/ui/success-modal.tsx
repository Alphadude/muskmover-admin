import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CheckCircle2 } from "lucide-react"
import { Button } from "./button"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  actionLabel, 
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-10 text-center space-y-8 rounded-[2.5rem] border-none shadow-2xl bg-white/95 backdrop-blur-xl">
        <div className="flex justify-center relative">
          <div className="absolute inset-0 bg-emerald-400/20 blur-[50px] rounded-full" />
          <div className="relative w-24 h-24 rounded-full bg-emerald-50 border-4 border-white flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-100 animate-in zoom-in duration-500">
            <CheckCircle2 className="w-12 h-12" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{title}</h2>
          <p className="text-slate-500 font-medium leading-relaxed px-4">
            {message}
          </p>
        </div>
        
        <div className="flex flex-col gap-3 pt-4">
          {actionLabel && onAction && (
            <Button 
              onClick={onAction} 
              className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button 
              variant="outline"
              onClick={onSecondaryAction} 
              className="h-14 rounded-2xl border-slate-200 text-slate-600 font-bold text-base hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              {secondaryActionLabel}
            </Button>
          )}
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="h-12 rounded-2xl text-slate-400 font-bold hover:text-slate-600 hover:bg-transparent"
          >
            Not Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
