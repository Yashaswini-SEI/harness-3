import { Card, Text, IconV2, StatusBadge } from '@harnessio/ui/components'

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
  periodLabel?: string
}

export function InsightMetricCard({
  label,
  value,
  subtitle,
  trend,
  description,
  badge,
  infoTooltip,
  noData,
  periodLabel,
}: InsightMetricCardProps) {
  return (
    <Card.Root size="sm">
      <Card.Content className="flex flex-col gap-2">
        {/* Top row: label + badge */}
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
          {badge && (
            <StatusBadge variant="outline" theme="muted" size="sm">{badge}</StatusBadge>
          )}
        </div>
        {/* Middle: value + subtitle + trend */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-foreground-1 font-semibold" style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, lineHeight: 1 }}>
              {value}
            </span>
            {subtitle && <Text variant="body-normal" color="foreground-3">{subtitle}</Text>}
          </div>
          {!noData && trend && (
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xs ${trend.includes('↓') || trend.includes('↘') ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                {trend}
              </span>
              {periodLabel && <span className="text-xs text-cn-foreground-6">{periodLabel}</span>}
            </div>
          )}
        </div>
        {/* Bottom: description or no data */}
        {noData ? (
          <Text variant="caption-normal" color="foreground-4">No data available for the selected time period</Text>
        ) : description ? (
          <Text variant="caption-normal" color="foreground-3">{description}</Text>
        ) : null}
      </Card.Content>
    </Card.Root>
  )
}
