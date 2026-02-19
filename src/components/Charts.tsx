import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  ScatterChart, Scatter,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

// ── Shared types ──

export interface ChartDataPoint {
  name: string
  value: number
}

export interface ChartProps {
  data: ChartDataPoint[]
  height?: number
  seriesName?: string
}

// ── Shared constants ──

const TICK_STYLE = { fontSize: 12, fill: '#6B7280' }
const AXIS_LINE = { stroke: '#E5E7EB' }
const GRID_STROKE = 'var(--cn-border-2, #E5E7EB)'
const TOOLTIP_STYLE = { borderRadius: 8, fontSize: 13 }
const LEGEND_STYLE = { fontSize: 13, paddingTop: 12, fontFamily: "'JetBrains Mono', monospace" }
const BLUE = 'var(--cn-comp-data-viz-01-blue, #2DA6FF)'
const DONUT_COLORS = ['#2DA6FF', '#6366F1', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6']

// ── Shared helpers ──

export const formatYAxis = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(value)
}

const legendFormatter = (value: string) => <span style={{ color: '#4B5563' }}>{value}</span>
const tooltipFormatter = (seriesName: string) => (value: number | undefined) => [(value ?? 0).toLocaleString(), seriesName]
const CHART_MARGIN = { top: 8, right: 16, left: 0, bottom: 0 }

// ── Components ──

export function LineChart2({ data, height = 420, seriesName = 'Count' }: ChartProps) {
  return (
    <>
      <svg width="0" height="0">
        <defs>
          <filter id="line-shadow">
            <feDropShadow dx="0" dy="5" stdDeviation="6.5" floodColor="rgba(41, 173, 255, 0.25)" floodOpacity="1" />
          </filter>
        </defs>
      </svg>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid strokeDasharray="8 6" vertical={false} stroke={GRID_STROKE} />
          <XAxis dataKey="name" tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} />
          <YAxis tickFormatter={formatYAxis} tick={TICK_STYLE} axisLine={false} tickLine={false} width={48} />
          <Tooltip formatter={tooltipFormatter(seriesName)} contentStyle={TOOLTIP_STYLE} />
          <Legend iconType="square" iconSize={10} wrapperStyle={LEGEND_STYLE} formatter={legendFormatter} />
          <Line
            type="monotone"
            dataKey="value"
            name={seriesName}
            stroke={BLUE}
            strokeWidth={2}
            dot={false}
            activeDot={false}
            style={{ filter: 'url(#line-shadow)' }}
            animationDuration={150}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}

export function BarChart2({ data, height = 420, seriesName = 'Count' }: ChartProps) {
  return (
    <>
      <svg width="0" height="0">
        <defs>
          <filter id="bar-shadow">
            <feDropShadow dx="0" dy="5" stdDeviation="6.5" floodColor="rgba(41, 173, 255, 0.25)" floodOpacity="1" />
          </filter>
        </defs>
      </svg>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={CHART_MARGIN} barGap={12}>
          <CartesianGrid strokeDasharray="8 6" vertical={false} stroke={GRID_STROKE} />
          <XAxis dataKey="name" tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} />
          <YAxis tickFormatter={formatYAxis} tick={TICK_STYLE} axisLine={false} tickLine={false} width={48} />
          <Tooltip
            formatter={tooltipFormatter(seriesName)}
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
          />
          <Legend iconType="square" iconSize={10} wrapperStyle={LEGEND_STYLE} formatter={legendFormatter} />
          <Bar
            dataKey="value"
            name={seriesName}
            fill={BLUE}
            radius={[4, 4, 0, 0]}
            barSize={32}
            style={{ filter: 'url(#bar-shadow)' }}
            animationDuration={150}
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}

export function HorizontalBarChart({ data, height = 420, seriesName = 'Count' }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={CHART_MARGIN} barGap={12}>
        <CartesianGrid strokeDasharray="8 6" horizontal={false} stroke={GRID_STROKE} />
        <XAxis type="number" tickFormatter={formatYAxis} tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={TICK_STYLE} axisLine={false} tickLine={false} width={80} />
        <Tooltip
          formatter={tooltipFormatter(seriesName)}
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }}
        />
        <Legend iconType="square" iconSize={10} wrapperStyle={LEGEND_STYLE} formatter={legendFormatter} />
        <Bar dataKey="value" name={seriesName} fill={BLUE} radius={[0, 4, 4, 0]} barSize={16} animationDuration={150} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function AreaChart2({ data, height = 420, seriesName = 'Count' }: ChartProps) {
  return (
    <>
      <svg width="0" height="0">
        <defs>
          <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2DA6FF" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#2DA6FF" stopOpacity={0.02} />
          </linearGradient>
        </defs>
      </svg>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid strokeDasharray="8 6" vertical={false} stroke={GRID_STROKE} />
          <XAxis dataKey="name" tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} />
          <YAxis tickFormatter={formatYAxis} tick={TICK_STYLE} axisLine={false} tickLine={false} width={48} />
          <Tooltip formatter={tooltipFormatter(seriesName)} contentStyle={TOOLTIP_STYLE} />
          <Legend iconType="square" iconSize={10} wrapperStyle={LEGEND_STYLE} formatter={legendFormatter} />
          <Area
            type="monotone"
            dataKey="value"
            name={seriesName}
            stroke="#2DA6FF"
            strokeWidth={2}
            fill="url(#area-gradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#2DA6FF' }}
            animationDuration={150}
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  )
}

export function ScatterChart2({ data, height = 420, seriesName = 'Count' }: ChartProps) {
  const scatterData = data.map((d, i) => ({ x: i + 1, y: d.value, name: d.name }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={CHART_MARGIN}>
        <CartesianGrid strokeDasharray="8 6" stroke={GRID_STROKE} />
        <XAxis type="number" dataKey="x" name="Index" tick={TICK_STYLE} axisLine={AXIS_LINE} tickLine={false} />
        <YAxis type="number" dataKey="y" name={seriesName} tickFormatter={formatYAxis} tick={TICK_STYLE} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          formatter={(value: number | undefined) => (value ?? 0).toLocaleString()}
          contentStyle={TOOLTIP_STYLE}
          cursor={{ strokeDasharray: '4 4' }}
        />
        <Legend iconType="square" iconSize={10} wrapperStyle={LEGEND_STYLE} formatter={legendFormatter} />
        <Scatter name={seriesName} data={scatterData} fill="#8B5CF6" animationDuration={150} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

export function DonutChart({ data, height = 420, seriesName = 'Count' }: ChartProps) {
  return (
    <>
      <svg width="0" height="0">
        <defs>
          {DONUT_COLORS.map((color, i) => (
            <filter key={i} id={`donut-shadow-${i}`}>
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor={color} floodOpacity="0.35" />
            </filter>
          ))}
        </defs>
      </svg>
      <ResponsiveContainer width="100%" height={height} style={{ overflow: 'visible' }}>
        <PieChart style={{ overflow: 'visible' }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            animationDuration={150}
          >
            {data.map((_, index) => {
              const ci = index % DONUT_COLORS.length
              return (
                <Cell key={index} fill={DONUT_COLORS[ci]} style={{ filter: `url(#donut-shadow-${ci})` }} />
              )
            })}
          </Pie>
          <Tooltip formatter={tooltipFormatter(seriesName)} contentStyle={TOOLTIP_STYLE} />
          <Legend iconType="square" iconSize={10} wrapperStyle={LEGEND_STYLE} formatter={legendFormatter} />
        </PieChart>
      </ResponsiveContainer>
    </>
  )
}

export function MetricCard({ data, height = 420, seriesName = 'Total Count' }: ChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="flex flex-col items-center gap-2">
        <span
          className="text-foreground-1"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 64, fontWeight: 600, lineHeight: 1 }}
        >
          {total.toLocaleString()}
        </span>
        <span className="text-sm text-foreground-3">{seriesName}</span>
      </div>
    </div>
  )
}
