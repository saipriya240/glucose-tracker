
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Droplets,
} from 'lucide-react'
import { readingsAPI } from '../services/api'

const SLOTS = [
  { value: 'MORNING', label: 'Morning (fasting)' },
  { value: 'AFTER_BREAKFAST', label: 'After breakfast' },
  { value: 'AFTER_LUNCH', label: 'After lunch' },
  { value: 'AFTER_DINNER', label: 'After dinner' },
]

function getLocalISODate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(
    'en-IN',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  )
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
        <span className="text-3xl font-bold text-[#29263A]">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-[#89859B]">{unit}</span>
        )}
      </div>

      <p className="mt-3 text-xs text-[#89859B]">{subtitle}</p>
    </div>
  )
}

export default function DailyReport({ user }) {
  const today = getLocalISODate()

  const [selectedDate, setSelectedDate] = useState(today)
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

  const dailyReadings = useMemo(() => {
    return readings
      .filter((reading) => reading.reading_date === selectedDate)
      .sort((a, b) => {
        const aIndex = SLOTS.findIndex((slot) => slot.value === a.slot)
        const bIndex = SLOTS.findIndex((slot) => slot.value === b.slot)
        return aIndex - bIndex
      })
  }, [readings, selectedDate])

  const values = dailyReadings
    .map((reading) => Number(reading.glucose_value))
    .filter(Number.isFinite)

  const totalReadings = values.length

  const average =
    totalReadings > 0
      ? (
          values.reduce((sum, value) => sum + value, 0) /
          totalReadings
        ).toFixed(1)
      : '—'

  const highest =
    totalReadings > 0 ? Math.max(...values) : '—'

  const lowest =
    totalReadings > 0 ? Math.min(...values) : '—'

  const inRangeCount = values.filter(
    (value) => value >= targetLow && value <= targetHigh
  ).length

  const belowCount = values.filter(
    (value) => value < targetLow
  ).length

  const aboveCount = values.filter(
    (value) => value > targetHigh
  ).length

  function changeDate(days) {
    const date = new Date(`${selectedDate}T00:00:00`)
    date.setDate(date.getDate() + days)

    const nextDate = getLocalISODate(date)

    if (nextDate <= today) {
      setSelectedDate(nextDate)
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#89859B]">
            Your glucose summary
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Daily Report
          </h2>
          <p className="mt-2 text-sm text-[#89859B]">
            Review your recorded readings for a selected day.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeDate(-1)}
            className="rounded-xl border border-[#EEEAF7] bg-white p-3 text-[#625D76] hover:bg-[#F8F6FF]"
            aria-label="Previous day"
          >
            <ArrowLeft size={18} />
          </button>

          <label className="flex items-center gap-2 rounded-xl border border-[#EEEAF7] bg-white px-3 py-2.5">
            <CalendarDays size={17} className="text-[#8874F5]" />
            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-[145px] bg-transparent text-sm font-semibold text-[#625D76] outline-none"
            />
          </label>

          <button
            type="button"
            onClick={() => changeDate(1)}
            disabled={selectedDate >= today}
            className="rounded-xl border border-[#EEEAF7] bg-white p-3 text-[#625D76] hover:bg-[#F8F6FF] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next day"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#A09BAF]">
          Selected date
        </p>
        <p className="mt-2 text-lg font-bold text-[#29263A]">
          {formatDate(selectedDate)}
        </p>
        <p className="mt-1 text-xs text-[#89859B]">
          Configured target range: {targetLow}–{targetHigh} mg/dL
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
              title="Average glucose"
              value={average}
              unit="mg/dL"
              subtitle="Selected day"
              icon={Activity}
            />

            <SummaryCard
              title="Total readings"
              value={totalReadings}
              subtitle="Recorded on this day"
              icon={Droplets}
            />

            <SummaryCard
              title="Highest reading"
              value={highest}
              unit="mg/dL"
              subtitle="Selected day"
              icon={ArrowUpRight}
            />

            <SummaryCard
              title="Lowest reading"
              value={lowest}
              unit="mg/dL"
              subtitle="Selected day"
              icon={ArrowDownRight}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <section className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-bold text-[#29263A]">
                Reading breakdown
              </h3>
              <p className="mt-1 text-xs text-[#89859B]">
                All readings recorded on {formatDate(selectedDate)}.
              </p>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[480px] text-left">
                  <thead>
                    <tr className="border-b border-[#F0EDF6] text-[11px] font-semibold uppercase tracking-wider text-[#A09BAF]">
                      <th className="pb-3">Reading slot</th>
                      <th className="pb-3 text-right">Value</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dailyReadings.map((reading) => {
                      const value = Number(reading.glucose_value)
                      const status = getStatus(
                        value,
                        targetLow,
                        targetHigh
                      )

                      const slot = SLOTS.find(
                        (item) => item.value === reading.slot
                      )

                      return (
                        <tr
                          key={reading.id}
                          className="border-b border-[#F5F2F9] last:border-0"
                        >
                          <td className="py-4 text-sm font-medium text-[#625D76]">
                            {slot?.label || reading.slot}
                          </td>

                          <td className="py-4 text-right text-sm font-bold text-[#29263A]">
                            {value} mg/dL
                          </td>

                          <td className="py-4 text-right">
                            <span
                              className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${getStatusClass(status)}`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}

                    {dailyReadings.length === 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="py-10 text-center text-sm text-[#89859B]"
                        >
                          No readings recorded for this date.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-bold text-[#29263A]">
                Target range summary
              </h3>

              <p className="mt-1 text-xs text-[#89859B]">
                Comparison against your configured range.
              </p>

              {totalReadings > 0 ? (
                <div className="mt-6 space-y-5">
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-[#89859B]">In range</span>
                      <span className="font-bold text-emerald-600">
                        {inRangeCount} / {totalReadings}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#E8F5EE]">
                      <div
                        className="h-2 rounded-full bg-[#65BE91]"
                        style={{
                          width: `${(inRangeCount / totalReadings) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-[#89859B]">Below range</span>
                      <span className="font-bold text-[#B7791F]">
                        {belowCount} / {totalReadings}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FFF4E5]">
                      <div
                        className="h-2 rounded-full bg-[#E9A44B]"
                        style={{
                          width: `${(belowCount / totalReadings) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-[#89859B]">Above range</span>
                      <span className="font-bold text-rose-600">
                        {aboveCount} / {totalReadings}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FCEDEF]">
                      <div
                        className="h-2 rounded-full bg-[#E98B9D]"
                        style={{
                          width: `${(aboveCount / totalReadings) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 rounded-xl bg-[#F8F6FF] p-4 text-center text-sm text-[#89859B]">
                  Add readings for this date to see the range summary.
                </div>
              )}

              <p className="mt-6 rounded-xl bg-[#F8F6FF] p-3 text-xs leading-5 text-[#89859B]">
                This report describes recorded values relative to your configured target range. It is not a medical assessment.
              </p>
            </section>
          </div>
        </>
      )}
    </div>
  )
}
