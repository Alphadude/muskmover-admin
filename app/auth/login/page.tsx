'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Ship } from 'lucide-react'
import { authService } from '@/lib/services/auth'
import { useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = sessionStorage.getItem('authToken')
    if (token) {
      router.push('/dashboard')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await authService.login({ email, password })
      
      // Robust extraction of token and user data
      const responseData = (response as any).data || response
      const token = responseData.token || (response as any).token
      const userData = responseData.admin || responseData.user || responseData

      if (token) {
        sessionStorage.setItem('authToken', token)
        sessionStorage.setItem('userEmail', userData.email || email)
        sessionStorage.setItem('userName', userData.name || 'Admin User')
        router.push('/dashboard')
      } else {
        throw new Error('Authentication failed: No token received from server.')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-card/30 border-r border-border items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/20 rounded-full blur-[140px]" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-ocean mb-8 flex items-center justify-center shadow-lg shadow-primary/20">
              <Ship className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-foreground mb-4">
              Marine Marketplace
            </h2>
            <p className="text-lg text-muted-foreground max-w-md text-balance leading-relaxed">
              The premier administration portal for maritime fleet management and vendor operations.
            </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 relative">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-medium tracking-tight text-foreground">Welcome to Marine Marketplace</h1>
            <p className="text-sm text-muted-foreground">New here or coming back? Choose how you want to continue</p>
          </div>

          {error && (
            <div className="p-3 text-sm rounded bg-destructive/10 border border-destructive/20 text-destructive text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@marketplace.com"
                className="w-full px-4 py-3 rounded bg-transparent border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-colors"
                required
              />
            </div>
            
            {/* Keeping password to not break app flow, but styling it minimally */}
            <div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded bg-transparent border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-colors pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
                <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                {isLoading ? (
                    <>
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                    </>
                ) : (
                    'Continue'
                )}
                </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground text-balance">
              By signing in you agree to our{' '}
              <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">Terms of service</a>
              {' '}&{' '}
              <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">Privacy policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
