'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen gradient-radial flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-scale-in">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--success)]/10 flex items-center justify-center mx-auto mb-6">
              <Check className="text-[var(--success)]" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
              Check your email
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              We&apos;ve sent a confirmation link to <strong className="text-[var(--text-primary)]">{email}</strong>
            </p>
            <Link href="/login" className="btn btn-secondary">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-radial flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-[var(--accent-primary)] opacity-5 blur-[120px] rounded-full" />
      <div className="fixed bottom-0 left-1/4 w-80 h-80 bg-[var(--accent-secondary)] opacity-5 blur-[100px] rounded-full" />

      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <h1 className="font-display text-4xl text-[var(--text-primary)] mb-2">
              Story<span className="text-[var(--accent-primary)]">Check</span>
            </h1>
          </Link>
          <p className="text-[var(--text-tertiary)] text-sm">
            Start monitoring stories in minutes
          </p>
        </div>

        {/* Signup Card */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
            Create your account
          </h2>

          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] text-sm animate-slide-down">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
                placeholder="John Doe"
                required
              />
            </div>

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
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-12"
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Must be at least 8 characters
              </p>
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
                  Create account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] text-center">
            <p className="text-[var(--text-tertiary)] text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[var(--text-muted)] text-xs mt-8">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
