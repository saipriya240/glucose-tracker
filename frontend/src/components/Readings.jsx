
import { useEffect, useState } from 'react'
import { Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { readingsAPI } from '../services/api'

const slots = [
  { value: 'MORNING', label: 'Morning (Fasting)' },
  { value: 'AFTER_BREAKFAST', label: 'After Breakfast' },
  { value: 'AFTER_LUNCH', label: 'After Lunch' },
  { value: 'AFTER_DINNER', label: 'After Dinner' },
]

function getLocalISODate() {
  const now = new Date()
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getSlotLabel(slot) {
  return slots.find((item) => item.value === slot)?.label || slot
}

function getStatus(value, targetLow, targetHigh) {
  if (value < targetLow) return 'Below range'
  if (value > targetHigh) return 'Above range'
  return 'In range'
}

export default function Readings({ user }) {
  const targetLow = user?.target_low ?? 70
  const targetHigh = user?.target_high ?? 180

  const [readings, setReadings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  const [form, setForm] = useState({
    reading_date: getLocalISODate(),
    slot: 'MORNING',
    glucose_value: '',
  })

  async function loadReadings() {
    setLoading(true)
    setError('')

    try {
      const data = await readingsAPI.getAll()
      setReadings(Array.isArray(data) ? data : data?.results || [])
    } catch (err) {
      setError(err.message || 'Could not load readings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReadings()
  }, [])

  function resetForm() {
    setForm({
      reading_date: getLocalISODate(),
      slot: 'MORNING',
      glucose_value: '',
    })
    setEditingId(null)
    setFormOpen(false)
    setError('')
  }

  function startEdit(reading) {
    setForm({
      reading_date: reading.reading_date,
      slot: reading.slot,
      glucose_value: String(reading.glucose_value),
    })
    setEditingId(reading.id)
    setFormOpen(true)
    setError('')
    setSuccess('')
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const value = Number(form.glucose_value)

    if (!form.reading_date) {
      setError('Please select a reading date.')
      return
    }

    if (!Number.isInteger(value) || value < 40 || value > 600) {
      setError('Enter a whole-number glucose value between 40 and 600.')
      return
    }

    setSaving(true)

    const payload = {
      reading_date: form.reading_date,
      slot: form.slot,
      glucose_value: value,
    }

    try {
      if (editingId !== null) {
        await readingsAPI.update(editingId, payload)
        setSuccess('Reading updated successfully.')
      } else {
        await readingsAPI.create(payload)
        setSuccess('Reading added successfully.')
      }

      resetForm()
      await loadReadings()
    } catch (err) {
      setError(err.message || 'Could not save this reading.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this reading? This cannot be undone.'
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      await readingsAPI.delete(id)
      setReadings((current) => current.filter((reading) => reading.id !== id))
      setSuccess('Reading deleted successfully.')

      if (editingId === id) resetForm()
    } catch (err) {
      setError(err.message || 'Could not delete this reading.')
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-extrabold">Your glucose readings</h2>
          <p className="mt-1 text-sm text-[#89859B]">
            Add, review and manage your recorded readings.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadReadings}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#EEEAF7] bg-white px-4 py-3 text-sm font-semibold text-[#625D76] hover:bg-[#F8F6FF] disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={() => {
              resetForm()
              setFormOpen(true)
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#8874F5] px-4 py-3 text-sm font-bold text-white hover:bg-[#715CE5]"
          >
            <Plus size={17} />
            Add reading
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {formOpen && (
        <section className="mb-6 rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold">
                {editingId !== null ? 'Edit reading' : 'Add a new reading'}
              </h3>
              <p className="mt-1 text-xs text-[#89859B]">
                Enter the details recorded by your glucose meter.
              </p>
            </div>

            <button
              onClick={resetForm}
              aria-label="Close form"
              className="rounded-lg p-2 text-[#89859B] hover:bg-[#F5F2FC]"
            >
              <X size={19} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-semibold text-[#625D76]">
              Reading date
              <input
                type="date"
                name="reading_date"
                value={form.reading_date}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-xl border border-[#E8E3F1] bg-white px-3 py-3 text-sm outline-none focus:border-[#8874F5]"
              />
            </label>

            <label className="text-sm font-semibold text-[#625D76]">
              Reading slot
              <select
                name="slot"
                value={form.slot}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-xl border border-[#E8E3F1] bg-white px-3 py-3 text-sm outline-none focus:border-[#8874F5]"
              >
                {slots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-[#625D76]">
              Glucose value (mg/dL)
              <input
                type="number"
                name="glucose_value"
                min="40"
                max="600"
                step="1"
                value={form.glucose_value}
                onChange={handleChange}
                placeholder="e.g. 110"
                required
                className="mt-2 w-full rounded-xl border border-[#E8E3F1] bg-white px-3 py-3 text-sm outline-none focus:border-[#8874F5]"
              />
            </label>

            <div className="flex flex-wrap gap-2 sm:col-span-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#8874F5] px-5 py-3 text-sm font-bold text-white hover:bg-[#715CE5] disabled:opacity-50"
              >
                {saving
                  ? 'Saving...'
                  : editingId !== null
                    ? 'Save changes'
                    : 'Save reading'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-[#EEEAF7] px-5 py-3 text-sm font-semibold text-[#625D76] hover:bg-[#F8F6FF]"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#EEEAF7] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#F0EDF6] px-5 py-4">
          <div>
            <h3 className="font-bold">All readings</h3>
            <p className="mt-1 text-xs text-[#89859B]">
              {readings.length} {readings.length === 1 ? 'record' : 'records'} stored in your account
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-[#89859B]">
            Loading your readings...
          </div>
        ) : readings.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-[#625D76]">No readings yet</p>
            <p className="mt-2 text-sm text-[#89859B]">
              Add your first glucose reading to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-[#F0EDF6] text-[11px] font-semibold uppercase tracking-wider text-[#A09BAF]">
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Reading slot</th>
                  <th className="px-5 py-4 text-right">Glucose value</th>
                  <th className="px-5 py-4 text-right">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((reading) => {
                  const status = getStatus(
                    reading.glucose_value,
                    targetLow,
                    targetHigh
                  )

                  const statusClass =
                    status === 'In range'
                      ? 'bg-emerald-50 text-emerald-700'
                      : status === 'Below range'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'

                  return (
                    <tr
                      key={reading.id}
                      className="border-b border-[#F5F2F9] last:border-0"
                    >
                      <td className="px-5 py-4 text-sm font-medium">
                        {formatDate(reading.reading_date)}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#89859B]">
                        {getSlotLabel(reading.slot)}
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-bold">
                        {reading.glucose_value}{' '}
                        <span className="text-xs font-normal text-[#89859B]">
                          mg/dL
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${statusClass}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEdit(reading)}
                            aria-label="Edit reading"
                            className="rounded-lg p-2 text-[#8874F5] hover:bg-[#F3F0FF]"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(reading.id)}
                            aria-label="Delete reading"
                            className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
