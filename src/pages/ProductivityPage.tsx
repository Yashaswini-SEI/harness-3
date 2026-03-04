import { useState, useMemo } from 'react'
import {
  Text,
  Button,
  Tabs,
  Table,
  DropdownMenu,
  IconV2,
  Pagination,
  CounterBadge,
  Select,
  Card,
} from '@harnessio/ui/components'
import { Nav2 } from '../components/Nav2'
import { StackedBarChart } from '../components/Charts'
import { InsightMetricCard } from '../components/InsightMetricCard'

// ── Deterministic jitter ──

function jitter(seed: string, base: number, variance: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  const t = (Math.abs(h) % 1000) / 1000
  return Math.round(base + (t - 0.5) * 2 * variance)
}

function linearRegression(values: number[]): number[] {
  const n = values.length
  if (n === 0) return []
  const xMean = (n - 1) / 2
  const yMean = values.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean)
    den += (i - xMean) * (i - xMean)
  }
  const slope = den !== 0 ? num / den : 0
  const intercept = yMean - slope * xMean
  return values.map((_, i) => Math.round((slope * i + intercept) * 100) / 100)
}

// ── Chart constants ──

const SMALL_PR_COLOR = 'var(--cn-comp-data-viz-01-blue, lch(65% 56 255))'
const MEDIUM_PR_COLOR = 'var(--cn-comp-data-viz-02-purple, lch(58% 95 320))'
const LARGE_PR_COLOR = 'var(--cn-comp-data-viz-03-pink, lch(58% 70 350))'

const TIME_RANGE_PROFILES: Record<string, { scale: number; labels: string[] }> = {
  '7D': { scale: 0.12, labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  '1M': { scale: 0.35, labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'] },
  '3M': { scale: 0.55, labels: ['Jan', 'Feb', 'Mar'] },
  '6M': { scale: 0.78, labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
  '12M': { scale: 1, labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
  custom: { scale: 1, labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
}

// ── Export menu ──

function ExportMenu({ variant = 'ghost' }: { variant?: 'ghost' | 'outline' }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant={variant} size="sm" iconOnly ignoreIconOnlyTooltip>
          <IconV2 name="more-horizontal" size="sm" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item title="Export PDF" />
        <DropdownMenu.Item title="Export CSV" />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

// ── Main page ──

export function ProductivityPage() {
  const [timeRange, setTimeRange] = useState('6M')
  const [showTrendline, setShowTrendline] = useState(false)
  const [prDrillPage, setPrDrillPage] = useState(1)
  const [prDrillPageSize, setPrDrillPageSize] = useState(5)
  const [cycleDrillPage, setCycleDrillPage] = useState(1)
  const [cycleDrillPageSize, setCycleDrillPageSize] = useState(5)
  const [selectedCycleBar, setSelectedCycleBar] = useState<number | null>(null)
  const [workDrillPage, setWorkDrillPage] = useState(1)
  const [workDrillPageSize, setWorkDrillPageSize] = useState(5)
  const [selectedWorkBar, setSelectedWorkBar] = useState<number | null>(null)
  const [expandedWorkRows, setExpandedWorkRows] = useState<Set<string>>(new Set())
  const [workTypeFilter, setWorkTypeFilter] = useState('all')
  const [prVelocityView, setPrVelocityView] = useState('work-type')
  const [prCycleView, setPrCycleView] = useState('mean')
  const [showTotalDistribution, setShowTotalDistribution] = useState(false)

  const profile = TIME_RANGE_PROFILES[timeRange] ?? TIME_RANGE_PROFILES['6M']

  const [expandedDevRows, setExpandedDevRows] = useState<Set<string>>(new Set())

  const WORK_TYPES = ['Story', 'Bug', 'Task', 'Story', 'Story', 'Bug', 'Task', 'Story']
  const STATUSES = ['Merged', 'Merged', 'Open', 'Merged', 'Merged']

  function generatePrSubtable(devName: string, prCount: number) {
    const rows = []
    for (let p = 0; p < prCount; p++) {
      const prNum = Math.abs(jitter(`${devName}-prid-${p}`, 4500, 3000))
      const workNum = Math.abs(jitter(`${devName}-wid-${p}`, 28000, 5000))
      const wtIdx = Math.abs(jitter(`${devName}-wt-${p}`, 0, 100)) % WORK_TYPES.length
      const stIdx = Math.abs(jitter(`${devName}-st-${p}`, 0, 100)) % STATUSES.length
      const createdDay = Math.min(28, Math.max(1, Math.abs(jitter(`${devName}-cd-${p}`, 15, 12))))
      const mergedDay = Math.min(28, Math.max(createdDay + 1, createdDay + Math.abs(jitter(`${devName}-md-${p}`, 5, 4))))
      const additions = Math.max(1, Math.abs(jitter(`${devName}-add-${p}`, 80, 75)))
      const deletions = Math.max(0, Math.abs(jitter(`${devName}-del-${p}`, 25, 22)))
      rows.push({
        prId: `PR-${prNum}`,
        workId: `CCM-${workNum}`,
        workType: WORK_TYPES[wtIdx],
        status: STATUSES[stIdx],
        prCreated: `2026-01-${String(createdDay).padStart(2, '0')} ${String(8 + (p % 10)).padStart(2, '0')}:${String(Math.abs(jitter(`${devName}-cm-${p}`, 30, 28))).padStart(2, '0')}`,
        prMerged: STATUSES[stIdx] === 'Open' ? '' : `2026-01-${String(Math.min(mergedDay, 28)).padStart(2, '0')} ${String(10 + (p % 8)).padStart(2, '0')}:${String(Math.abs(jitter(`${devName}-mm-${p}`, 30, 28))).padStart(2, '0')}`,
        additions,
        deletions,
        totalLines: additions + deletions,
      })
    }
    return rows
  }
  const toggleDevRow = (name: string) => {
    setExpandedDevRows(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const PR_DRILL_POOL = useMemo(() => [
    { name: 'c_jyoti patel', prs: 7, workTypes: { bug: 0, story: 7, task: 0, other: 0 }, prSizes: { small: 0, medium: 4, large: 3 }, avgTimeToMerge: '6d 18h', totalLines: 14191, additions: 12892, deletions: 1299 },
    { name: 'c_rahul sharma', prs: 12, workTypes: { bug: 2, story: 8, task: 1, other: 1 }, prSizes: { small: 3, medium: 6, large: 3 }, avgTimeToMerge: '4d 6h', totalLines: 8450, additions: 7200, deletions: 1250 },
    { name: 'c_anita desai', prs: 5, workTypes: { bug: 1, story: 3, task: 1, other: 0 }, prSizes: { small: 2, medium: 2, large: 1 }, avgTimeToMerge: '3d 12h', totalLines: 5320, additions: 4800, deletions: 520 },
    { name: 'c_vikram singh', prs: 15, workTypes: { bug: 3, story: 9, task: 2, other: 1 }, prSizes: { small: 5, medium: 7, large: 3 }, avgTimeToMerge: '5d 4h', totalLines: 18900, additions: 16500, deletions: 2400 },
    { name: 'c_priya menon', prs: 9, workTypes: { bug: 0, story: 6, task: 3, other: 0 }, prSizes: { small: 4, medium: 3, large: 2 }, avgTimeToMerge: '2d 22h', totalLines: 6780, additions: 5900, deletions: 880 },
    { name: 'c_amit kumar', prs: 3, workTypes: { bug: 1, story: 1, task: 0, other: 1 }, prSizes: { small: 1, medium: 1, large: 1 }, avgTimeToMerge: '8d 2h', totalLines: 22400, additions: 19800, deletions: 2600 },
    { name: 'c_sneha reddy', prs: 11, workTypes: { bug: 2, story: 7, task: 2, other: 0 }, prSizes: { small: 6, medium: 3, large: 2 }, avgTimeToMerge: '3d 8h', totalLines: 7100, additions: 6300, deletions: 800 },
    { name: 'c_deepak joshi', prs: 8, workTypes: { bug: 1, story: 5, task: 1, other: 1 }, prSizes: { small: 2, medium: 4, large: 2 }, avgTimeToMerge: '5d 14h', totalLines: 11200, additions: 9800, deletions: 1400 },
    { name: 'c_kavita nair', prs: 6, workTypes: { bug: 0, story: 4, task: 2, other: 0 }, prSizes: { small: 3, medium: 2, large: 1 }, avgTimeToMerge: '4d 1h', totalLines: 4500, additions: 3900, deletions: 600 },
    { name: 'c_ravi patel', prs: 14, workTypes: { bug: 4, story: 8, task: 1, other: 1 }, prSizes: { small: 4, medium: 6, large: 4 }, avgTimeToMerge: '7d 5h', totalLines: 25600, additions: 22100, deletions: 3500 },
  ], [])

  const paginatedPrDrill = useMemo(() => {
    const start = (prDrillPage - 1) * prDrillPageSize
    return PR_DRILL_POOL.slice(start, start + prDrillPageSize)
  }, [PR_DRILL_POOL, prDrillPage, prDrillPageSize])

  const CYCLE_DRILL_POOL = useMemo(() => [
    { prId: '623', title: '[feat]: [SEI-...', author: 'c_jyoti patel', repository: 'l7B_kbSEQD2...', firstCommitAt: '2026-01-09', createdAt: '2026-01-10', mergedAt: '2026-01-28', cycleTime: '19d 11h', firstReview: '9d 15h', approval: '0', reviewer: 'harshit trivedi', totalLines: 13733, additions: 12589, deletions: 1144 },
    { prId: '618', title: '[fix]: [SEI-4...', author: 'c_rahul sharma', repository: 'l7B_kbSEQD2...', firstCommitAt: '2026-01-06', createdAt: '2026-01-07', mergedAt: '2026-01-22', cycleTime: '16d 8h', firstReview: '5d 2h', approval: '1', reviewer: 'sahildeep singh', totalLines: 8450, additions: 7200, deletions: 1250 },
    { prId: '612', title: '[chore]: [SEI...', author: 'c_anita desai', repository: 'harness-core', firstCommitAt: '2026-01-03', createdAt: '2026-01-04', mergedAt: '2026-01-15', cycleTime: '12d 4h', firstReview: '3d 18h', approval: '2', reviewer: 'rajarshee chatterjee', totalLines: 5320, additions: 4800, deletions: 520 },
    { prId: '607', title: '[feat]: [SEI-...', author: 'c_vikram singh', repository: 'l7B_kbSEQD2...', firstCommitAt: '2025-12-28', createdAt: '2025-12-29', mergedAt: '2026-01-18', cycleTime: '21d 6h', firstReview: '7d 12h', approval: '0', reviewer: 'sumit kumar', totalLines: 18900, additions: 16500, deletions: 2400 },
    { prId: '601', title: '[fix]: [SEI-3...', author: 'c_priya menon', repository: 'harness-core', firstCommitAt: '2025-12-22', createdAt: '2025-12-23', mergedAt: '2026-01-08', cycleTime: '16d 14h', firstReview: '4d 6h', approval: '1', reviewer: 'harshit trivedi', totalLines: 6780, additions: 5900, deletions: 880 },
    { prId: '595', title: '[feat]: [SEI-...', author: 'c_amit kumar', repository: 'l7B_kbSEQD2...', firstCommitAt: '2025-12-18', createdAt: '2025-12-19', mergedAt: '2026-01-12', cycleTime: '24d 2h', firstReview: '11d 8h', approval: '0', reviewer: 'sahildeep singh', totalLines: 22400, additions: 19800, deletions: 2600 },
    { prId: '589', title: '[fix]: [SEI-2...', author: 'c_sneha reddy', repository: 'harness-core', firstCommitAt: '2025-12-15', createdAt: '2025-12-16', mergedAt: '2025-12-30', cycleTime: '14d 18h', firstReview: '2d 22h', approval: '3', reviewer: 'rajarshee chatterjee', totalLines: 7100, additions: 6300, deletions: 800 },
    { prId: '583', title: '[chore]: [SEI...', author: 'c_deepak joshi', repository: 'l7B_kbSEQD2...', firstCommitAt: '2025-12-10', createdAt: '2025-12-11', mergedAt: '2025-12-28', cycleTime: '17d 10h', firstReview: '6d 4h', approval: '1', reviewer: 'sumit kumar', totalLines: 11200, additions: 9800, deletions: 1400 },
    { prId: '577', title: '[feat]: [SEI-...', author: 'c_kavita nair', repository: 'harness-core', firstCommitAt: '2025-12-06', createdAt: '2025-12-07', mergedAt: '2025-12-22', cycleTime: '15d 5h', firstReview: '4d 14h', approval: '2', reviewer: 'harshit trivedi', totalLines: 4500, additions: 3900, deletions: 600 },
    { prId: '571', title: '[fix]: [SEI-1...', author: 'c_ravi patel', repository: 'l7B_kbSEQD2...', firstCommitAt: '2025-12-01', createdAt: '2025-12-02', mergedAt: '2025-12-24', cycleTime: '22d 8h', firstReview: '8d 20h', approval: '0', reviewer: 'sahildeep singh', totalLines: 25600, additions: 22100, deletions: 3500 },
  ], [])

  const handleCycleBarClick = (index: number) => {
    setSelectedCycleBar(prev => prev === index ? null : index)
    setCycleDrillPage(1)
  }

  function seededShuffle<T>(arr: T[], seed: number): T[] {
    const out = [...arr]
    let s = Math.abs(seed) || 1
    for (let i = out.length - 1; i > 0; i--) {
      s = (s * 16807 + 0) % 2147483647
      const j = s % (i + 1)
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }

  const cycleDrilldownData = useMemo(
    () => seededShuffle(CYCLE_DRILL_POOL, selectedCycleBar != null ? (selectedCycleBar + 1) * 7331 : 1),
    [selectedCycleBar, CYCLE_DRILL_POOL]
  )

  const paginatedCycleDrill = useMemo(() => {
    const start = (cycleDrillPage - 1) * cycleDrillPageSize
    return cycleDrilldownData.slice(start, start + cycleDrillPageSize)
  }, [cycleDrilldownData, cycleDrillPage, cycleDrillPageSize])

  // ── Work Completed Per Dev ──
  const workCompletedData = useMemo(() => {
    const raw = profile.labels.map((name, i) => ({
      name,
      minor: jitter(`work-minor-${name}${i}`, Math.round(8 * profile.scale), 4),
      major: jitter(`work-major-${name}${i}`, Math.round(15 * profile.scale), 6),
      critical: jitter(`work-crit-${name}${i}`, Math.round(5 * profile.scale), 3),
      other: jitter(`work-other-${name}${i}`, Math.round(4 * profile.scale), 2),
    }))
    const maxTotal = Math.max(...raw.map(d => d.minor + d.major + d.critical + d.other))
    const gap = Math.max(1, Math.round(maxTotal * 0.015))
    return raw.map(d => ({ ...d, _gap: gap }))
  }, [profile])

  const ALL_WORK_SERIES = [
    { dataKey: 'minor', name: 'Minor', color: 'var(--cn-comp-data-viz-01-blue, lch(65% 56 255))' },
    { dataKey: 'major', name: 'Major', color: 'var(--cn-comp-data-viz-02-purple, lch(58% 95 320))' },
    { dataKey: 'critical', name: 'Critical', color: 'var(--cn-comp-data-viz-03-pink, lch(58% 70 350))' },
    { dataKey: 'other', name: 'Other', color: 'var(--cn-comp-data-viz-04-green, lch(56% 78 125))' },
  ]

  const WORK_SERIES = workTypeFilter === 'all'
    ? ALL_WORK_SERIES
    : ALL_WORK_SERIES.filter(s => s.dataKey === workTypeFilter)

  const handleWorkBarClick = (index: number) => {
    setSelectedWorkBar(prev => prev === index ? null : index)
    setWorkDrillPage(1)
  }

  const toggleWorkRow = (name: string) => {
    setExpandedWorkRows(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const WORK_DRILL_POOL = useMemo(() => [
    { name: 'c_jyoti patel', completed: 24, workTypes: { bug: 3, story: 15, task: 4, other: 2 }, avgTimeToComplete: '6d 18h' },
    { name: 'c_rahul sharma', completed: 31, workTypes: { bug: 5, story: 20, task: 3, other: 3 }, avgTimeToComplete: '4d 6h' },
    { name: 'c_anita desai', completed: 18, workTypes: { bug: 2, story: 12, task: 3, other: 1 }, avgTimeToComplete: '8d 2h' },
    { name: 'c_vikram singh', completed: 42, workTypes: { bug: 8, story: 25, task: 6, other: 3 }, avgTimeToComplete: '3d 14h' },
    { name: 'c_priya menon', completed: 27, workTypes: { bug: 4, story: 18, task: 3, other: 2 }, avgTimeToComplete: '5d 8h' },
    { name: 'c_amit kumar', completed: 15, workTypes: { bug: 1, story: 10, task: 2, other: 2 }, avgTimeToComplete: '9d 4h' },
    { name: 'c_sneha reddy', completed: 33, workTypes: { bug: 6, story: 21, task: 4, other: 2 }, avgTimeToComplete: '4d 22h' },
    { name: 'c_deepak joshi', completed: 22, workTypes: { bug: 3, story: 14, task: 3, other: 2 }, avgTimeToComplete: '7d 10h' },
    { name: 'c_kavita nair', completed: 19, workTypes: { bug: 2, story: 13, task: 2, other: 2 }, avgTimeToComplete: '6d 1h' },
    { name: 'c_ravi patel', completed: 38, workTypes: { bug: 7, story: 24, task: 5, other: 2 }, avgTimeToComplete: '3d 20h' },
  ], [])

  const workDrilldownData = useMemo(
    () => seededShuffle(WORK_DRILL_POOL, selectedWorkBar != null ? (selectedWorkBar + 1) * 8831 : 1),
    [selectedWorkBar, WORK_DRILL_POOL]
  )

  const paginatedWorkDrill = useMemo(() => {
    const start = (workDrillPage - 1) * workDrillPageSize
    return workDrilldownData.slice(start, start + workDrillPageSize)
  }, [workDrilldownData, workDrillPage, workDrillPageSize])

  // ── Coding Days Per Dev ──
  const codingDaysData = useMemo(() => {
    return profile.labels.map((name, i) => ({
      name,
      codingDays: Math.round((jitter(`cd-${name}${i}`, Math.round(3.5 * profile.scale * 10), 15)) / 10 * 10) / 10,
    }))
  }, [profile])

  const CODING_DAYS_SERIES = [
    { dataKey: 'codingDays', name: 'Coding Days', color: 'var(--cn-comp-data-viz-01-blue, lch(65% 56 255))' },
  ]

  // ── Number of Comments Per PR ──
  const commentsPerPrData = useMemo(() => {
    return profile.labels.map((name, i) => ({
      name,
      comments: jitter(`cpr-${name}${i}`, Math.round(6 * profile.scale), 3),
    }))
  }, [profile])

  const COMMENTS_SERIES = [
    { dataKey: 'comments', name: 'Comments', color: 'var(--cn-comp-data-viz-02-purple, lch(58% 95 320))' },
  ]

  // ── Average Time to First Comment ──
  const timeToFirstCommentData = useMemo(() => {
    return profile.labels.map((name, i) => ({
      name,
      hours: jitter(`ttfc-dev-${name}${i}`, Math.round(18 * profile.scale), 8),
    }))
  }, [profile])

  const TTFC_SERIES = [
    { dataKey: 'hours', name: 'Hours to First Comment', color: 'var(--cn-comp-data-viz-03-pink, lch(58% 70 350))' },
  ]

  // ── Code Rework ──
  const [reworkDrillPage, setReworkDrillPage] = useState(1)
  const [reworkDrillPageSize, setReworkDrillPageSize] = useState(5)
  const [selectedReworkBar, setSelectedReworkBar] = useState<number | null>(null)

  const codeReworkData = useMemo(() => {
    return profile.labels.map((name, i) => ({
      name,
      legacyRework: jitter(`rw-legacy-${name}${i}`, Math.round(12 * profile.scale), 6),
      recentRework: jitter(`rw-recent-${name}${i}`, Math.round(8 * profile.scale), 4),
    }))
  }, [profile])

  const REWORK_SERIES = [
    { dataKey: 'legacyRework', name: 'Legacy Rework', color: 'var(--cn-comp-data-viz-01-blue, lch(65% 56 255))' },
    { dataKey: 'recentRework', name: 'Recent Rework', color: 'var(--cn-comp-data-viz-02-purple, lch(58% 95 320))' },
  ]

  const handleReworkBarClick = (index: number) => {
    setSelectedReworkBar(prev => prev === index ? null : index)
    setReworkDrillPage(1)
  }

  const REWORK_DRILL_POOL = useMemo(() => [
    { developer: 'c_jyoti patel', rework: '18.5%', legacyRework: '12.3%', recentRework: '6.2%', totalRework: 245, legacyReworkLines: 163, recentReworkLines: 82, totalLines: 14191, linesAdded: 12892, linesDeleted: 1299 },
    { developer: 'c_rahul sharma', rework: '14.2%', legacyRework: '9.1%', recentRework: '5.1%', totalRework: 188, legacyReworkLines: 120, recentReworkLines: 68, totalLines: 8450, linesAdded: 7200, linesDeleted: 1250 },
    { developer: 'c_anita desai', rework: '22.1%', legacyRework: '15.8%', recentRework: '6.3%', totalRework: 310, legacyReworkLines: 222, recentReworkLines: 88, totalLines: 5320, linesAdded: 4800, linesDeleted: 520 },
    { developer: 'c_vikram singh', rework: '11.8%', legacyRework: '7.4%', recentRework: '4.4%', totalRework: 156, legacyReworkLines: 98, recentReworkLines: 58, totalLines: 18900, linesAdded: 16500, linesDeleted: 2400 },
    { developer: 'c_priya menon', rework: '16.7%', legacyRework: '10.2%', recentRework: '6.5%', totalRework: 221, legacyReworkLines: 135, recentReworkLines: 86, totalLines: 6780, linesAdded: 5900, linesDeleted: 880 },
    { developer: 'c_amit kumar', rework: '25.3%', legacyRework: '18.1%', recentRework: '7.2%', totalRework: 335, legacyReworkLines: 240, recentReworkLines: 95, totalLines: 22400, linesAdded: 19800, linesDeleted: 2600 },
    { developer: 'c_sneha reddy', rework: '13.5%', legacyRework: '8.6%', recentRework: '4.9%', totalRework: 179, legacyReworkLines: 114, recentReworkLines: 65, totalLines: 7100, linesAdded: 6300, linesDeleted: 800 },
    { developer: 'c_deepak joshi', rework: '19.8%', legacyRework: '13.4%', recentRework: '6.4%', totalRework: 262, legacyReworkLines: 178, recentReworkLines: 84, totalLines: 11200, linesAdded: 9800, linesDeleted: 1400 },
    { developer: 'c_kavita nair', rework: '15.9%', legacyRework: '10.8%', recentRework: '5.1%', totalRework: 210, legacyReworkLines: 143, recentReworkLines: 67, totalLines: 4500, linesAdded: 3900, linesDeleted: 600 },
    { developer: 'c_ravi patel', rework: '20.6%', legacyRework: '14.2%', recentRework: '6.4%', totalRework: 273, legacyReworkLines: 188, recentReworkLines: 85, totalLines: 25600, linesAdded: 22100, linesDeleted: 3500 },
  ], [])

  const reworkDrilldownData = useMemo(
    () => seededShuffle(REWORK_DRILL_POOL, selectedReworkBar != null ? (selectedReworkBar + 1) * 9241 : 1),
    [selectedReworkBar, REWORK_DRILL_POOL]
  )

  const paginatedReworkDrill = useMemo(() => {
    const start = (reworkDrillPage - 1) * reworkDrillPageSize
    return reworkDrilldownData.slice(start, start + reworkDrillPageSize)
  }, [reworkDrilldownData, reworkDrillPage, reworkDrillPageSize])

  // ── PR Velocity chart data ──
  const prVelocityData = useMemo(() => {
    const raw = profile.labels.map((name, i) => ({
      name,
      smallPRs: jitter(`small-${name}${i}`, Math.round(12 * profile.scale), 5),
      mediumPRs: jitter(`med-${name}${i}`, Math.round(8 * profile.scale), 4),
      largePRs: jitter(`large-${name}${i}`, Math.round(4 * profile.scale), 3),
    }))
    const maxTotal = Math.max(...raw.map(d => d.smallPRs + d.mediumPRs + d.largePRs))
    const gap = Math.max(1, Math.round(maxTotal * 0.015))
    const totals = raw.map(d => d.smallPRs + d.mediumPRs + d.largePRs)
    const regression = linearRegression(totals)
    return raw.map((d, i) => ({ ...d, _gap: gap, _trend: regression[i] }))
  }, [profile])

  const CYCLE_COLORS = {
    prCreation: 'var(--cn-comp-data-viz-01-blue, lch(65% 56 255))',
    timeToComment: 'var(--cn-comp-data-viz-02-purple, lch(58% 95 320))',
    approvalTime: 'var(--cn-comp-data-viz-03-pink, lch(58% 70 350))',
    mergeTime: 'var(--cn-comp-data-viz-04-green, lch(56% 78 125))',
  }

  const CYCLE_SERIES = [
    { dataKey: 'prCreation', name: 'PR Creation', color: CYCLE_COLORS.prCreation },
    { dataKey: 'timeToComment', name: 'First Comment', color: CYCLE_COLORS.timeToComment },
    { dataKey: 'approvalTime', name: 'Approval', color: CYCLE_COLORS.approvalTime },
    { dataKey: 'mergeTime', name: 'Merge', color: CYCLE_COLORS.mergeTime },
  ]

  const cycleData = useMemo(() => {
    return profile.labels.map((name, i) => {
      const prCreation = jitter(`cyc-create-${name}${i}`, Math.round(8 * profile.scale), 4)
      const timeToComment = jitter(`cyc-comment-${name}${i}`, Math.round(20 * profile.scale), 8)
      const approvalTime = jitter(`cyc-approve-${name}${i}`, Math.round(30 * profile.scale), 12)
      const mergeTime = jitter(`cyc-merge-${name}${i}`, Math.round(6 * profile.scale), 3)
      const maxTotal = prCreation + timeToComment + approvalTime + mergeTime
      const gap = Math.max(1, Math.round(maxTotal * 0.015))
      return { name, prCreation, timeToComment, approvalTime, mergeTime, _gap: gap }
    })
  }, [profile])

  const PR_SERIES = [
    { dataKey: 'smallPRs', name: 'Small PRs', color: SMALL_PR_COLOR },
    { dataKey: 'mediumPRs', name: 'Medium PRs', color: MEDIUM_PR_COLOR },
    { dataKey: 'largePRs', name: 'Large PRs', color: LARGE_PR_COLOR },
  ]

  return (


    <Nav2 activeSection="insights">

      <div className="flex flex-1 flex-col gap-5 overflow-auto px-5 pb-5 pt-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <Text as="h1" variant="heading-hero" color="foreground-1">Productivity</Text>
            <Text variant="body-normal" color="foreground-3">
              Measure and supercharge dev productivity.
            </Text>
          </div>
          <div className="flex items-center gap-3">
            <ExportMenu variant="outline" />
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-10">
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Created:</Text>
            <Text variant="body-normal" color="foreground-1">05 Jan 2026, 11:00am</Text>
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Updated:</Text>
            <Text variant="body-normal" color="foreground-1">19 Feb 2026, 03:45pm</Text>
          </div>
          <div className="flex flex-col gap-1">
            <Text variant="body-normal" color="foreground-3">Team:</Text>
            <Text variant="body-normal" color="foreground-1">Harness SEI / Arvind Srinivaaolu / Abdul Asheem</Text>
          </div>
        </div>

        {/* Time range tabs + trendline */}
        <div className="flex items-center gap-3">
          <Tabs.Root value={timeRange} onValueChange={setTimeRange}>
            <Tabs.List variant="outlined">
              <Tabs.Trigger value="7D">7D</Tabs.Trigger>
              <Tabs.Trigger value="1M">1M</Tabs.Trigger>
              <Tabs.Trigger value="3M">3M</Tabs.Trigger>
              <Tabs.Trigger value="6M">6M</Tabs.Trigger>
              <Tabs.Trigger value="12M">12M</Tabs.Trigger>
              <Tabs.Trigger value="custom" icon="calendar">Custom</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTrendline(!showTrendline)}
            >
              {showTrendline ? 'Hide Trendline' : 'Show Trendline'}
            </Button>
          </div>
        </div>

        {/* PR Velocity Per Dev */}
        <Card.Root className="group/card flex flex-col">
          <div className="flex items-start justify-between p-5 pb-0">
            <Text variant="body-strong" color="foreground-1">PR Velocity Per Dev</Text>
            <div className="flex items-center gap-2">
              <Select
                value={prVelocityView}
                options={[
                  { label: 'Work Type', value: 'work-type' },
                  { label: 'PR Size', value: 'pr-size' },
                ]}
                onChange={(val) => setPrVelocityView(val)}
              />
              <ExportMenu />
            </div>
          </div>

          {/* Metric card */}
          <div className="mx-5 mt-3 w-1/5">
            <InsightMetricCard
              label="PRs"
              value="3.98"
              subtitle="per week"
              trend="↓ 11.67%"
            />
          </div>

          {/* Segmented bar chart */}
          <div className="p-5 pt-3">
            <StackedBarChart
              data={prVelocityData}
              series={PR_SERIES}
              height={300}
              showTrendline={showTrendline}
            />
          </div>

          {/* Drilldown table */}
          <div className="px-5 pb-5 pt-2">
            <div className="flex items-center pb-2">
              <Text variant="body-strong" color="foreground-1">Drill-down</Text>
            </div>
            <div className="overflow-x-auto">
              <Table.Root variant="default" size="normal">
                <Table.Header>
                  <Table.Row>
                    <Table.Head>PR ID</Table.Head>
                    <Table.Head className="text-right">PRs</Table.Head>
                    <Table.Head>Work Types</Table.Head>
                    <Table.Head>PR Sizes</Table.Head>
                    <Table.Head>Average Time to Merge</Table.Head>
                    <Table.Head>Code Changes</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedPrDrill.map((row) => {
                    const addPct = row.totalLines > 0 ? (row.additions / row.totalLines) * 100 : 50
                    const delPct = 100 - addPct
                    return (<>
                    <Table.Row key={row.name} className="cursor-pointer" onClick={() => toggleDevRow(row.name)}>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <IconV2 name={expandedDevRows.has(row.name) ? 'nav-arrow-down' : 'nav-arrow-right'} size="xs" className="text-foreground-4" />
                          <div className="flex shrink-0 items-center justify-center bg-[rgba(0,109,234,0.15)] text-sm font-medium text-[#006DEA]" style={{ width: 28, height: 28, borderRadius: '50%' }}>
                            {row.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <Text variant="body-normal" color="foreground-1" className="whitespace-nowrap">{row.name}</Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-right">{row.prs}</Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1"><Text variant="caption-normal" color="foreground-3">Bug</Text><CounterBadge variant="outline" theme="danger">{row.workTypes.bug}</CounterBadge></div>
                          <div className="flex items-center gap-1"><Text variant="caption-normal" color="foreground-3">Story</Text><CounterBadge variant="outline" theme="info">{row.workTypes.story}</CounterBadge></div>
                          <div className="flex items-center gap-1"><Text variant="caption-normal" color="foreground-3">Task</Text><CounterBadge variant="outline" theme="success">{row.workTypes.task}</CounterBadge></div>
                          <div className="flex items-center gap-1"><Text variant="caption-normal" color="foreground-3">Other</Text><CounterBadge variant="outline" theme="default">{row.workTypes.other}</CounterBadge></div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1"><Text variant="caption-normal" color="foreground-3">Small</Text><CounterBadge variant="outline" theme="default">{row.prSizes.small}</CounterBadge></div>
                          <div className="flex items-center gap-1"><Text variant="caption-normal" color="foreground-3">Medium</Text><CounterBadge variant="outline" theme="default">{row.prSizes.medium}</CounterBadge></div>
                          <div className="flex items-center gap-1"><Text variant="caption-normal" color="foreground-3">Large</Text><CounterBadge variant="outline" theme="default">{row.prSizes.large}</CounterBadge></div>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">{row.avgTimeToMerge}</Table.Cell>
                      <Table.Cell style={{ minWidth: 160 }}>
                        <div className="flex flex-col gap-1">
                          <Text variant="caption-normal" color="foreground-3">{row.totalLines.toLocaleString()} lines</Text>
                          <div className="flex h-2 w-full" style={{ gap: 3 }}>
                            <div style={{ width: `${addPct}%`, backgroundColor: '#10B981', borderRadius: 4 }} />
                            <div style={{ width: `${delPct}%`, backgroundColor: '#EF4444', borderRadius: 4 }} />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: '#10B981' }} />
                              <Text variant="caption-normal" color="foreground-3">+{row.additions.toLocaleString()}</Text>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: '#EF4444' }} />
                              <Text variant="caption-normal" color="foreground-3">-{row.deletions.toLocaleString()}</Text>
                            </div>
                          </div>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                    {expandedDevRows.has(row.name) && (
                      <Table.Row>
                        <Table.Cell colSpan={6} className="!p-0">
                          <div className="bg-cn-2 px-8 py-3">
                            <Table.Root variant="default" size="normal">
                              <Table.Header>
                                <Table.Row>
                                  <Table.Head>PR ID</Table.Head>
                                  <Table.Head>Work ID</Table.Head>
                                  <Table.Head>Work Type</Table.Head>
                                  <Table.Head>Status</Table.Head>
                                  <Table.Head>PR Created</Table.Head>
                                  <Table.Head>PR Merged</Table.Head>
                                  <Table.Head>Code Changes</Table.Head>
                                </Table.Row>
                              </Table.Header>
                              <Table.Body>
                                {generatePrSubtable(row.name, row.prs).map((pr) => {
                                  const addPctSub = pr.totalLines > 0 ? (pr.additions / pr.totalLines) * 100 : 50
                                  const delPctSub = 100 - addPctSub
                                  return (
                                    <Table.Row key={pr.prId}>
                                      <Table.Cell>
                                        <span className="text-xs" style={{ color: 'var(--cn-brand, #006DEA)' }}>{pr.prId}</span>
                                      </Table.Cell>
                                      <Table.Cell>
                                        <span className="text-xs" style={{ color: 'var(--cn-brand, #006DEA)' }}>{pr.workId}</span>
                                      </Table.Cell>
                                      <Table.Cell>
                                        <CounterBadge variant="outline" theme={pr.workType === 'Bug' ? 'danger' : pr.workType === 'Task' ? 'success' : 'info'}>{pr.workType}</CounterBadge>
                                      </Table.Cell>
                                      <Table.Cell>
                                        <CounterBadge variant="outline" theme="default">{pr.status}</CounterBadge>
                                      </Table.Cell>
                                      <Table.Cell className="whitespace-nowrap">
                                        <Text variant="body-normal" color="foreground-3">{pr.prCreated}</Text>
                                      </Table.Cell>
                                      <Table.Cell className="whitespace-nowrap">
                                        {pr.prMerged ? (
                                          <Text variant="body-normal" color="foreground-3">{pr.prMerged}</Text>
                                        ) : (
                                          <Text variant="body-normal" color="foreground-4">—</Text>
                                        )}
                                      </Table.Cell>
                                      <Table.Cell style={{ minWidth: 140 }}>
                                        <div className="flex flex-col gap-1">
                                          <Text variant="caption-normal" color="foreground-3">{pr.totalLines} lines</Text>
                                          <div className="flex h-2 w-full" style={{ gap: 3 }}>
                                            <div style={{ width: `${addPctSub}%`, backgroundColor: '#10B981', borderRadius: 4 }} />
                                            <div style={{ width: `${delPctSub}%`, backgroundColor: '#EF4444', borderRadius: 4 }} />
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                              <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: '#10B981' }} />
                                              <Text variant="caption-normal" color="foreground-3">+{pr.additions}</Text>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: '#EF4444' }} />
                                              <Text variant="caption-normal" color="foreground-3">-{pr.deletions}</Text>
                                            </div>
                                          </div>
                                        </div>
                                      </Table.Cell>
                                    </Table.Row>
                                  )
                                })}
                              </Table.Body>
                            </Table.Root>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    )}
                    </>)
                  })}
                </Table.Body>
              </Table.Root>
            </div>
            <div className="rounded-b-cn-2 border border-t-0 border-borders-2 px-4 pb-3 pt-0.5">
              <Pagination
                totalItems={PR_DRILL_POOL.length}
                pageSize={prDrillPageSize}
                currentPage={prDrillPage}
                goToPage={setPrDrillPage}
                onPageSizeChange={(size) => { setPrDrillPageSize(size); setPrDrillPage(1) }}
                pageSizeOptions={[5, 10, 20]}
                className="!mt-cn-sm"
              />
            </div>
          </div>
        </Card.Root>

        {/* PR Cycle Time */}
        <Card.Root className="group/card flex flex-col">
          <div className="flex items-start justify-between p-5 pb-0">
            <Text variant="body-strong" color="foreground-1">PR Cycle Time</Text>
            <div className="flex items-center gap-2">
              <Select
                value={prCycleView}
                options={[
                  { label: 'Mean', value: 'mean' },
                  { label: 'Median', value: 'median' },
                  { label: 'P90', value: 'p90' },
                  { label: 'P95', value: 'p95' },
                ]}
                onChange={(val) => setPrCycleView(val)}
              />
              <ExportMenu />
            </div>
          </div>

          {/* Segmented bar chart */}
          <div className="p-5 pt-3">
            <StackedBarChart
              data={cycleData}
              series={CYCLE_SERIES}
              height={300}
              yAxisLabel="Hours"
              onBarClick={handleCycleBarClick}
              selectedIndex={selectedCycleBar}
              showTrendline={showTrendline}
            />
          </div>

          {/* Average cycle time horizontal bar */}
          <div className="mx-5 mb-5 rounded-lg bg-cn-2 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Text variant="body-normal" color="foreground-1" className="font-semibold">3d 8h</Text>
                <Text variant="body-normal" color="foreground-3">(Average)</Text>
                <span className="text-xs text-[#10B981]">↘ 22.45%</span>
              </div>
              <Text variant="body-normal" color="foreground-3">127 Total PRs | Last 4 Weeks</Text>
            </div>
            <div className="flex w-full" style={{ gap: 3, height: 22 }}>
              <div style={{ width: '60%', backgroundColor: CYCLE_COLORS.approvalTime, borderRadius: 4 }} className="transition-all" />
              <div style={{ width: '15%', backgroundColor: '#F97066', borderRadius: 4 }} className="transition-all" />
              <div style={{ width: '15%', backgroundColor: CYCLE_COLORS.prCreation, borderRadius: 4 }} className="transition-all" />
              <div style={{ width: '10%', backgroundColor: CYCLE_COLORS.timeToComment, borderRadius: 4 }} className="transition-all" />
            </div>
          </div>

          {/* Cycle time drilldown table */}
          <div className="px-5 pb-5 pt-2">
            <div className="flex items-center pb-2">
              <Text variant="body-strong" color="foreground-1">Drill-down</Text>
              {selectedCycleBar != null && (
                <div className="ml-auto">
                  <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip onClick={() => setSelectedCycleBar(null)}>
                    <IconV2 name="xmark" size="sm" />
                  </Button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <Table.Root variant="default" size="normal">
                <Table.Header>
                  <Table.Row>
                    <Table.Head>PR ID</Table.Head>
                    <Table.Head>Title</Table.Head>
                    <Table.Head>Author</Table.Head>
                    <Table.Head>Repository</Table.Head>
                    <Table.Head>First Commit Created At</Table.Head>
                    <Table.Head>Created At</Table.Head>
                    <Table.Head>Merged At</Table.Head>
                    <Table.Head>Cycle Time</Table.Head>
                    <Table.Head>Reviewers</Table.Head>
                    <Table.Head>Code Changes</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedCycleDrill.map((row) => {
                    const addPct = row.totalLines > 0 ? (row.additions / row.totalLines) * 100 : 50
                    const delPct = 100 - addPct
                    return (
                    <Table.Row key={row.prId}>
                      <Table.Cell>
                        <span className="text-xs" style={{ color: 'var(--cn-brand, #006DEA)' }}>{row.prId}</span>
                      </Table.Cell>
                      <Table.Cell className="max-w-[180px]">
                        <Text variant="body-normal" color="foreground-1" className="truncate">{row.title}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <div className="flex shrink-0 items-center justify-center bg-[rgba(0,109,234,0.15)] text-xs font-medium text-[#006DEA]" style={{ width: 28, height: 28, borderRadius: '50%' }}>
                            {row.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <Text variant="body-normal" color="foreground-1" className="whitespace-nowrap">{row.author}</Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        <Text variant="body-normal" color="foreground-3">{row.repository}</Text>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        <Text variant="body-normal" color="foreground-3">{row.firstCommitAt}</Text>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        <Text variant="body-normal" color="foreground-3">{row.createdAt}</Text>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        <Text variant="body-normal" color="foreground-3">{row.mergedAt}</Text>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">
                        <div className="flex flex-col">
                          <Text variant="body-normal" color="foreground-1">{row.cycleTime}</Text>
                          <Text variant="caption-normal" color="foreground-4">First Review: {row.firstReview}</Text>
                          <Text variant="caption-normal" color="foreground-4">Approval: {row.approval}</Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <div className="flex shrink-0 items-center justify-center bg-[rgba(0,109,234,0.15)] text-xs font-medium text-[#006DEA]" style={{ width: 24, height: 24, borderRadius: '50%' }}>
                            {row.reviewer.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <Text variant="body-normal" color="foreground-1" className="whitespace-nowrap">{row.reviewer}</Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell style={{ minWidth: 160 }}>
                        <div className="flex flex-col gap-1">
                          <Text variant="caption-normal" color="foreground-3">{row.totalLines.toLocaleString()} Total lines</Text>
                          <div className="flex h-2 w-full" style={{ gap: 3 }}>
                            <div style={{ width: `${addPct}%`, backgroundColor: '#10B981', borderRadius: 4 }} />
                            <div style={{ width: `${delPct}%`, backgroundColor: '#EF4444', borderRadius: 4 }} />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: '#10B981' }} />
                              <Text variant="caption-normal" color="foreground-3">+{row.additions.toLocaleString()} ({Math.round(addPct)}%)</Text>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: '#EF4444' }} />
                              <Text variant="caption-normal" color="foreground-3">-{row.deletions.toLocaleString()} ({Math.round(delPct)}%)</Text>
                            </div>
                          </div>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                    )
                  })}
                </Table.Body>
              </Table.Root>
            </div>
            <div className="rounded-b-cn-2 border border-t-0 border-borders-2 px-4 pb-3 pt-0.5">
              <Pagination
                totalItems={cycleDrilldownData.length}
                pageSize={cycleDrillPageSize}
                currentPage={cycleDrillPage}
                goToPage={setCycleDrillPage}
                onPageSizeChange={(size) => { setCycleDrillPageSize(size); setCycleDrillPage(1) }}
                pageSizeOptions={[5, 10, 20]}
                className="!mt-cn-sm"
              />
            </div>
          </div>
        </Card.Root>

        {/* Work Completed Per Dev */}
        <Card.Root className="group/card flex flex-col">
          <div className="flex items-start justify-between p-5 pb-0">
            <Text variant="body-strong" color="foreground-1">Work Completed Per Dev</Text>
            <div className="flex items-center gap-2">
              <Select
                value={workTypeFilter}
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Minor', value: 'minor' },
                  { label: 'Major', value: 'major' },
                  { label: 'Critical', value: 'critical' },
                  { label: 'Other', value: 'other' },
                ]}
                onChange={(val) => setWorkTypeFilter(val)}
              />
              <ExportMenu />
            </div>
          </div>

          <div className="mx-5 mt-3 w-1/5">
            <InsightMetricCard
              label="Tickets"
              value="5.18"
              subtitle="per week"
              trend="↑ 21.6%"
            />
          </div>

          <div className="p-5 pt-3">
            <StackedBarChart
              data={workCompletedData}
              series={WORK_SERIES}
              height={300}
              onBarClick={handleWorkBarClick}
              selectedIndex={selectedWorkBar}
              showTrendline={showTrendline}
            />
          </div>

          {/* Drilldown table */}
          <div className="px-5 pb-5 pt-2">
            <div className="flex items-center pb-2">
              <Text variant="body-strong" color="foreground-1">Drill-down</Text>
              {selectedWorkBar != null && (
                <div className="ml-auto">
                  <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip onClick={() => setSelectedWorkBar(null)}>
                    <IconV2 name="xmark" size="sm" />
                  </Button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <Table.Root variant="default" size="normal">
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Name</Table.Head>
                    <Table.Head className="text-right">Completed</Table.Head>
                    <Table.Head>Work Types</Table.Head>
                    <Table.Head>Average Time to Complete</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedWorkDrill.map((row) => (<>
                    <Table.Row key={row.name} className="cursor-pointer" onClick={() => toggleWorkRow(row.name)}>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <IconV2 name={expandedWorkRows.has(row.name) ? 'nav-arrow-down' : 'nav-arrow-right'} size="xs" className="text-foreground-4" />
                          <div className="flex shrink-0 items-center justify-center bg-[rgba(0,109,234,0.15)] text-xs font-medium text-[#006DEA]" style={{ width: 28, height: 28, borderRadius: '50%' }}>
                            {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <Text variant="body-normal" color="foreground-1" className="whitespace-nowrap">{row.name}</Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        <span className="text-sm" style={{ color: 'var(--cn-brand, #006DEA)' }}>{row.completed}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1"><Text variant="caption-normal" color="foreground-3">Bug</Text><CounterBadge variant="outline" theme="danger">{row.workTypes.bug}</CounterBadge></div>
                          <div className="flex items-center gap-1"><Text variant="caption-normal" color="foreground-3">New Features and Enhancements</Text><CounterBadge variant="outline" theme="info">{row.workTypes.story + row.workTypes.task}</CounterBadge></div>
                          <div className="flex items-center gap-1"><Text variant="caption-normal" color="foreground-3">Other</Text><CounterBadge variant="outline" theme="default">{row.workTypes.other}</CounterBadge></div>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap">{row.avgTimeToComplete}</Table.Cell>
                    </Table.Row>
                    {expandedWorkRows.has(row.name) && (
                      <Table.Row>
                        <Table.Cell colSpan={4} className="!p-0">
                          <div className="bg-cn-2 px-8 py-3">
                            <Table.Root variant="default" size="normal">
                              <Table.Header>
                                <Table.Row>
                                  <Table.Head>Work ID</Table.Head>
                                  <Table.Head>Work Type</Table.Head>
                                  <Table.Head>Status</Table.Head>
                                  <Table.Head>Created</Table.Head>
                                  <Table.Head>Closed</Table.Head>
                                  <Table.Head>Time to Complete</Table.Head>
                                </Table.Row>
                              </Table.Header>
                              <Table.Body>
                                {Array.from({ length: Math.min(5, row.completed) }, (_, k) => {
                                  const wNum = Math.abs(jitter(`${row.name}-wid-${k}`, 28000, 5000))
                                  const types = ['Story', 'Bug', 'Story', 'Story', 'Bug']
                                  const statuses = ['Done', 'Done', 'Done', 'Won\'t Do', 'Done']
                                  const tIdx = Math.abs(jitter(`${row.name}-wt-${k}`, 0, 100)) % types.length
                                  const sIdx = Math.abs(jitter(`${row.name}-ws-${k}`, 0, 100)) % statuses.length
                                  const createdDay = Math.min(28, Math.max(1, Math.abs(jitter(`${row.name}-wcd-${k}`, 10, 8))))
                                  const closedDay = Math.min(28, Math.max(createdDay + 1, createdDay + Math.abs(jitter(`${row.name}-wcl-${k}`, 8, 6))))
                                  const ttc = Math.max(1, Math.abs(jitter(`${row.name}-ttc-${k}`, 5, 4)))
                                  const ttcH = Math.abs(jitter(`${row.name}-ttch-${k}`, 12, 10))
                                  return (
                                    <Table.Row key={k}>
                                      <Table.Cell>
                                        <div className="flex flex-col">
                                          <span className="text-xs" style={{ color: 'var(--cn-brand, #006DEA)' }}>CCM-{wNum}</span>
                                          <Text variant="caption-normal" color="foreground-3" className="truncate" style={{ maxWidth: 200 }}>
                                            {['fix: resolve query timeout in dashboard loader', 'feat: add bulk export endpoint for reports', 'chore: update third-party dependencies', 'fix: handle null pointer in cost calculator', 'feat: implement filter for perspectives'][k % 5]}
                                          </Text>
                                        </div>
                                      </Table.Cell>
                                      <Table.Cell>
                                        <CounterBadge variant="outline" theme={types[tIdx] === 'Bug' ? 'danger' : 'info'}>{types[tIdx]}</CounterBadge>
                                      </Table.Cell>
                                      <Table.Cell>
                                        <CounterBadge variant="outline" theme="default">{statuses[sIdx]}</CounterBadge>
                                      </Table.Cell>
                                      <Table.Cell className="whitespace-nowrap">
                                        <Text variant="body-normal" color="foreground-3">2025-12-{String(createdDay).padStart(2, '0')}</Text>
                                      </Table.Cell>
                                      <Table.Cell className="whitespace-nowrap">
                                        <Text variant="body-normal" color="foreground-3">2026-01-{String(Math.min(closedDay, 28)).padStart(2, '0')}</Text>
                                      </Table.Cell>
                                      <Table.Cell className="whitespace-nowrap">{ttc}d {ttcH}h</Table.Cell>
                                    </Table.Row>
                                  )
                                })}
                              </Table.Body>
                            </Table.Root>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </>))}
                </Table.Body>
              </Table.Root>
            </div>
            <div className="rounded-b-cn-2 border border-t-0 border-borders-2 px-4 pb-3 pt-0.5">
              <Pagination
                totalItems={workDrilldownData.length}
                pageSize={workDrillPageSize}
                currentPage={workDrillPage}
                goToPage={setWorkDrillPage}
                onPageSizeChange={(size) => { setWorkDrillPageSize(size); setWorkDrillPage(1) }}
                pageSizeOptions={[5, 10, 20]}
                className="!mt-cn-sm"
              />
            </div>
          </div>
        </Card.Root>

        {/* Coding Days Per Dev */}
        <Card.Root className="group/card flex flex-col">
          <div className="flex items-start justify-between p-5 pb-0">
            <Text variant="body-strong" color="foreground-1">Coding Days Per Dev</Text>
            <ExportMenu />
          </div>
          <div className="mx-5 mt-3 w-1/5">
            <InsightMetricCard
              label="Coding Days"
              value="2.91"
              subtitle="per week"
              trend="↗ 5.82%"
            />
          </div>
          <div className="p-5 pt-3">
            <StackedBarChart
              data={codingDaysData}
              series={CODING_DAYS_SERIES}
              height={300}
              showTrendline={showTrendline}
              showBarValues
            />
          </div>
        </Card.Root>

        {/* Number of Comments Per PR */}
        <Card.Root className="group/card flex flex-col">
          <div className="flex items-start justify-between p-5 pb-0">
            <Text variant="body-strong" color="foreground-1">Number of Comments Per PR</Text>
            <ExportMenu />
          </div>
          <div className="mx-5 mt-3 w-1/5">
            <InsightMetricCard
              label="Comments Per PR"
              value="1.03"
              trend="↗ 3%"
            />
          </div>
          <div className="p-5 pt-3">
            <StackedBarChart
              data={commentsPerPrData}
              series={COMMENTS_SERIES}
              height={300}
              showTrendline={showTrendline}
              showBarValues
            />
          </div>
        </Card.Root>

        {/* Average Time to First Comment */}
        <Card.Root className="group/card flex flex-col">
          <div className="flex items-start justify-between p-5 pb-0">
            <Text variant="body-strong" color="foreground-1">Average Time to First Comment</Text>
            <ExportMenu />
          </div>
          <div className="mx-5 mt-3 w-1/5">
            <InsightMetricCard
              label="Time to First Comment"
              value="1d 5h"
              trend="↘ 2.03%"
            />
          </div>
          <div className="p-5 pt-3">
            <StackedBarChart
              data={timeToFirstCommentData}
              series={TTFC_SERIES}
              height={300}
              yAxisLabel="Hours"
              showTrendline={showTrendline}
              showBarValues
            />
          </div>
        </Card.Root>

        {/* Code Rework */}
        <Card.Root className="group/card flex flex-col">
          <div className="flex items-start justify-between p-5 pb-0">
            <Text variant="body-strong" color="foreground-1">Code Rework</Text>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTotalDistribution(!showTotalDistribution)}
              >
                {showTotalDistribution ? 'Hide Total Distribution' : 'Show Total Distribution'}
              </Button>
              <ExportMenu />
            </div>
          </div>

          <div className="mx-5 mt-3 w-1/5">
            <InsightMetricCard
              label="Rework"
              value="2.35%"
              subtitle="per week"
              trend="↘ 67.62%"
            />
          </div>

          <div className="p-5 pt-3">
            <StackedBarChart
              data={codeReworkData}
              series={REWORK_SERIES}
              height={300}
              onBarClick={handleReworkBarClick}
              selectedIndex={selectedReworkBar}
              showTrendline={showTrendline}
              showBarValues
            />
          </div>

          {/* Drilldown table */}
          <div className="px-5 pb-5 pt-2">
            <div className="flex items-center pb-2">
              <Text variant="body-strong" color="foreground-1">Drill-down</Text>
              {selectedReworkBar != null && (
                <div className="ml-auto">
                  <Button variant="ghost" size="sm" iconOnly ignoreIconOnlyTooltip onClick={() => setSelectedReworkBar(null)}>
                    <IconV2 name="xmark" size="sm" />
                  </Button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <Table.Root variant="default" size="normal">
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Developer</Table.Head>
                    <Table.Head className="text-right">Rework</Table.Head>
                    <Table.Head className="text-right">Legacy Rework</Table.Head>
                    <Table.Head className="text-right">Recent Rework</Table.Head>
                    <Table.Head className="text-right">Total Rework</Table.Head>
                    <Table.Head className="text-right">Legacy Rework Lines</Table.Head>
                    <Table.Head className="text-right">Recent Rework Lines</Table.Head>
                    <Table.Head>Code Changes</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedReworkDrill.map((row) => (
                    <Table.Row key={row.developer}>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <div className="flex shrink-0 items-center justify-center bg-[rgba(0,109,234,0.15)] text-xs font-medium text-[#006DEA]" style={{ width: 28, height: 28, borderRadius: '50%' }}>
                            {row.developer.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <Text variant="body-normal" color="foreground-1" className="whitespace-nowrap">{row.developer}</Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-right">{row.rework}</Table.Cell>
                      <Table.Cell className="text-right">{row.legacyRework}</Table.Cell>
                      <Table.Cell className="text-right">{row.recentRework}</Table.Cell>
                      <Table.Cell className="text-right font-medium">{row.totalRework}</Table.Cell>
                      <Table.Cell className="text-right">{row.legacyReworkLines.toLocaleString()}</Table.Cell>
                      <Table.Cell className="text-right">{row.recentReworkLines.toLocaleString()}</Table.Cell>
                      <Table.Cell style={{ minWidth: 160 }}>
                        {(() => {
                          const addPct = row.totalLines > 0 ? (row.linesAdded / row.totalLines) * 100 : 50
                          const delPct = 100 - addPct
                          return (
                            <div className="flex flex-col gap-1">
                              <Text variant="caption-normal" color="foreground-3">{row.totalLines.toLocaleString()} Total lines</Text>
                              <div className="flex h-2 w-full" style={{ gap: 3 }}>
                                <div style={{ width: `${addPct}%`, backgroundColor: '#10B981', borderRadius: 4 }} />
                                <div style={{ width: `${delPct}%`, backgroundColor: '#EF4444', borderRadius: 4 }} />
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: '#10B981' }} />
                                  <Text variant="caption-normal" color="foreground-3">+{row.linesAdded.toLocaleString()} ({Math.round(addPct)}%)</Text>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: '#EF4444' }} />
                                  <Text variant="caption-normal" color="foreground-3">-{row.linesDeleted.toLocaleString()} ({Math.round(delPct)}%)</Text>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </div>
            <div className="rounded-b-cn-2 border border-t-0 border-borders-2 px-4 pb-3 pt-0.5">
              <Pagination
                totalItems={reworkDrilldownData.length}
                pageSize={reworkDrillPageSize}
                currentPage={reworkDrillPage}
                goToPage={setReworkDrillPage}
                onPageSizeChange={(size) => { setReworkDrillPageSize(size); setReworkDrillPage(1) }}
                pageSizeOptions={[5, 10, 20]}
                className="!mt-cn-sm"
              />
            </div>
          </div>
        </Card.Root>
      </div>
    </Nav2>
  )
}
