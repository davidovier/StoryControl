'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  Search,
  MoreVertical,
  Trash2,
  ExternalLink,
  Loader2,
  UserPlus,
  X
} from 'lucide-react'

interface Influencer {
  id: string
  ig_handle: string
  status: string
  created_at: string
  last_poll_at: string | null
}

export default function HandlesPage() {
  const [handles, setHandles] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newHandle, setNewHandle] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchHandles()
  }, [])

  const fetchHandles = async () => {
    const { data, error } = await supabase
      .from('influencers')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setHandles(data)
    }
    setLoading(false)
  }

  const addHandle = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    setError(null)

    const handle = newHandle.replace('@', '').trim().toLowerCase()

    if (!handle) {
      setError('Please enter a valid handle')
      setAdding(false)
      return
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in')
      setAdding(false)
      return
    }

    const { error } = await supabase.from('influencers').insert({
      ig_handle: handle,
      user_id: user.id
    })

    if (error) {
      if (error.code === '23505') {
        setError('This handle is already being tracked')
      } else {
        setError(error.message)
      }
    } else {
      setNewHandle('')
      setShowAddModal(false)
      fetchHandles()
    }
    setAdding(false)
  }

  const deleteHandle = async (id: string) => {
    if (!confirm('Are you sure you want to remove this handle?')) return

    const { error } = await supabase.from('influencers').delete().eq('id', id)

    if (!error) {
      setHandles(handles.filter(h => h.id !== id))
    }
  }

  const filteredHandles = handles.filter(h =>
    h.ig_handle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>
      case 'pending':
        return <span className="badge badge-warning">Pending</span>
      case 'inactive':
        return <span className="badge badge-error">Inactive</span>
      default:
        return <span className="badge">{status}</span>
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            Handles
          </h1>
          <p className="text-[var(--text-secondary)]">
            Manage Instagram accounts you&apos;re monitoring
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          Add handle
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search handles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-12"
        />
      </div>

      {/* Handles List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin mx-auto text-[var(--text-muted)]" size={24} />
          </div>
        ) : filteredHandles.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Handle</th>
                <th>Status</th>
                <th>Added</th>
                <th>Last Capture</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredHandles.map((handle) => (
                <tr key={handle.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                          <span className="text-xs font-medium text-[var(--text-primary)]">
                            {handle.ig_handle.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          @{handle.ig_handle}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>{getStatusBadge(handle.status)}</td>
                  <td className="text-[var(--text-secondary)]">
                    {new Date(handle.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-[var(--text-secondary)]">
                    {handle.last_poll_at
                      ? new Date(handle.last_poll_at).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`https://instagram.com/${handle.ig_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost p-2"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <button
                        onClick={() => deleteHandle(handle.id)}
                        className="btn btn-ghost p-2 hover:text-[var(--error)]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-4">
              <UserPlus size={24} className="text-[var(--text-muted)]" />
            </div>
            <h3 className="text-[var(--text-primary)] font-medium mb-2">
              {searchQuery ? 'No handles found' : 'No handles yet'}
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              {searchQuery
                ? 'Try a different search term'
                : 'Add Instagram handles to start monitoring stories'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                <Plus size={16} />
                Add your first handle
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Handle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="card p-6 w-full max-w-md relative animate-scale-in">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Add new handle
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              Enter an Instagram username to start monitoring their stories
            </p>

            <form onSubmit={addHandle}>
              {error && (
                <div className="p-3 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  @
                </span>
                <input
                  type="text"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  className="input pl-10"
                  placeholder="username"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding || !newHandle.trim()}
                  className="btn btn-primary flex-1"
                >
                  {adding ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Plus size={18} />
                      Add handle
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
