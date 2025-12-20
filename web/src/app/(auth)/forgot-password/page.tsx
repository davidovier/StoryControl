'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowRight, Loader2, Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
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
                Check your email
              </h2>
              <p className="text-[var(--text-secondary)] mb-6">
                We&apos;ve sent a password reset link to <strong className="text-[var(--text-primary)]">{email}</strong>
              </p>
              <Link href="/login" className="btn btn-primary w-full h-12">
                <ArrowLeft size={18} />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
                  <Mail size={20} className="text-[var(--accent-primary)]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                    Forgot password?
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm">
                    No worries, we&apos;ll send you reset instructions
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
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="you@example.com"
                    required
                    autoFocus
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
                      Send reset link
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
                >
                  <ArrowLeft size={16} />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
