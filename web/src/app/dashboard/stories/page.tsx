'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Search,
  Filter,
  Check,
  Trash2,
  X,
  Image as ImageIcon,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react'

interface StoryCapture {
  id: string
  media_type: string
  storage_path: string | null
  media_url: string | null
  captured_at: string
  posted_at: string
  review_status: 'pending' | 'approved' | 'rejected'
  influencer: {
    ig_handle: string
  }
}

export default function StoriesPage() {
  const searchParams = useSearchParams()
  const [stories, setStories] = useState<StoryCapture[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all')
  const [selectedStory, setSelectedStory] = useState<StoryCapture | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    fetchStories()
  }, [statusFilter])

  const fetchStories = async () => {
    setLoading(true)
    let query = supabase
      .from('story_captures')
      .select(`
        id,
        media_type,
        storage_path,
        media_url,
        captured_at,
        posted_at,
        review_status,
        influencer:influencers(ig_handle)
      `)
      .order('captured_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('review_status', statusFilter)
    }

    const { data, error } = await query

    if (!error && data) {
      setStories(data as unknown as StoryCapture[])
    }
    setLoading(false)
  }

  const markAsSeen = async (ids: string[]) => {
    const { error } = await supabase
      .from('story_captures')
      .update({ review_status: 'approved' })
      .in('id', ids)

    if (!error) {
      setStories(stories.map(s =>
        ids.includes(s.id) ? { ...s, review_status: 'approved' as const } : s
      ))
      setSelectedIds(new Set())
    }
  }

  const deleteStories = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} story(s)?`)) return

    const { error } = await supabase
      .from('story_captures')
      .delete()
      .in('id', ids)

    if (!error) {
      setStories(stories.filter(s => !ids.includes(s.id)))
      setSelectedIds(new Set())
      if (selectedStory && ids.includes(selectedStory.id)) {
        setSelectedStory(null)
      }
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAll = () => {
    if (selectedIds.size === filteredStories.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredStories.map(s => s.id)))
    }
  }

  const filteredStories = stories.filter(s =>
    s.influencer?.ig_handle?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const navigateStory = (direction: 'prev' | 'next') => {
    if (!selectedStory) return
    const currentIndex = filteredStories.findIndex(s => s.id === selectedStory.id)
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    if (newIndex >= 0 && newIndex < filteredStories.length) {
      setSelectedStory(filteredStories[newIndex])
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            Stories
          </h1>
          <p className="text-[var(--text-secondary)]">
            View and manage captured Instagram stories
          </p>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--text-secondary)]">
              {selectedIds.size} selected
            </span>
            <button
              onClick={() => markAsSeen(Array.from(selectedIds))}
              className="btn btn-secondary"
            >
              <Check size={16} />
              Mark as seen
            </button>
            <button
              onClick={() => deleteStories(Array.from(selectedIds))}
              className="btn btn-secondary hover:bg-[var(--error)]/10 hover:text-[var(--error)] hover:border-[var(--error)]/20"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[var(--text-muted)]" />
          {['all', 'pending', 'approved'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[var(--text-muted)]" size={32} />
        </div>
      ) : filteredStories.length > 0 ? (
        <>
          {/* Select all */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={selectAll}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {selectedIds.size === filteredStories.length ? 'Deselect all' : 'Select all'}
            </button>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="text-sm text-[var(--text-muted)]">
              {filteredStories.length} stories
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className={`story-card bg-[var(--bg-tertiary)] group ${
                  selectedIds.has(story.id) ? 'ring-2 ring-[var(--accent-primary)]' : ''
                }`}
                onClick={() => setSelectedStory(story)}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSelect(story.id)
                  }}
                  className={`absolute top-2 left-2 z-20 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                    selectedIds.has(story.id)
                      ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
                      : 'border-white/50 bg-black/30 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {selectedIds.has(story.id) && <Check size={14} className="text-black" />}
                </button>

                {/* Status badge */}
                {story.review_status === 'pending' && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="badge badge-warning">New</span>
                  </div>
                )}
                {story.review_status === 'approved' && (
                  <div className="absolute top-2 right-2 z-10">
                    <Eye size={14} className="text-[var(--success)]" />
                  </div>
                )}

                {/* Placeholder image */}
                <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)]">
                  <ImageIcon size={32} />
                </div>

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                  <p className="text-xs font-medium text-white truncate">
                    @{story.influencer?.ig_handle || 'unknown'}
                  </p>
                  <p className="text-xs text-white/60 flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(story.captured_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={24} className="text-[var(--text-muted)]" />
          </div>
          <h3 className="text-[var(--text-primary)] font-medium mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No stories found' : 'No stories yet'}
          </h3>
          <p className="text-[var(--text-secondary)] text-sm">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Stories will appear here once the agent captures them'}
          </p>
        </div>
      )}

      {/* Story Detail Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          {/* Close button */}
          <button
            onClick={() => setSelectedStory(null)}
            className="absolute top-4 right-4 text-white/60 hover:text-white z-10"
          >
            <X size={24} />
          </button>

          {/* Navigation */}
          <button
            onClick={() => navigateStory('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => navigateStory('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight size={24} />
          </button>

          {/* Story content */}
          <div className="max-w-sm w-full animate-scale-in">
            <div className="aspect-[9/16] rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4 overflow-hidden">
              <ImageIcon size={48} className="text-[var(--text-muted)]" />
            </div>

            {/* Info */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-medium">
                  @{selectedStory.influencer?.ig_handle}
                </p>
                <p className="text-white/60 text-sm">
                  {new Date(selectedStory.captured_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedStory.review_status === 'pending' && (
                  <button
                    onClick={() => markAsSeen([selectedStory.id])}
                    className="btn btn-primary"
                  >
                    <Check size={16} />
                    Mark as seen
                  </button>
                )}
                <button
                  onClick={() => deleteStories([selectedStory.id])}
                  className="btn btn-secondary hover:bg-[var(--error)]/10 hover:text-[var(--error)]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
