
import { useState } from 'react'
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
]

const readings = [
  { date: 'Today, 8:30 AM', slot: 'Morning (fasting)', value: 94 },
  { date: 'Yesterday, 8:15 PM', slot: 'After dinner', value: 136 },
  { date: 'Yesterday, 1:10 PM', slot: 'After lunch', value: 145 },
  { date: 'Yesterday, 8:00 AM', slot: 'Morning (fasting)', value: 101 },
]

const chartData = [
  { day: 'Mon', value: 98 },
  { day: 'Tue', value: 142 },
  { day: 'Wed', value: 118 },
  { day: 'Thu', value: 155 },
  { day: 'Fri', value: 108 },
  { day: 'Sat', value: 136 },
  { day: 'Sun', value: 94 },
]

function StatCard({ title, value, unit, subtitle, icon: Icon, trend, positive }) {
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
        {unit && <span className="text-sm text-[#89859B]">{unit}</span>}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs">
        {trend && (
          <span className={`flex items-center gap-0.5 font-semibold ${positive ? 'text-emerald-600' : 'text-rose-500'}`}>
            {positive ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
            {trend}
          </span>
        )}
        <span className="text-[#89859B]">{subtitle}</span>
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl border border-[#EEEAF7] bg-white px-4 py-3 shadow-lg">
      <p className="text-xs text-[#89859B]">{label}</p>
      <p className="mt-1 text-lg font-bold text-[#8874F5]">
        {payload[0].value} <span className="text-xs font-medium">mg/dL</span>
      </p>
    </div>
  )
}

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#FAF9FE] text-[#29263A]">
      {sidebarOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#EEEAF7] bg-white transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[82px] items-center justify-between border-b border-[#F1EEF8] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8874F5] text-white">
              <HeartPulse size={23} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">sweety</h1>
              <p className="text-[10px] font-semibold tracking-[2px] text-[#A39BBE]">GLUCOSE CARE</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-[#89859B] lg:hidden">
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
            onClick={() => setActivePage('Profile')}
            className={`mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${
              activePage === 'Profile' ? 'bg-[#F0EDFF] text-[#7964E8]' : 'text-[#89859B] hover:bg-[#FAF9FE]'
            }`}
          >
            <UserRound size={19} />
            Profile
          </button>

          <button
            onClick={() => setActivePage('Settings')}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#89859B] hover:bg-[#FAF9FE]"
          >
            <Settings size={19} />
            Settings
          </button>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[260px]">
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
            <button className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0EDFF] text-sm font-bold text-[#7964E8]">
                S
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-bold">Sweety User</p>
                <p className="text-[11px] text-[#89859B]">Personal account</p>
              </div>
              <ChevronDown size={15} className="hidden text-[#89859B] sm:block" />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] p-5 sm:p-8 lg:p-10">
          {activePage === 'Dashboard' ? (
            <>
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-medium text-[#89859B]">Saturday, November 7, 2026</p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Good afternoon! <span className="text-[#8874F5]">👋</span>
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

              <div className="mb-6 rounded-xl border border-[#F1D9E5] bg-[#FFF8FB] px-4 py-3 text-xs text-[#9A6680]">
                Sample dashboard data — these readings are illustrative, not stored user records.
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Average glucose" value="126.3" unit="mg/dL" subtitle="Last 7 days" icon={Activity} trend="8.2%" positive />
                <StatCard title="Total readings" value="18" subtitle="Last 7 days" icon={Droplets} />
                <StatCard title="Highest reading" value="155" unit="mg/dL" subtitle="Thursday" icon={ArrowUpRight} />
                <StatCard title="Lowest reading" value="94" unit="mg/dL" subtitle="Today" icon={ArrowDownRight} />
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
                <section className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold">Glucose overview</h3>
                      <p className="mt-1 text-xs text-[#89859B]">Your readings over the past 7 days</p>
                    </div>
                    <button className="rounded-lg border border-[#EEEAF7] px-3 py-2 text-xs font-semibold text-[#625D76]">
                      Last 7 days <ChevronDown className="ml-1 inline" size={13} />
                    </button>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-4 text-xs text-[#89859B]">
                    <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#8874F5]" /> Glucose level</span>
                    <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#D9F2E7]" /> Target range</span>
                  </div>

                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <ReferenceArea y1={70} y2={180} fill="#D9F2E7" fillOpacity={0.55} />
                        <CartesianGrid stroke="#F0EDF6" strokeDasharray="4 4" vertical={false} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9691A5', fontSize: 12 }} dy={10} />
                        <YAxis domain={[40, 200]} axisLine={false} tickLine={false} tick={{ fill: '#9691A5', fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="value" stroke="#8874F5" strokeWidth={3} dot={{ r: 4, fill: '#8874F5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">Target range</h3>
                      <p className="mt-1 text-xs text-[#89859B]">Your configured glucose range</p>
                    </div>
                    <div className="rounded-xl bg-[#F0EDFF] p-2.5 text-[#8874F5]">
                      <HeartPulse size={19} />
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-4xl font-extrabold text-[#29263A]">70–180</p>
                    <p className="mt-2 text-xs text-[#89859B]">mg/dL</p>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#89859B]">Below range</span>
                      <span className="font-bold text-[#E9A44B]">Below 70</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#F3EFFB]">
                      <div className="h-2 w-[25%] rounded-full bg-[#E9A44B]" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#89859B]">In target range</span>
                      <span className="font-bold text-emerald-600">70–180</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#E8F5EE]">
                      <div className="h-2 w-[78%] rounded-full bg-[#65BE91]" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#89859B]">Above range</span>
                      <span className="font-bold text-rose-500">Above 180</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FCEDEF]">
                      <div className="h-2 w-[15%] rounded-full bg-[#E98B9D]" />
                    </div>
                  </div>

                  <p className="mt-6 rounded-xl bg-[#F8F6FF] p-3 text-xs leading-5 text-[#89859B]">
                    Target values are configurable in your profile. These ranges are for tracking, not a medical assessment.
                  </p>
                </section>
              </div>

              <section className="mt-6 rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Recent readings</h3>
                    <p className="mt-1 text-xs text-[#89859B]">Your latest recorded glucose values</p>
                  </div>
                  <button onClick={() => setActivePage('Readings')} className="text-xs font-bold text-[#8874F5] hover:text-[#715CE5]">
                    View all
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left">
                    <thead>
                      <tr className="border-b border-[#F0EDF6] text-[11px] font-semibold uppercase tracking-wider text-[#A09BAF]">
                        <th className="pb-3">Date & time</th>
                        <th className="pb-3">Reading slot</th>
                        <th className="pb-3 text-right">Glucose value</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {readings.map((reading) => (
                        <tr key={`${reading.date}-${reading.slot}`} className="border-b border-[#F5F2F9] last:border-0">
                          <td className="py-4 text-sm font-medium">{reading.date}</td>
                          <td className="py-4 text-sm text-[#89859B]">{reading.slot}</td>
                          <td className="py-4 text-right text-sm font-bold">{reading.value} <span className="text-xs font-normal text-[#89859B]">mg/dL</span></td>
                          <td className="py-4 text-right">
                            <span className="rounded-full bg-[#EAF7F0] px-3 py-1.5 text-[11px] font-bold text-emerald-700">
                              In range
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            <section className="rounded-2xl border border-[#EEEAF7] bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0EDFF] text-[#8874F5]">
                <Activity size={26} />
              </div>
              <h3 className="mt-4 text-lg font-bold">{activePage}</h3>
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
            Sweety · Glucose tracking made simpler
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
