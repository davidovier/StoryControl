'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight, Loader2, Lock, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen gradient-radial flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[var(--accent-primary)] opacity-5 blur-[120px] rounded-full" />
      <div className="fixed bottom-0 right-1/4 w-80 h-80 bg-[var(--accent-secondary)] opacity-5 blur-[100px] rounded-full" />

      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="font-display text-4xl text-[var(--text-primary)] mb-2">
              Story<span className="text-[var(--accent-primary)]">Check</span>
            </h1>
          </Link>
          <p className="text-[var(--text-tertiary)] text-sm">
            Monitor Instagram stories effortlessly
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--success)]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-[var(--success)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Password updated!
              </h2>
              <p className="text-[var(--text-secondary)]">
                Redirecting you to your dashboard...
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
                  <Lock size={20} className="text-[var(--accent-primary)]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                    Set new password
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm">
                    Choose a strong password for your account
                  </p>
                </div>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] text-sm animate-slide-down">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pr-12"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Confirm new password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full h-12 text-base font-semibold"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Update password
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
