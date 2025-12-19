'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Users,
  Image,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Handles', href: '/dashboard/handles', icon: Users },
  { name: 'Stories', href: '/dashboard/stories', icon: Image },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = user.email?.slice(0, 2).toUpperCase() || 'U'

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] flex flex-col">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center border-b border-[var(--border-subtle)]">
        <Link href="/dashboard" className="font-display text-xl text-[var(--text-primary)]">
          Story<span className="text-[var(--accent-primary)]">Check</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              <item.icon size={18} />
              {item.name}
              {isActive && <ChevronRight size={16} className="ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--bg-tertiary)]">
          <div className="avatar text-xs">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {user.email}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Free plan
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--error)] transition-all"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
