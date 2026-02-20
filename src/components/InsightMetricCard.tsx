import { Text, IconV2, StatusBadge } from '@harnessio/ui/components'

const BADGE_THEME_MAP: Record<string, 'info' | 'success' | 'merged' | 'warning' | 'danger' | 'muted'> = {
  Work: 'info',
  Delivery: 'success',
  Analysis: 'merged',
  Elite: 'success',
  High: 'info',
  Medium: 'warning',
  Low: 'danger',
}

export interface InsightMetricCardProps {
  label: string
  value: string
  subtitle?: string
  trend?: string
  trendPositive?: boolean
  description?: string
  badge?: string
  infoTooltip?: string
  noData?: boolean
}

export function InsightMetricCard({
  label,
  value,
  subtitle,
  trend,
  trendPositive,
  description,
  badge,
  infoTooltip,
  noData,
}: InsightMetricCardProps) {
  const badgeTheme = badge ? (BADGE_THEME_MAP[badge] ?? 'muted') : null

  return (
    <div className="flex flex-col gap-2 rounded-cn-2 border border-borders-2 bg-white p-5 dark:bg-cn-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Text variant="caption-normal" color="foreground-3">{label}</Text>
          {infoTooltip && (
            <div className="group/tip relative">
              <IconV2 name="info-circle" size="xs" className="cursor-help text-foreground-4" />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover/tip:pointer-events-auto group-hover/tip:opacity-100">
                <div className="w-72 rounded-lg border border-borders-2 bg-cn-0 px-4 py-3 text-xs text-foreground-2 shadow-lg">
                  {infoTooltip}
                </div>
              </div>
            </div>
          )}
        </div>
        {badge && badgeTheme && (
          <StatusBadge variant="outline" theme={badgeTheme} size="sm">{badge}</StatusBadge>
        )}
      </div>
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-foreground-1 font-semibold" style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, lineHeight: 1 }}>
            {value}
          </span>
          {subtitle && <Text variant="body-normal" color="foreground-3">{subtitle}</Text>}
        </div>
        {!noData && trend && (
          <span className={`text-xs ${trendPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {trend}
          </span>
        )}
      </div>
      {noData ? (
        <Text variant="caption-normal" color="foreground-4">No data available for the selected time period</Text>
      ) : description ? (
        <Text variant="caption-normal" color="foreground-3">{description}</Text>
      ) : null}
    </div>
  )
}
