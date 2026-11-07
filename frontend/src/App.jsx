import Insights from './components/Insights'
import { useEffect, useState } from 'react'
import DailyReport from './components/DailyReport'
import Auth from './components/Auth'
import MonthlyReport from './components/MonthlyReport'
import Readings from './components/Readings'
import GlucoseCalendar from './components/GlucoseCalendar'
import { authAPI, readingsAPI } from './services/api'

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  Droplets,
  HeartPulse,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Plus,
  Settings,
  UserRound,
  X,
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

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Readings', icon: Droplets },
  { name: 'Daily Report', icon: CalendarDays },
  { name: 'Monthly Report', icon: ChartNoAxesCombined },
  { name: 'Insights', icon: Lightbulb },
  { name: 'Calendar', icon: CalendarDays },
]

const SLOT_ORDER = {
  MORNING: 1,
  AFTER_BREAKFAST: 2,
  AFTER_LUNCH: 3,
  AFTER_DINNER: 4,
}

function getISODateOffset(offset = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offset)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatReadingDate(dateString) {
  const today = getISODateOffset(0)
  const yesterday = getISODateOffset(-1)

  if (dateString === today) return 'Today'
  if (dateString === yesterday) return 'Yesterday'

  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

function getReadingSlotLabel(slot) {
  const labels = {
    MORNING: 'Morning (fasting)',
    AFTER_BREAKFAST: 'After breakfast',
    AFTER_LUNCH: 'After lunch',
    AFTER_DINNER: 'After dinner',
  }

  return labels[slot] || slot
}

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning!'
  if (hour < 17) return 'Good afternoon!'
  return 'Good evening!'
}

function StatCard({ title, value, unit, subtitle, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#89859B]">{title}</p>

        <div className="rounded-xl bg-[#F3F0FF] p-2.5 text-[#8874F5]">
          <Icon size={19} />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-[#29263A]">
          {value}
        </span>

        {unit && (
          <span className="text-sm text-[#89859B]">{unit}</span>
        )}
      </div>

      <div className="mt-3 text-xs text-[#89859B]">
        {subtitle}
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length || payload[0].value == null) {
    return null
  }

  return (
    <div className="rounded-xl border border-[#EEEAF7] bg-white px-4 py-3 shadow-lg">
      <p className="text-xs text-[#89859B]">{label}</p>

      <p className="mt-1 text-lg font-bold text-[#8874F5]">
        {payload[0].value}{' '}
        <span className="text-xs font-medium">mg/dL</span>
      </p>
    </div>
  )
}

function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [readings, setReadings] = useState([])
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (activePage !== 'Dashboard') return

    let cancelled = false

    async function loadDashboard() {
      setDashboardLoading(true)
      setDashboardError('')

      try {
        const data = await readingsAPI.getAll()

        if (!cancelled) {
          const results = Array.isArray(data)
            ? data
            : data?.results || []

          setReadings(results)
        }
      } catch (error) {
        if (!cancelled) {
          setDashboardError(
            error.message || 'Unable to load your readings.'
          )
        }
      } finally {
        if (!cancelled) {
          setDashboardLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [activePage, refreshKey])

  // Date range: today and the previous six days.
  const today = getISODateOffset(0)
  const sevenDaysAgo = getISODateOffset(-6)

  // Only use readings from the last seven days.
  const lastSevenDays = readings.filter((reading) => {
    return (
      reading.reading_date >= sevenDaysAgo &&
      reading.reading_date <= today
    )
  })

  // Convert values to numbers before calculating statistics.
  const values = lastSevenDays.map((reading) =>
    Number(reading.glucose_value)
  ).filter(Number.isFinite)

  const totalReadings = values.length

  const averageGlucose =
    totalReadings > 0
      ? (
          values.reduce((sum, value) => sum + value, 0) /
          totalReadings
        ).toFixed(1)
      : '—'

  const highestReading =
    totalReadings > 0 ? Math.max(...values) : '—'

  const lowestReading =
    totalReadings > 0 ? Math.min(...values) : '—'

  // Calculate one average for each day.
  const chartData = Array.from({ length: 7 }, (_, index) => {
    const date = getISODateOffset(index - 6)

    const dayReadings = lastSevenDays.filter(
      (reading) => reading.reading_date === date
    )

    const dayValues = dayReadings
      .map((reading) => Number(reading.glucose_value))
      .filter(Number.isFinite)

    const average =
      dayValues.length > 0
        ? dayValues.reduce((sum, value) => sum + value, 0) /
          dayValues.length
        : null

    return {
      day: new Date(`${date}T00:00:00`).toLocaleDateString(
        'en-IN',
        { weekday: 'short' }
      ),
      value: average === null ? null : Number(average.toFixed(1)),
    }
  })

  // Sort recent readings by date and then by reading slot.
  const recentReadings = [...readings]
    .sort((a, b) => {
      const dateDifference = b.reading_date.localeCompare(
        a.reading_date
      )

      if (dateDifference !== 0) return dateDifference

      return (
        (SLOT_ORDER[a.slot] || 99) -
        (SLOT_ORDER[b.slot] || 99)
      )
    })
    .slice(0, 5)

  // Use the user's configured target range.
  const targetLow = Number(user.target_low ?? 70)
  const targetHigh = Number(user.target_high ?? 180)

  const belowCount = values.filter(
    (value) => value < targetLow
  ).length

  const inRangeCount = values.filter(
    (value) => value >= targetLow && value <= targetHigh
  ).length

  const aboveCount = values.filter(
    (value) => value > targetHigh
  ).length

  const getPercentage = (count) =>
    totalReadings > 0
      ? (count / totalReadings) * 100
      : 0

  const belowPercent = getPercentage(belowCount)
  const inRangePercent = getPercentage(inRangeCount)
  const abovePercent = getPercentage(aboveCount)

  const formattedToday = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#FAF9FE] text-[#29263A]">

      {sidebarOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#EEEAF7] bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[82px] items-center justify-between border-b border-[#F1EEF8] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8874F5] text-white">
              <HeartPulse size={23} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                Gluco
              </h1>

              <p className="text-[10px] font-semibold tracking-[2px] text-[#A39BBE]">
                GLUCOSE CARE
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="text-[#89859B] lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        <div className="px-4 pt-8">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.5px] text-[#AAA5B9]">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map(({ name, icon: Icon }) => {
              const active = activePage === name

              return (
                <button
                  key={name}
                  onClick={() => {
                    setActivePage(name)
                    setSidebarOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    active
                      ? 'bg-[#F0EDFF] text-[#7964E8]'
                      : 'text-[#89859B] hover:bg-[#FAF9FE] hover:text-[#29263A]'
                  }`}
                >
                  <Icon size={19} />
                  {name}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-[#F8F5FF] p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#8874F5]">
              <Activity size={19} />
            </div>

            <p className="text-sm font-bold">Small steps matter</p>

            <p className="mt-1 text-xs leading-5 text-[#89859B]">
              Keep tracking your readings to understand your patterns.
            </p>
          </div>

          <button
            onClick={() => {
              setActivePage('Profile')
              setSidebarOpen(false)
            }}
            className={`mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${
              activePage === 'Profile'
                ? 'bg-[#F0EDFF] text-[#7964E8]'
                : 'text-[#89859B] hover:bg-[#FAF9FE]'
            }`}
          >
            <UserRound size={19} />
            Profile
          </button>

          <button
            onClick={() => {
              setActivePage('Settings')
              setSidebarOpen(false)
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#89859B] hover:bg-[#FAF9FE]"
          >
            <Settings size={19} />
            Settings
          </button>

          <button
            onClick={onLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50"
          >
            <UserRound size={19} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen lg:ml-[260px]">

        {/* Header */}
        <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-[#EEEAF7] bg-white/90 px-5 backdrop-blur-md sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-[#625D76] hover:bg-[#F5F2FC] lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="text-lg font-bold">{activePage}</h2>

              <p className="hidden text-xs text-[#89859B] sm:block">
                Your personal glucose health space
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button className="relative rounded-xl p-2.5 text-[#89859B] hover:bg-[#F5F2FC]">
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#F28BAE]" />
            </button>

            <div className="h-8 w-px bg-[#EEEAF7]" />

            <button
              onClick={() => setActivePage('Profile')}
              className="flex items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0EDFF] text-sm font-bold text-[#7964E8]">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-bold">{user.username}</p>
                <p className="text-[11px] text-[#89859B]">
                  Personal account
                </p>
              </div>

              <ChevronDown
                size={15}
                className="hidden text-[#89859B] sm:block"
              />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] p-5 sm:p-8 lg:p-10">

          {activePage === 'Dashboard' ? (
            <>
              {/* Dashboard heading */}
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-medium text-[#89859B]">
                    {formattedToday}
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {getGreeting()}{' '}
                    <span className="text-[#8874F5]">👋</span>
                  </h2>

                  <p className="mt-2 text-sm text-[#89859B]">
                    Here's an overview of your glucose readings.
                  </p>
                </div>

                <button
                  onClick={() => setActivePage('Readings')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#8874F5] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#8874F5]/20 transition hover:bg-[#715CE5]"
                >
                  <Plus size={18} />
                  Add reading
                </button>
              </div>

              {/* Loading and error states */}
              {dashboardLoading && (
                <div className="mb-6 rounded-xl border border-[#EEEAF7] bg-white px-4 py-3 text-sm text-[#89859B]">
                  Loading your glucose readings...
                </div>
              )}

              {dashboardError && (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                  <p className="text-sm text-rose-600">
                    {dashboardError}
                  </p>

                  <button
                    onClick={() => setRefreshKey((key) => key + 1)}
                    className="text-sm font-bold text-rose-700 underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Statistics */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Average glucose"
                  value={averageGlucose}
                  unit="mg/dL"
                  subtitle="Last 7 days"
                  icon={Activity}
                />

                <StatCard
                  title="Total readings"
                  value={totalReadings}
                  subtitle="Last 7 days"
                  icon={Droplets}
                />

                <StatCard
                  title="Highest reading"
                  value={highestReading}
                  unit="mg/dL"
                  subtitle="Last 7 days"
                  icon={ArrowUpRight}
                />

                <StatCard
                  title="Lowest reading"
                  value={lowestReading}
                  unit="mg/dL"
                  subtitle="Last 7 days"
                  icon={ArrowDownRight}
                />
              </div>

              {/* Chart and target range */}
              <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">

                {/* Glucose chart */}
                <section className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold">Glucose overview</h3>

                      <p className="mt-1 text-xs text-[#89859B]">
                        Daily average over the past 7 days
                      </p>
                    </div>

                    <span className="rounded-lg border border-[#EEEAF7] px-3 py-2 text-xs font-semibold text-[#625D76]">
                      Last 7 days
                    </span>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-4 text-xs text-[#89859B]">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#8874F5]" />
                      Glucose level
                    </span>

                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#D9F2E7]" />
                      Target range
                    </span>
                  </div>

                  {totalReadings > 0 ? (
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{
                            top: 10,
                            right: 10,
                            left: -20,
                            bottom: 0,
                          }}
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
                            tick={{
                              fill: '#9691A5',
                              fontSize: 12,
                            }}
                            dy={10}
                          />

                          <YAxis
                            domain={[40, 'auto']}
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: '#9691A5',
                              fontSize: 11,
                            }}
                          />

                          <Tooltip content={<CustomTooltip />} />

                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#8874F5"
                            strokeWidth={3}
                            connectNulls={false}
                            dot={{
                              r: 4,
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
                    <div className="flex h-[280px] items-center justify-center text-center">
                      <div>
                        <Droplets
                          size={32}
                          className="mx-auto text-[#C5B9F8]"
                        />

                        <p className="mt-3 text-sm font-semibold text-[#625D76]">
                          No readings available
                        </p>

                        <p className="mt-1 text-xs text-[#89859B]">
                          Add a glucose reading to see your chart.
                        </p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Target range */}
                <section className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">Target range</h3>

                      <p className="mt-1 text-xs text-[#89859B]">
                        Your configured glucose range
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#F0EDFF] p-2.5 text-[#8874F5]">
                      <HeartPulse size={19} />
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-4xl font-extrabold text-[#29263A]">
                      {targetLow}–{targetHigh}
                    </p>

                    <p className="mt-2 text-xs text-[#89859B]">
                      mg/dL
                    </p>
                  </div>

                  {totalReadings > 0 ? (
                    <div className="mt-8 space-y-4">

                      {/* Below range */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#89859B]">
                          Below range
                        </span>

                        <span className="font-bold text-[#E9A44B]">
                          {belowCount} ({belowPercent.toFixed(1)}%)
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-[#F3EFFB]">
                        <div
                          className="h-2 rounded-full bg-[#E9A44B]"
                          style={{ width: `${belowPercent}%` }}
                        />
                      </div>

                      {/* In range */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#89859B]">
                          In target range
                        </span>

                        <span className="font-bold text-emerald-600">
                          {inRangeCount} ({inRangePercent.toFixed(1)}%)
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-[#E8F5EE]">
                        <div
                          className="h-2 rounded-full bg-[#65BE91]"
                          style={{ width: `${inRangePercent}%` }}
                        />
                      </div>

                      {/* Above range */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#89859B]">
                          Above range
                        </span>

                        <span className="font-bold text-rose-500">
                          {aboveCount} ({abovePercent.toFixed(1)}%)
                        </span>
                      </div>

                      <div className="h-2 rounded-full bg-[#FCEDEF]">
                        <div
                          className="h-2 rounded-full bg-[#E98B9D]"
                          style={{ width: `${abovePercent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="mt-8 text-center text-sm text-[#89859B]">
                      No readings available to calculate your range distribution.
                    </p>
                  )}

                  <p className="mt-6 rounded-xl bg-[#F8F6FF] p-3 text-xs leading-5 text-[#89859B]">
                    These values show how your recorded readings compare with your configured range. They are for tracking, not a medical assessment.
                  </p>
                </section>
              </div>

              {/* Recent readings */}
              <section className="mt-6 rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Recent readings</h3>

                    <p className="mt-1 text-xs text-[#89859B]">
                      Your latest recorded glucose values
                    </p>
                  </div>

                  <button
                    onClick={() => setActivePage('Readings')}
                    className="text-xs font-bold text-[#8874F5] hover:text-[#715CE5]"
                  >
                    View all
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left">
                    <thead>
                      <tr className="border-b border-[#F0EDF6] text-[11px] font-semibold uppercase tracking-wider text-[#A09BAF]">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Reading slot</th>
                        <th className="pb-3 text-right">
                          Glucose value
                        </th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentReadings.map((reading) => {
                        const glucoseValue = Number(
                          reading.glucose_value
                        )

                        const inRange =
                          glucoseValue >= targetLow &&
                          glucoseValue <= targetHigh

                        const belowRange =
                          glucoseValue < targetLow

                        const status = inRange
                          ? 'In range'
                          : belowRange
                            ? 'Below range'
                            : 'Above range'

                        const statusClass = inRange
                          ? 'bg-[#EAF7F0] text-emerald-700'
                          : belowRange
                            ? 'bg-[#FFF4E5] text-[#B7791F]'
                            : 'bg-[#FCEDEF] text-rose-600'

                        return (
                          <tr
                            key={reading.id}
                            className="border-b border-[#F5F2F9] last:border-0"
                          >
                            <td className="py-4 text-sm font-medium">
                              {formatReadingDate(reading.reading_date)}
                            </td>

                            <td className="py-4 text-sm text-[#89859B]">
                              {getReadingSlotLabel(reading.slot)}
                            </td>

                            <td className="py-4 text-right text-sm font-bold">
                              {glucoseValue}{' '}
                              <span className="text-xs font-normal text-[#89859B]">
                                mg/dL
                              </span>
                            </td>

                            <td className="py-4 text-right">
                              <span
                                className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${statusClass}`}
                              >
                                {status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}

                      {recentReadings.length === 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="py-10 text-center text-sm text-[#89859B]"
                          >
                            No readings recorded yet. Add your first reading to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : activePage === 'Readings' ? (
  <Readings user={user} />
) : activePage === 'Daily Report' ? (
  <DailyReport user={user} />
) : activePage === 'Monthly Report' ? (
  <MonthlyReport user={user} />
) : activePage === 'Insights' ? (
  <Insights user={user} />
) : activePage === 'Calendar' ? (
  <GlucoseCalendar user={user} />
) : (
            <section className="rounded-2xl border border-[#EEEAF7] bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0EDFF] text-[#8874F5]">
                <Activity size={26} />
              </div>

              <h3 className="mt-4 text-lg font-bold">
                {activePage}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#89859B]">
                This section has not been implemented yet. We'll build it as part of the next development stages.
              </p>

              <button
                onClick={() => setActivePage('Dashboard')}
                className="mt-5 rounded-xl bg-[#8874F5] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#715CE5]"
              >
                Back to dashboard
              </button>
            </section>
          )}

          <footer className="py-8 text-center text-xs text-[#AAA5B9]">
            Gluco · Glucose tracking made simpler
          </footer>
        </div>
      </main>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('gluco_access_token')

    if (!token) {
      setCheckingSession(false)
      return
    }

    authAPI
      .getProfile()
      .then((profile) => {
        setUser(profile)
      })
      .catch(() => {
        authAPI.logout()
        setUser(null)
      })
      .finally(() => {
        setCheckingSession(false)
      })
  }, [])

  function handleLogout() {
    authAPI.logout()
    setUser(null)
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9FE]">
        <p className="text-sm font-semibold text-[#8874F5]">
          Loading Gluco...
        </p>
      </div>
    )
  }

  if (!user) {
    return <Auth onAuthenticated={setUser} />
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
    />
  )
}

export default App
