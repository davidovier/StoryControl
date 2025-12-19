import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Image, Clock, TrendingUp, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch stats
  const [
    { count: handleCount },
    { count: storyCount },
    { count: pendingCount }
  ] = await Promise.all([
    supabase.from('influencers').select('*', { count: 'exact', head: true }),
    supabase.from('story_captures').select('*', { count: 'exact', head: true }),
    supabase.from('story_captures').select('*', { count: 'exact', head: true }).eq('review_status', 'pending')
  ])

  const stats = [
    {
      label: 'Tracked Handles',
      value: handleCount || 0,
      icon: Users,
      color: 'var(--accent-primary)',
      href: '/dashboard/handles'
    },
    {
      label: 'Total Captures',
      value: storyCount || 0,
      icon: Image,
      color: 'var(--info)',
      href: '/dashboard/stories'
    },
    {
      label: 'Pending Review',
      value: pendingCount || 0,
      icon: Clock,
      color: 'var(--warning)',
      href: '/dashboard/stories?status=pending'
    },
    {
      label: 'This Week',
      value: 0,
      icon: TrendingUp,
      color: 'var(--success)',
      href: '/dashboard/stories'
    },
  ]

  // Fetch recent captures
  const { data: recentCaptures } = await supabase
    .from('story_captures')
    .select(`
      id,
      media_type,
      storage_path,
      captured_at,
      review_status,
      influencer:influencers(ig_handle)
    `)
    .order('captured_at', { ascending: false })
    .limit(6)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
          Dashboard
        </h1>
        <p className="text-[var(--text-secondary)]">
          Overview of your story monitoring activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card p-6 group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <ArrowRight
                size={16}
                className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <p className="text-3xl font-semibold text-[var(--text-primary)] mb-1">
              {stat.value.toLocaleString()}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent Captures */}
      <div className="card">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2 className="font-semibold text-[var(--text-primary)]">
            Recent Captures
          </h2>
          <Link
            href="/dashboard/stories"
            className="text-sm text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors flex items-center gap-1"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentCaptures && recentCaptures.length > 0 ? (
          <div className="p-6 grid grid-cols-6 gap-4">
            {recentCaptures.map((capture) => (
              <div key={capture.id} className="story-card bg-[var(--bg-tertiary)]">
                <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)]">
                  <Image size={24} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                  <p className="text-xs font-medium text-white truncate">
                    @{(capture.influencer as unknown as { ig_handle: string } | null)?.ig_handle || 'unknown'}
                  </p>
                  <p className="text-xs text-white/60">
                    {new Date(capture.captured_at).toLocaleDateString()}
                  </p>
                </div>
                {capture.review_status === 'pending' && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="badge badge-warning">New</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-4">
              <Image size={24} className="text-[var(--text-muted)]" />
            </div>
            <h3 className="text-[var(--text-primary)] font-medium mb-2">
              No captures yet
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              Add some handles to start capturing stories
            </p>
            <Link href="/dashboard/handles" className="btn btn-primary">
              Add handles
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
