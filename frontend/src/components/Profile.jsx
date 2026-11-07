
import { useEffect, useState } from 'react'
import {
  UserRound,
  Settings,
  Save,
  RotateCcw,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react'
import { authAPI } from '../services/api'

export default function Profile({
  user,
  activeSection = 'Profile',
  onProfileUpdated,
}) {
  const [targetLow, setTargetLow] = useState(user.target_low ?? 70)
  const [targetHigh, setTargetHigh] = useState(user.target_high ?? 180)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setTargetLow(user.target_low ?? 70)
    setTargetHigh(user.target_high ?? 180)
  }, [user.target_low, user.target_high])

  async function handleSave(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const low = Number(targetLow)
    const high = Number(targetHigh)

    if (!Number.isInteger(low) || low < 40 || low > 500) {
      setError('Minimum target must be a whole number between 40 and 500.')
      return
    }

    if (!Number.isInteger(high) || high < 60 || high > 600) {
      setError('Maximum target must be a whole number between 60 and 600.')
      return
    }

    if (low >= high) {
      setError('Maximum target must be greater than minimum target.')
      return
    }

    setSaving(true)

    try {
      const updatedProfile = await authAPI.updateProfile({
        target_low: low,
        target_high: high,
      })

      onProfileUpdated?.(updatedProfile)
      setSuccess('Your glucose target settings have been saved.')
    } catch (err) {
      setError(err.message || 'Unable to save your settings.')
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setTargetLow(user.target_low ?? 70)
    setTargetHigh(user.target_high ?? 180)
    setError('')
    setSuccess('')
  }

  const isSettings = false

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#29263A]">
          {isSettings ? 'Settings' : 'Your Profile'}
        </h2>
        <p className="mt-2 text-sm text-[#89859B]">
          {isSettings
            ? 'Manage your personal glucose tracking preferences.'
            : 'View your account information and personal details.'}
        </p>
      </div>

      {!isSettings && (
        <section className="rounded-2xl border border-[#EEEAF7] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0EDFF] text-2xl font-extrabold text-[#8874F5]">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#29263A]">
                {user.username}
              </h3>
              <p className="mt-1 text-sm text-[#89859B]">
                Gluco personal account
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#89859B]">
                Username
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-[#EEEAF7] bg-[#FAF9FE] px-4 py-3">
                <UserRound size={18} className="text-[#8874F5]" />
                <span className="text-sm font-medium">
                  {user.username}
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#89859B]">
                Email address
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-[#EEEAF7] bg-[#FAF9FE] px-4 py-3">
                <ShieldCheck size={18} className="text-[#8874F5]" />
                <span className="break-all text-sm font-medium">
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-[#EEEAF7] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#F0EDFF] p-3 text-[#8874F5]">
            {isSettings ? <Settings size={21} /> : <HeartPulse size={21} />}
          </div>

          <div>
            <h3 className="font-bold text-[#29263A]">
              Glucose target range
            </h3>
            <p className="mt-1 text-xs text-[#89859B]">
              Configure the range used in your tracking summaries.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="targetLow"
                className="mb-2 block text-sm font-semibold text-[#625D76]"
              >
                Minimum target (mg/dL)
              </label>

              <input
                id="targetLow"
                type="number"
                min="40"
                max="500"
                step="1"
                required
                value={targetLow}
                onChange={(event) => {
                  setTargetLow(event.target.value)
                  setError('')
                  setSuccess('')
                }}
                className="w-full rounded-xl border border-[#EEEAF7] bg-[#FAF9FE] px-4 py-3 text-sm font-bold outline-none transition focus:border-[#8874F5] focus:ring-2 focus:ring-[#8874F5]/10"
              />

              <p className="mt-2 text-xs text-[#89859B]">
                Allowed range: 40–500
              </p>
            </div>

            <div>
              <label
                htmlFor="targetHigh"
                className="mb-2 block text-sm font-semibold text-[#625D76]"
              >
                Maximum target (mg/dL)
              </label>

              <input
                id="targetHigh"
                type="number"
                min="60"
                max="600"
                step="1"
                required
                value={targetHigh}
                onChange={(event) => {
                  setTargetHigh(event.target.value)
                  setError('')
                  setSuccess('')
                }}
                className="w-full rounded-xl border border-[#EEEAF7] bg-[#FAF9FE] px-4 py-3 text-sm font-bold outline-none transition focus:border-[#8874F5] focus:ring-2 focus:ring-[#8874F5]/10"
              />

              <p className="mt-2 text-xs text-[#89859B]">
                Allowed range: 60–600
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-[#F8F6FF] p-4">
            <p className="text-xs font-semibold text-[#625D76]">
              Your configured range
            </p>
            <p className="mt-2 text-2xl font-extrabold text-[#8874F5]">
              {targetLow || '—'} – {targetHigh || '—'} mg/dL
            </p>
          </div>

          {error && (
            <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#8874F5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#715CE5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />
              {saving ? 'Saving...' : 'Save settings'}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl border border-[#EEEAF7] px-5 py-3 text-sm font-bold text-[#625D76] transition hover:bg-[#FAF9FE]"
            >
              <RotateCcw size={16} />
              Reset changes
            </button>
          </div>
        </form>

        <p className="mt-6 text-xs leading-5 text-[#89859B]">
          These settings control how Gluco categorizes your recorded readings.
          They are tracking preferences, not medical recommendations.
        </p>
      </section>
    </div>
  )
}
