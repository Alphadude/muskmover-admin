import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AlertTriangle, Trash2 } from "lucide-react"
import { Button } from "./button"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  isLoading?: boolean
}

export function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description,
  isLoading = false
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-10 text-center space-y-8 rounded-[2.5rem] border-none shadow-2xl bg-white/95 backdrop-blur-xl">
        <div className="flex justify-center relative">
          <div className="absolute inset-0 bg-red-400/20 blur-[50px] rounded-full" />
          <div className="relative w-24 h-24 rounded-full bg-red-50 border-4 border-white flex items-center justify-center text-red-500 shadow-xl shadow-red-100 animate-in zoom-in duration-500">
            <Trash2 className="w-12 h-12" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{title}</h2>
          <p className="text-slate-500 font-medium leading-relaxed px-4">
            {description}
          </p>
        </div>
        
        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={onConfirm} 
            disabled={isLoading}
            className="h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-base shadow-xl shadow-red-200 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Yes, Delete Asset"}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isLoading}
            className="h-12 rounded-2xl text-slate-400 font-bold hover:text-slate-600 hover:bg-transparent"
          >
            Cancel, Keep Asset
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
