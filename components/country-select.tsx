'use client'

import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COUNTRIES } from '@/lib/countries'
import { cn } from '@/lib/utils'

interface CountrySelectProps {
  value?: string
  defaultValue?: string
  onValueChange: (value: string) => void
  disabled?: boolean
  className?: string
  triggerClassName?: string
  placeholder?: string
}

export function CountrySelect({
  value,
  defaultValue,
  onValueChange,
  disabled,
  triggerClassName,
  placeholder = 'Select Country',
}: CountrySelectProps) {
  return (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          'w-full h-12 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-medium focus:ring-1 focus:ring-slate-900',
          triggerClassName
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72 rounded-xl">
        {COUNTRIES.map((country) => (
          <SelectItem key={country.code} value={country.code.toLowerCase()}>
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
