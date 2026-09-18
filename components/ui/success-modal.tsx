'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "./button"

export interface SuccessModalOptions {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  closeLabel?: string
  onClose?: () => void
}

export interface SuccessModalProps extends SuccessModalOptions {
  isOpen: boolean
  onClose: () => void
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  actionLabel, 
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  closeLabel
}: SuccessModalProps) {
  const handlePrimaryClick = () => {
    if (onAction) {
      onAction()
    } else {
      onClose()
    }
  }

  const handleSecondaryClick = () => {
    if (onSecondaryAction) {
      onSecondaryAction()
    } else {
      onClose()
    }
  }

  const hasExplicitActions = Boolean(actionLabel || secondaryActionLabel)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent 
        showCloseButton={true}
        className="sm:max-w-md p-8 sm:p-10 text-center space-y-6 rounded-[2.5rem] border border-slate-100 shadow-2xl bg-white/95 backdrop-blur-2xl"
      >
        <div className="flex justify-center relative pt-2">
          {/* Subtle brand glow behind icon */}
          <div className="absolute inset-0 bg-emerald-400/25 blur-[45px] rounded-full scale-150" />
          <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-emerald-50 to-emerald-100/70 border-4 border-white flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/15 animate-in zoom-in-75 duration-300">
            <CheckCircle2 className="w-11 h-11 sm:w-12 sm:h-12" strokeWidth={2.4} />
          </div>
        </div>
        
        <div className="space-y-2.5">
          <h2 className="text-2xl sm:text-3xl font-black text-[#050B20] tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        </div>
        
        <div className="flex flex-col gap-3 pt-2">
          {actionLabel ? (
            <Button 
              onClick={handlePrimaryClick} 
              className="h-13 sm:h-14 rounded-2xl bg-[#050B20] hover:bg-[#050B20]/90 text-white font-bold text-base shadow-xl shadow-[#050B20]/15 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : !hasExplicitActions ? (
            <Button 
              onClick={onClose} 
              className="h-13 sm:h-14 rounded-2xl bg-[#050B20] hover:bg-[#050B20]/90 text-white font-bold text-base shadow-xl shadow-[#050B20]/15 transition-all active:scale-[0.98]"
            >
              {closeLabel || 'Done'}
            </Button>
          ) : null}

          {secondaryActionLabel && onSecondaryAction && (
            <Button 
              variant="outline"
              onClick={handleSecondaryClick} 
              className="h-13 sm:h-14 rounded-2xl border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              {secondaryActionLabel}
            </Button>
          )}

          {hasExplicitActions && closeLabel !== 'none' && (
            <Button 
              variant="ghost" 
              onClick={onClose} 
              className="h-11 rounded-2xl text-slate-400 font-semibold hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {closeLabel || 'Dismiss'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface SuccessModalContextType {
  showSuccess: (options: SuccessModalOptions) => void
  hideSuccess: () => void
}

const SuccessModalContext = createContext<SuccessModalContextType | undefined>(undefined)

export function SuccessModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<{ isOpen: boolean; options: SuccessModalOptions }>({
    isOpen: false,
    options: { title: '', message: '' },
  })

  const showSuccess = useCallback((options: SuccessModalOptions) => {
    setModalState({
      isOpen: true,
      options,
    })
  }, [])

  const hideSuccess = useCallback(() => {
    setModalState(prev => {
      if (prev.options.onClose) {
        prev.options.onClose()
      }
      return { ...prev, isOpen: false }
    })
  }, [])

  const handleAction = useCallback(() => {
    if (modalState.options.onAction) {
      modalState.options.onAction()
    }
    setModalState(prev => ({ ...prev, isOpen: false }))
  }, [modalState.options])

  const handleSecondaryAction = useCallback(() => {
    if (modalState.options.onSecondaryAction) {
      modalState.options.onSecondaryAction()
    }
    setModalState(prev => ({ ...prev, isOpen: false }))
  }, [modalState.options])

  return (
    <SuccessModalContext.Provider value={{ showSuccess, hideSuccess }}>
      {children}
      <SuccessModal
        isOpen={modalState.isOpen}
        onClose={hideSuccess}
        title={modalState.options.title}
        message={modalState.options.message}
        actionLabel={modalState.options.actionLabel}
        onAction={handleAction}
        secondaryActionLabel={modalState.options.secondaryActionLabel}
        onSecondaryAction={handleSecondaryAction}
        closeLabel={modalState.options.closeLabel}
      />
    </SuccessModalContext.Provider>
  )
}

export function useSuccessModal() {
  const context = useContext(SuccessModalContext)
  if (!context) {
    throw new Error('useSuccessModal must be used within a SuccessModalProvider')
  }
  return context
}
