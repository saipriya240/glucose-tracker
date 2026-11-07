
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Droplets,
  Info,
  TrendingUp,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { readingsAPI } from '../services/api'

const SLOTS = [
  { value: 'MORNING', label: 'Morning', short: 'Morning' },
  { value: 'AFTER_BREAKFAST', label: 'After breakfast', short: 'Breakfast' },
  { value: 'AFTER_LUNCH', label: 'After lunch', short: 'Lunch' },
  { value: 'AFTER_DINNER', label: 'After dinner', short: 'Dinner' },
]

function getLocalISODate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDateOffset(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatNumber(value) {
  return Number.isFinite(value) ? value.toFixed(1) : '—'
}

function getRangeStatus(value, low, high) {
  if (value < low) return 'Below range'
  if (value > high) return 'Above range'
  return 'Within range'
}

function InsightCard({ icon: Icon, title, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
          <Icon size={19} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  )
}

export default function Insights({ user }) {
  const [readings, setReadings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const targetLow = Number(user?.target_low ?? 70)
  const targetHigh = Number(user?.target_high ?? 180)

  useEffect(() => {
    let cancelled = false

    async function loadReadings() {
      try {
        setLoading(true)
        setError('')

        const response = await readingsAPI.getAll()
        const data = Array.isArray(response) ? response : response?.results ?? []

        if (!cancelled) {
          setReadings(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
              err?.message ||
              'Unable to load insights.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadReadings()

    return () => {
      cancelled = true
    }
  }, [])

  const analytics = useMemo(() => {
    const today = getLocalISODate()
    const sevenDaysAgo = getDateOffset(-6)
    const thirtyDaysAgo = getDateOffset(-29)

    const validReadings = readings
      .map((reading) => ({
        ...reading,
        numericValue: Number(reading.glucose_value),
      }))
      .filter(
        (reading) =>
          Number.isFinite(reading.numericValue) &&
          reading.reading_date <= today
      )

    const last7Days = validReadings.filter(
      (reading) =>
        reading.reading_date >= sevenDaysAgo &&
        reading.reading_date <= today
    )

    const last30Days = validReadings.filter(
      (reading) =>
        reading.reading_date >= thirtyDaysAgo &&
        reading.reading_date <= today
    )

    const average = (items) => {
      if (!items.length) return null

      return (
        items.reduce((sum, item) => sum + item.numericValue, 0) /
        items.length
      )
    }

    const slotStats = SLOTS.map((slot) => {
      const slotReadings = last30Days.filter(
        (reading) => reading.slot === slot.value
      )

      return {
        ...slot,
        count: slotReadings.length,
        average: average(slotReadings),
      }
    })

    const slotsWithData = slotStats.filter((slot) => slot.count > 0)

    const highestAverageSlot =
      slotsWithData.length >= 2
        ? [...slotsWithData].sort((a, b) => {
            if (b.average !== a.average) return b.average - a.average
            return SLOTS.findIndex((slot) => slot.value === a.value) -
              SLOTS.findIndex((slot) => slot.value === b.value)
          })[0]
        : null

    const mostRecordedSlot = [...slotStats]
      .filter((slot) => slot.count >= 2)
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count
        return SLOTS.findIndex((slot) => slot.value === a.value) -
          SLOTS.findIndex((slot) => slot.value === b.value)
      })[0] ?? null

    const below = last30Days.filter(
      (reading) => reading.numericValue < targetLow
    ).length

    const within = last30Days.filter(
      (reading) =>
        reading.numericValue >= targetLow &&
        reading.numericValue <= targetHigh
    ).length

    const above = last30Days.filter(
      (reading) => reading.numericValue > targetHigh
    ).length

    const readingsByDate = new Map()

    last30Days.forEach((reading) => {
      readingsByDate.set(
        reading.reading_date,
        (readingsByDate.get(reading.reading_date) ?? 0) + 1
      )
    })

    const elapsedDates = Array.from({ length: 30 }, (_, index) =>
      getDateOffset(index - 29)
    ).filter((date) => date <= today)

    const daysWithReadings = elapsedDates.filter((date) =>
      readingsByDate.has(date)
    ).length

    const daysWithFewerThanFour = elapsedDates.filter((date) => {
      const count = readingsByDate.get(date) ?? 0
      return count > 0 && count < 4
    }).length

    const daysWithoutReadings = elapsedDates.filter(
      (date) => !readingsByDate.has(date)
    ).length

    return {
      last7Days,
      last30Days,
      average7: average(last7Days),
      average30: average(last30Days),
      slotStats,
      highestAverageSlot,
      mostRecordedSlot,
      below,
      within,
      above,
      daysWithReadings,
      daysWithFewerThanFour,
      daysWithoutReadings,
      elapsedDays: elapsedDates.length,
    }
  }, [readings, targetLow, targetHigh])

  const distribution = [
    {
      label: 'Below target',
      count: analytics.below,
      color: '#f59e0b',
    },
    {
      label: 'Within target',
      count: analytics.within,
      color: '#10b981',
    },
    {
      label: 'Above target',
      count: analytics.above,
      color: '#f43f5e',
    },
  ]

  const chartData = analytics.slotStats.map((slot) => ({
    slot: slot.short,
    average: slot.average === null ? 0 : Number(slot.average.toFixed(1)),
    count: slot.count,
    hasData: slot.average !== null,
  }))

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="text-sm text-slate-500">Analyzing your readings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <div className="flex items-center gap-2 text-rose-700">
          <AlertCircle size={20} />
          <p className="font-semibold">Unable to load insights</p>
        </div>
        <p className="mt-2 text-sm text-rose-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Retry
        </button>
      </div>
    )
  }

  const total30 = analytics.last30Days.length
  const withinPercentage =
    total30 > 0 ? Math.round((analytics.within / total30) * 100) : 0

  return (
    <div className="space-y-6 pb-8">
      <div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
            <Activity size={22} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Insights</h1>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Understand your recording patterns over the last 30 days.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          icon={Droplets}
          title="Last 7 days"
          value={analytics.last7Days.length}
          description={`Average: ${formatNumber(analytics.average7)} mg/dL`}
        />
        <InsightCard
          icon={CalendarDays}
          title="Last 30 days"
          value={total30}
          description={`Average: ${formatNumber(analytics.average30)} mg/dL`}
        />
        <InsightCard
          icon={CheckCircle2}
          title="Within target"
          value={`${withinPercentage}%`}
          description={`${analytics.within} of ${total30} readings`}
        />
        <InsightCard
          icon={Clock3}
          title="Active recording days"
          value={`${analytics.daysWithReadings}/${analytics.elapsedDays}`}
          description="Days with at least one reading"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="font-bold text-slate-900">
              Average by reading slot
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Based on readings recorded in the last 30 days.
            </p>
          </div>

          <div className="h-72">
            {analytics.slotStats.some((slot) => slot.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 8, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="slot" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value, name, props) =>
                      props.payload.hasData
                        ? [`${value} mg/dL`, 'Average']
                        : ['No readings', 'Average']
                    }
                  />
                  <Bar dataKey="average" radius={[7, 7, 0, 0]}>
                    {chartData.map((item) => (
                      <Cell
                        key={item.slot}
                        fill={item.hasData ? '#8b5cf6' : '#e2e8f0'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No readings recorded in the last 30 days.
              </div>
            )}
          </div>

          <div className="mt-3 space-y-3">
            {analytics.slotStats.map((slot) => (
              <div
                key={slot.value}
                className="flex items-center justify-between border-t border-slate-100 pt-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {slot.label}
                  </p>
                  <p className="text-xs text-slate-400">
                    {slot.count} {slot.count === 1 ? 'reading' : 'readings'}
                  </p>
                </div>
                <p className="font-semibold text-slate-900">
                  {formatNumber(slot.average)}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    mg/dL
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="font-bold text-slate-900">
              Target range distribution
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Your configured range: {targetLow}–{targetHigh} mg/dL
            </p>
          </div>

          <div className="space-y-6 pt-2">
            {distribution.map((item) => {
              const percentage =
                total30 > 0 ? (item.count / total30) * 100 : 0

              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      {item.label}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {item.count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {total30 === 0 && (
            <p className="mt-8 text-center text-sm text-slate-400">
              Add readings to see your distribution.
            </p>
          )}

          <div className="mt-8 rounded-xl bg-slate-50 p-4">
            <div className="flex items-start gap-2">
              <Info size={18} className="mt-0.5 shrink-0 text-slate-500" />
              <p className="text-xs leading-5 text-slate-500">
                These categories compare your recorded values with your
                configured tracking range. They are descriptive statistics,
                not a medical assessment.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="font-bold text-slate-900">Patterns in your records</h2>
          <p className="mt-1 text-xs text-slate-500">
            Observations from your last 30 days of recorded data.
          </p>
        </div>

        {total30 === 0 ? (
          <div className="rounded-xl bg-slate-50 p-6 text-center">
            <Activity className="mx-auto mb-2 text-slate-400" size={28} />
            <p className="font-medium text-slate-700">Not enough data yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Record readings to generate useful patterns.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-violet-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-violet-700">
                <TrendingUp size={18} />
                <span className="text-sm font-semibold">Highest average slot</span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {analytics.highestAverageSlot?.label ?? 'Not enough slot data'}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {analytics.highestAverageSlot
                  ? `${formatNumber(analytics.highestAverageSlot.average)} mg/dL average`
                  : 'At least two different slots need recorded readings.'}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-blue-700">
                <Clock3 size={18} />
                <span className="text-sm font-semibold">Most recorded slot</span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {analytics.mostRecordedSlot?.label ?? 'Not enough data'}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {analytics.mostRecordedSlot
                  ? `${analytics.mostRecordedSlot.count} readings in this slot`
                  : 'Record at least two readings in a slot.'}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-emerald-700">
                <CheckCircle2 size={18} />
                <span className="text-sm font-semibold">Within configured range</span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {analytics.within} of {total30} readings
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {withinPercentage}% of your recorded values were within your
                configured range.
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-700">
                <CalendarDays size={18} />
                <span className="text-sm font-semibold">Recording gaps</span>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {analytics.daysWithoutReadings} days without records
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {analytics.daysWithFewerThanFour} recorded days had fewer than
                four entries.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="font-bold text-slate-900">30-day recording activity</h2>
          <p className="mt-1 text-xs text-slate-500">
            Recorded readings per day. A missing bar means no reading was
            recorded for that date.
          </p>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:grid-cols-10 lg:grid-cols-15">
          {Array.from({ length: analytics.elapsedDays }, (_, index) => {
            const date = getDateOffset(index - (analytics.elapsedDays - 1))
            const count = analytics.last30Days.filter(
              (reading) => reading.reading_date === date
            ).length

            return (
              <div
                key={date}
                title={`${date}: ${count} ${count === 1 ? 'reading' : 'readings'}`}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`flex h-10 w-full items-center justify-center rounded-lg text-xs font-semibold ${
                    count === 0
                      ? 'bg-slate-100 text-slate-400'
                      : count < 4
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {count}
                </div>
                <span className="text-[10px] text-slate-400">
                  {Number(date.slice(-2))}
                </span>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-slate-200" />
            No records
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-violet-200" />
            1–3 readings
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-emerald-200" />
            4 readings
          </span>
        </div>
      </section>
    </div>
  )
}
