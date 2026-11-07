
import { useState } from 'react'
import { Activity, HeartPulse, Mail, Lock, UserRound } from 'lucide-react'
import { authAPI } from '../services/api'

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isRegister = mode === 'register'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      if (isRegister) {
        await authAPI.register({
          username: username.trim(),
          email: email.trim(),
          password,
        })
      }

      await authAPI.login(username.trim(), password)
      const profile = await authAPI.getProfile()

      onAuthenticated(profile)
    } catch (err) {
      setError(err.message || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF9FE] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8874F5] text-white shadow-lg shadow-[#8874F5]/20">
            <HeartPulse size={30} />
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#29263A]">
            Gluco
          </h1>

          <p className="mt-1 text-xs font-semibold tracking-[3px] text-[#A39BBE]">
            GLUCOSE CARE
          </p>
        </div>

        <div className="rounded-3xl border border-[#EEEAF7] bg-white p-7 shadow-sm sm:p-9">
          <div className="mb-7">
            <h2 className="text-2xl font-extrabold text-[#29263A]">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h2>

            <p className="mt-2 text-sm text-[#89859B]">
              {isRegister
                ? 'Create an account to start tracking your glucose readings.'
                : 'Sign in to access your personal glucose dashboard.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#625D76]">
                Username
              </label>

              <div className="flex items-center rounded-xl border border-[#EEEAF7] px-3 focus-within:border-[#8874F5]">
                <UserRound size={18} className="text-[#A39BBE]" />

                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                  className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#625D76]">
                  Email address
                </label>

                <div className="flex items-center rounded-xl border border-[#EEEAF7] px-3 focus-within:border-[#8874F5]">
                  <Mail size={18} className="text-[#A39BBE]" />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#625D76]">
                Password
              </label>

              <div className="flex items-center rounded-xl border border-[#EEEAF7] px-3 focus-within:border-[#8874F5]">
                <Lock size={18} className="text-[#A39BBE]" />

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  required
                  className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#625D76]">
                  Confirm password
                </label>

                <div className="flex items-center rounded-xl border border-[#EEEAF7] px-3 focus-within:border-[#8874F5]">
                  <Lock size={18} className="text-[#A39BBE]" />

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                  />
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8874F5] px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-[#8874F5]/20 transition hover:bg-[#715CE5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Activity size={18} />
              {loading
                ? 'Please wait...'
                : isRegister
                  ? 'Create account'
                  : 'Sign in'}
            </button>
          </form>

          <div className="mt-7 border-t border-[#F1EEF8] pt-6 text-center">
            <p className="text-sm text-[#89859B]">
              {isRegister
                ? 'Already have an account?'
                : "Don't have an account?"}

              <button
                type="button"
                onClick={() => {
                  setMode(isRegister ? 'login' : 'register')
                  setError('')
                  setPassword('')
                  setConfirmPassword('')
                }}
                className="ml-1 font-bold text-[#8874F5] hover:text-[#715CE5]"
              >
                {isRegister ? 'Sign in' : 'Create account'}
              </button>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#AAA5B9]">
          Gluco · Personal glucose tracking
        </p>
      </div>
    </div>
  )
}

export default Auth
