import Link from 'next/link'
import { ArrowRight, Play, Eye, Trash2, Clock } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen gradient-radial">
      {/* Decorative blurs */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-[var(--accent-primary)] opacity-[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-[var(--accent-secondary)] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl text-[var(--text-primary)]">
            Story<span className="text-[var(--accent-primary)]">Check</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn btn-ghost">
              Sign in
            </Link>
            <Link href="/signup" className="btn btn-primary">
              Get started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center stagger">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            Monitoring stories 24/7
          </div>

          <h1 className="font-display text-5xl md:text-7xl text-[var(--text-primary)] leading-[1.1] mb-6">
            Never miss an
            <br />
            <span className="text-[var(--accent-primary)]">Instagram story</span>
          </h1>

          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Automatically capture and archive stories from your favorite creators,
            influencers, and competitors. Review them on your own time.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/signup" className="btn btn-primary h-14 px-8 text-base font-semibold">
              Start monitoring
              <ArrowRight size={18} />
            </Link>
            <button className="btn btn-secondary h-14 px-8 text-base">
              <Play size={18} />
              Watch demo
            </button>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="card p-2 overflow-hidden">
            <div className="bg-[var(--bg-tertiary)] rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
              {/* Mock Dashboard Preview */}
              <div className="absolute inset-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
                {/* Mock sidebar */}
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-[var(--bg-tertiary)] border-r border-[var(--border-subtle)]" />

                {/* Mock content */}
                <div className="ml-16 p-6">
                  <div className="flex gap-4 mb-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-20 h-32 rounded-lg bg-[var(--bg-elevated)] animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                  <div className="h-4 w-48 bg-[var(--bg-elevated)] rounded mb-3" />
                  <div className="h-3 w-32 bg-[var(--bg-tertiary)] rounded" />
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-[var(--text-primary)] mb-4">
              Everything you need
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">
              Powerful features to keep you on top of every story
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger">
            <div className="card p-8">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center mb-6">
                <Clock className="text-[var(--accent-primary)]" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                Scheduled captures
              </h3>
              <p className="text-[var(--text-secondary)]">
                Set it and forget it. Our agent runs daily to capture stories from all your tracked accounts.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 rounded-xl bg-[var(--success)]/10 flex items-center justify-center mb-6">
                <Eye className="text-[var(--success)]" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                Review at your pace
              </h3>
              <p className="text-[var(--text-secondary)]">
                Stories disappear in 24 hours. Ours don&apos;t. Review and mark them as seen whenever you want.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 rounded-xl bg-[var(--info)]/10 flex items-center justify-center mb-6">
                <Trash2 className="text-[var(--info)]" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                Stay organized
              </h3>
              <p className="text-[var(--text-secondary)]">
                Mark stories as reviewed, delete what you don&apos;t need. Keep your archive clean and useful.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 to-transparent" />
            <div className="relative">
              <h2 className="font-display text-4xl text-[var(--text-primary)] mb-4">
                Ready to start?
              </h2>
              <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-lg mx-auto">
                Join thousands of marketers and creators who never miss a story.
              </p>
              <Link href="/signup" className="btn btn-primary h-14 px-10 text-base font-semibold">
                Create free account
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[var(--border-subtle)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-[var(--text-muted)] text-sm">
            © 2024 StoryCheck. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[var(--text-muted)] text-sm">
            <Link href="#" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[var(--text-secondary)] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
