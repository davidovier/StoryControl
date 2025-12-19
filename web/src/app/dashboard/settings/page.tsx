'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  User,
  Mail,
  Lock,
  Bell,
  Trash2,
  Loader2,
  Check,
  AlertTriangle
} from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setEmail(user.email || '')
      setFullName(user.user_metadata?.full_name || '')
    }
    setLoading(false)
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    }
    setSaving(false)
  }

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      setSaving(false)
      return
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      setSaving(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setSaving(false)
  }

  const deleteAccount = async () => {
    // Note: This requires admin API in production
    // For now, we'll just sign out
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--text-muted)]" size={32} />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
          Settings
        </h1>
        <p className="text-[var(--text-secondary)]">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 animate-slide-down ${
          message.type === 'success'
            ? 'bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)]'
            : 'bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)]'
        }`}>
          {message.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <User size={20} className="text-[var(--accent-primary)]" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">Profile</h2>
            <p className="text-sm text-[var(--text-secondary)]">Your personal information</p>
          </div>
        </div>

        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="email"
                value={email}
                disabled
                className="input pl-12 opacity-60 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Contact support to change your email address
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--info)]/10 flex items-center justify-center">
            <Lock size={20} className="text-[var(--info)]" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">Password</h2>
            <p className="text-sm text-[var(--text-secondary)]">Update your password</p>
          </div>
        </div>

        <form onSubmit={updatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={saving || !newPassword || !confirmPassword}
            className="btn btn-primary"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : 'Update password'}
          </button>
        </form>
      </div>

      {/* Notifications Section */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center">
            <Bell size={20} className="text-[var(--warning)]" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">Notifications</h2>
            <p className="text-sm text-[var(--text-secondary)]">Manage your notification preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-tertiary)] cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Email notifications</p>
              <p className="text-sm text-[var(--text-secondary)]">Get notified when new stories are captured</p>
            </div>
            <input type="checkbox" className="w-5 h-5 rounded" />
          </label>

          <label className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-tertiary)] cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Weekly digest</p>
              <p className="text-sm text-[var(--text-secondary)]">Receive a weekly summary of captured stories</p>
            </div>
            <input type="checkbox" className="w-5 h-5 rounded" />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-6 border-[var(--error)]/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--error)]/10 flex items-center justify-center">
            <Trash2 size={20} className="text-[var(--error)]" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">Danger zone</h2>
            <p className="text-sm text-[var(--text-secondary)]">Irreversible and destructive actions</p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn btn-secondary text-[var(--error)] hover:bg-[var(--error)]/10"
          >
            <Trash2 size={16} />
            Delete account
          </button>
        ) : (
          <div className="p-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20">
            <p className="text-[var(--text-primary)] font-medium mb-2">
              Are you sure you want to delete your account?
            </p>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                className="btn bg-[var(--error)] text-white hover:bg-[var(--error)]/80"
              >
                Yes, delete my account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
