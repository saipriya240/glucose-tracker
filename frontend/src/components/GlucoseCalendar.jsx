
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Droplets,
  MinusCircle,
} from 'lucide-react'
import { readingsAPI } from '../services/api'

const SLOTS = [
  { value: 'MORNING', label: 'Morning' },
  { value: 'AFTER_BREAKFAST', label: 'After breakfast' },
  { value: 'AFTER_LUNCH', label: 'After lunch' },
  { value: 'AFTER_DINNER', label: 'After dinner' },
]

function toISODate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getTodayISO() {
  const today = new Date()
  return toISODate(today.getFullYear(), today.getMonth(), today.getDate())
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getStatus(value, low, high) {
  if (value < low) return 'Below target'
  if (value > high) return 'Above target'
  return 'Within target'
}

function getStatusClasses(status) {
  if (status === 'Below target') {
    return 'bg-amber-100 text-amber-700'
  }

  if (status === 'Above target') {
    return 'bg-rose-100 text-rose-700'
  }

  return 'bg-emerald-100 text-emerald-700'
}

function getDayStatus(dayReadings, low, high) {
  if (!dayReadings.length) return 'empty'

  const values = dayReadings.map((reading) => Number(reading.glucose_value))

  if (values.some((value) => value < low)) return 'below'
  if (values.some((value) => value > high)) return 'above'
  return 'within'
}

export default function GlucoseCalendar({ user }) {
  const today = getTodayISO()

  const [readings, setReadings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(today)

  const targetLow = Number(user?.target_low ?? 70)
  const targetHigh = Number(user?.target_high ?? 180)

  useEffect(() => {
    let cancelled = false

    async function loadReadings() {
      try {
        setLoading(true)
        setError('')

        const response = await readingsAPI.getAll()
        const payload = response?.data ?? response
        const data = Array.isArray(payload)
          ? payload
          : payload?.results ?? []

        if (!cancelled) setReadings(data)
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
              err?.message ||
              'Unable to load calendar readings.'
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

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const monthLabel = currentMonth.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = new Date(year, month, 1).getDay()

  const readingsByDate = useMemo(() => {
    const grouped = new Map()

    readings.forEach((reading) => {
      if (!grouped.has(reading.reading_date)) {
        grouped.set(reading.reading_date, [])
      }

      grouped.get(reading.reading_date).push(reading)
    })

    grouped.forEach((items) => {
      items.sort((a, b) => {
        const aIndex = SLOTS.findIndex((slot) => slot.value === a.slot)
        const bIndex = SLOTS.findIndex((slot) => slot.value === b.slot)
        return aIndex - bIndex
      })
    })

    return grouped
  }, [readings])

  const selectedReadings = readingsByDate.get(selectedDate) ?? []

  const selectedValues = selectedReadings
    .map((reading) => Number(reading.glucose_value))
    .filter(Number.isFinite)

  const selectedAverage =
    selectedValues.length > 0
      ? selectedValues.reduce((sum, value) => sum + value, 0) /
        selectedValues.length
      : null

  const selectedHighest =
    selectedValues.length > 0 ? Math.max(...selectedValues) : null

  const selectedLowest =
    selectedValues.length > 0 ? Math.min(...selectedValues) : null

  const monthReadings = readings.filter((reading) => {
    return (
      reading.reading_date >= toISODate(year, month, 1) &&
      reading.reading_date <= toISODate(year, month, daysInMonth)
    )
  })

  const monthAverage =
    monthReadings.length > 0
      ? monthReadings.reduce(
          (sum, reading) => sum + Number(reading.glucose_value),
          0
        ) / monthReadings.length
      : null

  const activeDays = new Set(
    monthReadings.map((reading) => reading.reading_date)
  ).size

  function changeMonth(offset) {
    const nextMonth = new Date(year, month + offset, 1)
    const nextYear = nextMonth.getFullYear()
    const nextMonthIndex = nextMonth.getMonth()

    setCurrentMonth(nextMonth)

    const selectedDay = Number(selectedDate.slice(-2))
    const nextLastDay = new Date(
      nextYear,
      nextMonthIndex + 1,
      0
    ).getDate()

    const nextSelectedDate = toISODate(
      nextYear,
      nextMonthIndex,
      Math.min(selectedDay, nextLastDay)
    )

    setSelectedDate(nextSelectedDate)
  }

  function selectDay(day) {
    const dateString = toISODate(year, month, day)

    if (dateString > today) return

    setSelectedDate(dateString)
  }

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="text-sm text-slate-500">Loading glucose calendar...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <div className="flex items-center gap-2 text-rose-700">
          <AlertCircle size={20} />
          <p className="font-semibold">Unable to load calendar</p>
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

  return (
    <div className="space-y-6 pb-8">
      <div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
            <CalendarDays size={22} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Glucose Calendar
          </h1>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Explore your recorded glucose readings by date.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Monthly readings</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {monthReadings.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Active days</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {activeDays}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Monthly average</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {monthAverage === null ? '—' : monthAverage.toFixed(1)}
            {monthAverage !== null && (
              <span className="ml-1 text-sm font-normal text-slate-400">
                mg/dL
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => changeMonth(-1)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
              aria-label="Previous month"
            >
              <ArrowLeft size={18} />
            </button>

            <h2 className="text-lg font-bold text-slate-900">
              {monthLabel}
            </h2>

            <button
              onClick={() => changeMonth(1)}
              disabled={
                year === new Date().getFullYear() &&
                month === new Date().getMonth()
              }
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next month"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
              (weekday) => (
                <div
                  key={weekday}
                  className="pb-2 text-center text-xs font-semibold text-slate-400"
                >
                  {weekday}
                </div>
              )
            )}

            {Array.from({ length: firstWeekday }, (_, index) => (
              <div key={`blank-${index}`} />
            ))}

            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1
              const dateString = toISODate(year, month, day)
              const dayReadings = readingsByDate.get(dateString) ?? []
              const isFuture = dateString > today
              const isSelected = selectedDate === dateString
              const isToday = dateString === today
              const status = getDayStatus(
                dayReadings,
                targetLow,
                targetHigh
              )

              let statusClasses = 'bg-slate-50 text-slate-700'

              if (status === 'within') {
                statusClasses = 'bg-emerald-50 text-emerald-700'
              } else if (status === 'below') {
                statusClasses = 'bg-amber-50 text-amber-700'
              } else if (status === 'above') {
                statusClasses = 'bg-rose-50 text-rose-700'
              }

              return (
                <button
                  key={dateString}
                  onClick={() => selectDay(day)}
                  disabled={isFuture}
                  className={`relative flex min-h-16 flex-col items-center justify-center rounded-xl border p-1 transition ${
                    isSelected
                      ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200'
                      : 'border-transparent hover:border-slate-200'
                  } ${isFuture ? 'cursor-not-allowed opacity-30' : ''} ${
                    !isSelected ? statusClasses : 'text-violet-800'
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      isToday ? 'underline decoration-2 underline-offset-4' : ''
                    }`}
                  >
                    {day}
                  </span>

                  {dayReadings.length > 0 && (
                    <span className="mt-1 text-[10px] font-medium">
                      {dayReadings.length} {dayReadings.length === 1 ? 'entry' : 'entries'}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Within target
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              Below target
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              Above target
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              No readings
            </span>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-400">
            A day with multiple readings is marked if any recorded value falls
            below or above your configured range. Select a date to inspect its
            individual readings.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
              Selected date
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {formatDate(selectedDate)}
            </h2>
          </div>

          {selectedReadings.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Average</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {selectedAverage.toFixed(1)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Highest</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {selectedHighest}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Lowest</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {selectedLowest}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {selectedReadings.map((reading) => {
                  const slot = SLOTS.find(
                    (item) => item.value === reading.slot
                  )
                  const value = Number(reading.glucose_value)
                  const status = getStatus(value, targetLow, targetHigh)

                  return (
                    <div
                      key={reading.id}
                      className="rounded-xl border border-slate-100 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {slot?.label ?? reading.slot}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Recorded glucose value
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-900">
                            {value}
                            <span className="ml-1 text-xs font-normal text-slate-400">
                              mg/dL
                            </span>
                          </p>
                          <span
                            className={`mt-1 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClasses(status)}`}
                          >
                            {status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-xl bg-slate-50 p-6 text-center">
              <Droplets size={30} className="mb-3 text-slate-300" />
              <p className="font-semibold text-slate-700">
                No readings for this date
              </p>
              <p className="mt-1 text-sm text-slate-500">
                No glucose entries were found for the selected date.
              </p>
            </div>
          )}

          <div className="mt-5 rounded-xl bg-violet-50 p-4">
            <div className="flex items-start gap-2">
              <Activity size={17} className="mt-0.5 shrink-0 text-violet-600" />
              <p className="text-xs leading-5 text-violet-800">
                Configured tracking range: {targetLow}–{targetHigh} mg/dL.
                Calendar statuses are descriptive comparisons, not medical
                assessments.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
