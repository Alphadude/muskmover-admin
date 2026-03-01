'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const authToken = sessionStorage.getItem('authToken')
    if (authToken) {
      router.push('/dashboard')
    } else {
      router.push('/auth/login')
    }
  }, [router])

  return null
}
