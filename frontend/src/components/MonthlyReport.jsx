
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Droplets,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { readingsAPI } from '../services/api'

function getLocalISODate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getLocalMonth(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getMonthRange(monthString) {
  const [year, month] = monthString.split('-').map(Number)
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  return { start, end, year, month, lastDay }
}

function getPreviousMonth(monthString) {
  const [year, month] = monthString.split('-').map(Number)
  const date = new Date(year, month - 2, 1)
  return getLocalMonth(date)
}

function formatMonth(monthString) {
  const [year, month] = monthString.split('-').map(Number)

  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })
}

function formatDay(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

function getSlotLabel(slot) {
  const labels = {
    MORNING: 'Morning (fasting)',
    AFTER_BREAKFAST: 'After breakfast',
    AFTER_LUNCH: 'After lunch',
    AFTER_DINNER: 'After dinner',
  }

  return labels[slot] || slot
}

function getStatus(value, low, high) {
  if (value < low) return 'Below range'
  if (value > high) return 'Above range'
  return 'In range'
}

function getStatusClass(status) {
  if (status === 'Below range') {
    return 'bg-[#FFF4E5] text-[#B7791F]'
  }

  if (status === 'Above range') {
    return 'bg-[#FCEDEF] text-rose-600'
  }

  return 'bg-[#EAF7F0] text-emerald-700'
}

function SummaryCard({ title, value, unit, subtitle, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#89859B]">{title}</p>
        <div className="rounded-xl bg-[#F3F0FF] p-2.5 text-[#8874F5]">
          <Icon size={19} />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-[#29263A]">{value}</span>
        {unit && <span className="text-sm text-[#89859B]">{unit}</span>}
      </div>

      <p className="mt-3 text-xs text-[#89859B]">{subtitle}</p>
    </div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length || payload[0].value == null) {
    return null
  }

  return (
    <div className="rounded-xl border border-[#EEEAF7] bg-white px-4 py-3 shadow-lg">
      <p className="text-xs text-[#89859B]">{label}</p>
      <p className="mt-1 text-lg font-bold text-[#8874F5]">
        {payload[0].value} <span className="text-xs font-medium">mg/dL</span>
      </p>
    </div>
  )
}

export default function MonthlyReport({ user }) {
  const currentMonth = getLocalMonth()

  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [readings, setReadings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const targetLow = Number(user.target_low ?? 70)
  const targetHigh = Number(user.target_high ?? 180)

  useEffect(() => {
    let cancelled = false

    async function loadReadings() {
      setLoading(true)
      setError('')

      try {
        const data = await readingsAPI.getAll()
        const results = Array.isArray(data)
          ? data
          : data?.results || []

        if (!cancelled) {
          setReadings(results)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load your readings.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadReadings()

    return () => {
      cancelled = true
    }
  }, [])

  const currentRange = getMonthRange(selectedMonth)
  const previousMonth = getPreviousMonth(selectedMonth)
  const previousRange = getMonthRange(previousMonth)

  const currentMonthReadings = useMemo(() => {
    return readings.filter(
      (reading) =>
        reading.reading_date >= currentRange.start &&
        reading.reading_date <= currentRange.end
    )
  }, [readings, currentRange.start, currentRange.end])

  const previousMonthReadings = useMemo(() => {
    return readings.filter(
      (reading) =>
        reading.reading_date >= previousRange.start &&
        reading.reading_date <= previousRange.end
    )
  }, [readings, previousRange.start, previousRange.end])

  const currentValues = currentMonthReadings
    .map((reading) => Number(reading.glucose_value))
    .filter(Number.isFinite)

  const previousValues = previousMonthReadings
    .map((reading) => Number(reading.glucose_value))
    .filter(Number.isFinite)

  const totalReadings = currentValues.length

  const average =
    totalReadings > 0
      ? currentValues.reduce((sum, value) => sum + value, 0) /
        totalReadings
      : null

  const highest =
    totalReadings > 0 ? Math.max(...currentValues) : null

  const lowest =
    totalReadings > 0 ? Math.min(...currentValues) : null

  const previousAverage =
    previousValues.length > 0
      ? previousValues.reduce((sum, value) => sum + value, 0) /
        previousValues.length
      : null

  // Positive percentage means the average increased.
  // A percentage is not calculated if the previous average is zero or absent.
  const averageChange =
    average !== null && previousAverage !== null && previousAverage !== 0
      ? ((average - previousAverage) / previousAverage) * 100
      : null

  const inRangeCount = currentValues.filter(
    (value) => value >= targetLow && value <= targetHigh
  ).length

  const belowCount = currentValues.filter(
    (value) => value < targetLow
  ).length

  const aboveCount = currentValues.filter(
    (value) => value > targetHigh
  ).length

  const percentage = (count) =>
    totalReadings > 0 ? (count / totalReadings) * 100 : 0

  const dailyData = useMemo(() => {
    return Array.from({ length: currentRange.lastDay }, (_, index) => {
      const day = String(index + 1).padStart(2, '0')
      const date = `${selectedMonth}-${day}`

      const dayReadings = currentMonthReadings.filter(
        (reading) => reading.reading_date === date
      )

      const values = dayReadings
        .map((reading) => Number(reading.glucose_value))
        .filter(Number.isFinite)

      const dayAverage =
        values.length > 0
          ? values.reduce((sum, value) => sum + value, 0) / values.length
          : null

      return {
        date,
        day: String(index + 1),
        average:
          dayAverage === null ? null : Number(dayAverage.toFixed(1)),
      }
    })
  }, [currentMonthReadings, currentRange.lastDay, selectedMonth])

  const dailyRows = useMemo(() => {
    return dailyData.filter((day) => day.average !== null)
  }, [dailyData])

  const formattedToday = getLocalISODate()

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#89859B]">
            Monthly glucose summary
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Monthly Report
          </h2>
          <p className="mt-2 text-sm text-[#89859B]">
            Review your monthly readings and compare them with the previous month.
          </p>
        </div>

        <label className="flex items-center gap-2 rounded-xl border border-[#EEEAF7] bg-white px-3 py-2.5">
          <CalendarDays size={17} className="text-[#8874F5]" />
          <input
            type="month"
            value={selectedMonth}
            max={currentMonth}
            onChange={(event) => {
              if (event.target.value && event.target.value <= currentMonth) {
                setSelectedMonth(event.target.value)
              }
            }}
            className="bg-transparent text-sm font-semibold text-[#625D76] outline-none"
          />
        </label>
      </div>

      <div className="mb-6 rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#A09BAF]">
          Selected month
        </p>
        <p className="mt-2 text-lg font-bold text-[#29263A]">
          {formatMonth(selectedMonth)}
        </p>
        <p className="mt-1 text-xs text-[#89859B]">
          Target range: {targetLow}–{targetHigh} mg/dL
        </p>
      </div>

      {loading && (
        <div className="mb-6 rounded-xl border border-[#EEEAF7] bg-white px-4 py-3 text-sm text-[#89859B]">
          Loading your readings...
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Monthly average"
              value={average === null ? '—' : average.toFixed(1)}
              unit="mg/dL"
              subtitle="Average of recorded readings"
              icon={Activity}
            />

            <SummaryCard
              title="Total readings"
              value={totalReadings}
              subtitle={`Recorded in ${formatMonth(selectedMonth)}`}
              icon={Droplets}
            />

            <SummaryCard
              title="Highest reading"
              value={highest === null ? '—' : highest}
              unit="mg/dL"
              subtitle="Highest recorded value"
              icon={ArrowUpRight}
            />

            <SummaryCard
              title="Lowest reading"
              value={lowest === null ? '—' : lowest}
              unit="mg/dL"
              subtitle="Lowest recorded value"
              icon={ArrowDownRight}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <section className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-bold text-[#29263A]">
                Daily glucose averages
              </h3>
              <p className="mt-1 text-xs text-[#89859B]">
                Average of recorded readings for each day. Days without readings are left blank.
              </p>

              {totalReadings > 0 ? (
                <div className="mt-6 h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailyData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <ReferenceArea
                        y1={targetLow}
                        y2={targetHigh}
                        fill="#D9F2E7"
                        fillOpacity={0.55}
                      />

                      <CartesianGrid
                        stroke="#F0EDF6"
                        strokeDasharray="4 4"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9691A5', fontSize: 11 }}
                        interval="preserveStartEnd"
                      />

                      <YAxis
                        domain={[40, 'auto']}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9691A5', fontSize: 11 }}
                      />

                      <Tooltip content={<ChartTooltip />} />

                      <Line
                        type="monotone"
                        dataKey="average"
                        stroke="#8874F5"
                        strokeWidth={2.5}
                        connectNulls={false}
                        dot={{
                          r: 3,
                          fill: '#8874F5',
                          strokeWidth: 2,
                          stroke: '#fff',
                        }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-center">
                  <div>
                    <Droplets size={32} className="mx-auto text-[#C5B9F8]" />
                    <p className="mt-3 text-sm font-semibold text-[#625D76]">
                      No readings this month
                    </p>
                    <p className="mt-1 text-xs text-[#89859B]">
                      Recorded readings will appear here.
                    </p>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-bold text-[#29263A]">
                Previous month comparison
              </h3>
              <p className="mt-1 text-xs text-[#89859B]">
                {formatMonth(previousMonth)} compared with {formatMonth(selectedMonth)}
              </p>

              <div className="mt-6 rounded-xl bg-[#F8F6FF] p-4">
                <p className="text-xs text-[#89859B]">
                  Previous month average
                </p>
                <p className="mt-2 text-2xl font-extrabold text-[#29263A]">
                  {previousAverage === null
                    ? 'No data'
                    : `${previousAverage.toFixed(1)} mg/dL`}
                </p>
                <p className="mt-1 text-xs text-[#89859B]">
                  {previousValues.length} recorded readings
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-[#EEEAF7] p-4">
                <p className="text-xs text-[#89859B]">
                  Average change
                </p>

                {averageChange === null ? (
                  <p className="mt-2 text-sm font-semibold text-[#89859B]">
                    Not enough data to calculate a percentage change.
                  </p>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    {averageChange > 0 ? (
                      <TrendingUp
                        size={21}
                        className="text-rose-500"
                      />
                    ) : averageChange < 0 ? (
                      <TrendingDown
                        size={21}
                        className="text-emerald-600"
                      />
                    ) : null}

                    <span className="text-2xl font-extrabold text-[#29263A]">
                      {averageChange > 0 ? '+' : ''}
                      {averageChange.toFixed(1)}%
                    </span>
                  </div>
                )}

                <p className="mt-2 text-xs leading-5 text-[#89859B]">
                  This compares averages only. An increase or decrease is not, by itself, a medical assessment.
                </p>
              </div>
            </section>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-bold text-[#29263A]">
                Target range distribution
              </h3>
              <p className="mt-1 text-xs text-[#89859B]">
                Based on all recorded readings in the selected month.
              </p>

              {totalReadings > 0 ? (
                <div className="mt-6 space-y-5">
                  {[
                    {
                      label: 'In range',
                      count: inRangeCount,
                      color: '#65BE91',
                      track: '#E8F5EE',
                      text: 'text-emerald-600',
                    },
                    {
                      label: 'Below range',
                      count: belowCount,
                      color: '#E9A44B',
                      track: '#FFF4E5',
                      text: 'text-[#B7791F]',
                    },
                    {
                      label: 'Above range',
                      count: aboveCount,
                      color: '#E98B9D',
                      track: '#FCEDEF',
                      text: 'text-rose-600',
                    },
                  ].map((item) => {
                    const percent = percentage(item.count)

                    return (
                      <div key={item.label}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="text-[#89859B]">
                            {item.label}
                          </span>
                          <span className={`font-bold ${item.text}`}>
                            {item.count} ({percent.toFixed(1)}%)
                          </span>
                        </div>

                        <div
                          className="h-2 rounded-full"
                          style={{ backgroundColor: item.track }}
                        >
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-6 rounded-xl bg-[#F8F6FF] p-4 text-center text-sm text-[#89859B]">
                  No readings available for this month.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-bold text-[#29263A]">
                Monthly activity
              </h3>
              <p className="mt-1 text-xs text-[#89859B]">
                Days with at least one recorded reading.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#F8F6FF] p-4">
                  <p className="text-xs text-[#89859B]">
                    Active days
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-[#29263A]">
                    {dailyRows.length}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F8F6FF] p-4">
                  <p className="text-xs text-[#89859B]">
                    Days without readings
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-[#29263A]">
                    {Math.max(
                      0,
                      (selectedMonth === currentMonth
                        ? Number(formattedToday.slice(-2))
                        : currentRange.lastDay) - dailyRows.length
                    )}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-xs leading-5 text-[#89859B]">
                Active days count calendar dates with at least one saved reading. Future dates in the current month are not counted as days without readings.
              </p>
            </section>
          </div>

          <section className="mt-6 rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h3 className="font-bold text-[#29263A]">
                Daily breakdown
              </h3>
              <p className="mt-1 text-xs text-[#89859B]">
                Daily averages and reading counts for {formatMonth(selectedMonth)}.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left">
                <thead>
                  <tr className="border-b border-[#F0EDF6] text-[11px] font-semibold uppercase tracking-wider text-[#A09BAF]">
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Readings</th>
                    <th className="pb-3 text-right">Daily average</th>
                    <th className="pb-3 text-right">Highest</th>
                    <th className="pb-3 text-right">Lowest</th>
                  </tr>
                </thead>

                <tbody>
                  {dailyRows.map((day) => {
                    const dayReadings = currentMonthReadings.filter(
                      (reading) => reading.reading_date === day.date
                    )

                    const dayValues = dayReadings
                      .map((reading) => Number(reading.glucose_value))
                      .filter(Number.isFinite)

                    return (
                      <tr
                        key={day.date}
                        className="border-b border-[#F5F2F9] last:border-0"
                      >
                        <td className="py-4 text-sm font-medium text-[#625D76]">
                          {formatDay(day.date)}
                        </td>

                        <td className="py-4 text-right text-sm text-[#89859B]">
                          {dayValues.length}
                        </td>

                        <td className="py-4 text-right text-sm font-bold text-[#29263A]">
                          {day.average} mg/dL
                        </td>

                        <td className="py-4 text-right text-sm text-[#625D76]">
                          {Math.max(...dayValues)}
                        </td>

                        <td className="py-4 text-right text-sm text-[#625D76]">
                          {Math.min(...dayValues)}
                        </td>
                      </tr>
                    )
                  })}

                  {dailyRows.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-10 text-center text-sm text-[#89859B]"
                      >
                        No daily records available for this month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
