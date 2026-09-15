'use client'

import React from 'react'
import { AlertCircle, ShieldAlert, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorBannerProps {
  title?: string
  message: string
  onDismiss?: () => void
  className?: string
  showHelpHint?: boolean
}

export function ErrorBanner({
  title = 'Authentication Error',
  message,
  onDismiss,
  className,
  showHelpHint = true,
}: ErrorBannerProps) {
  if (!message) return null

  // Provide contextual guidance for common auth errors
  const isCredentialError = /invalid.*(email|password|credential)/i.test(message)
  const isRateLimitError = /too many.*(attempt|request)/i.test(message)

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'relative overflow-hidden rounded-xl border border-destructive/30 bg-destructive/5 p-4 shadow-soft backdrop-blur-md animate-in fade-in-50 slide-in-from-top-2 duration-300',
        className
      )}
    >
      {/* Project theme: Maritime Ocean Gradient accent line on the left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#050B20] via-[#EA580C] to-[#ff4d4d]" />

      <div className="flex items-start gap-3 pl-1.5">
        {/* Themed Icon Container */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive ring-1 ring-destructive/25 shadow-sm">
          {isCredentialError ? (
            <ShieldAlert className="h-4.5 w-4.5" />
          ) : (
            <AlertCircle className="h-4.5 w-4.5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-destructive">
              {title}
            </span>
          </div>

          <p className="mt-1 text-sm font-semibold text-foreground leading-snug">
            {message}
          </p>

          {showHelpHint && isCredentialError && (
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Please double-check your email and password. If you do not have an administrator account, contact your system administrator.
            </p>
          )}

          {showHelpHint && isRateLimitError && (
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              For security, this endpoint has been temporarily locked. Please wait before attempting to sign in again.
            </p>
          )}
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 p-1 -mr-1 -mt-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-destructive/10 transition-colors"
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
