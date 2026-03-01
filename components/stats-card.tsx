import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  variant?: 'default' | 'accent' | 'secondary'
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = 'default',
}: StatsCardProps) {
  const bgVariants = {
    default: 'bg-card',
    accent: 'bg-accent/10',
    secondary: 'bg-secondary/10',
  }

  const textVariants = {
    default: 'text-foreground',
    accent: 'text-accent',
    secondary: 'text-secondary',
  }

  return (
    <div
      className={`${bgVariants[variant]} rounded-2xl border border-border p-6 flex flex-col justify-between h-full shadow-soft transition-all hover:shadow-md hover:-translate-y-1 duration-300 glass`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {description && (
            <p className="text-xs font-medium text-muted-foreground/70">
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`${textVariants[variant]} p-3 rounded-xl bg-white shadow-sm border border-border/10`}
          >
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 mt-5">
          <div
            className={`flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
              trend.direction === "up"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {trend.value}%
          </div>
          <span className="text-xs font-medium text-muted-foreground/60">
            vs last month
          </span>
        </div>
      )}
    </div>
  );
}
