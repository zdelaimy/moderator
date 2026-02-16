import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background noise">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 border border-primary/60 rotate-45 flex items-center justify-center">
              <div className="w-3 h-3 bg-primary rotate-0" />
            </div>
            <span className="text-2xl font-serif text-foreground tracking-wide">Moderator</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground-dim hover:text-foreground transition-colors tracking-wide uppercase"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 text-sm font-medium text-background bg-primary hover:bg-primary-light transition-colors tracking-wide uppercase"
            >
              Access
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-6 grid-bg overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-24 left-8 w-px h-48 bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-fade-in" style={{ animationDelay: '0.6s' }} />
        <div className="absolute top-32 right-12 w-32 h-32 border border-primary/10 rotate-45 animate-fade-in" style={{ animationDelay: '0.8s' }} />
        <div className="absolute bottom-20 left-1/4 w-64 h-px bg-gradient-to-r from-transparent via-border-light to-transparent animate-fade-in" style={{ animationDelay: '1s' }} />

        <div className="mx-auto max-w-5xl relative z-10">
          {/* Classification tag */}
          <div className="animate-fade-up flex items-center gap-3 mb-12" style={{ animationDelay: '0.1s' }}>
            <div className="h-px w-12 bg-primary/40" />
            <span className="text-xs font-mono text-primary tracking-[0.3em] uppercase">Classified Talent Network</span>
          </div>

          <h1 className="animate-fade-up font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] text-foreground" style={{ animationDelay: '0.2s' }}>
            Nuclear talent solutions
            <br />
            <span className="text-gold-gradient">for the intelligence</span>
            <br />
            era
          </h1>

          <div className="mt-12 max-w-xl animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-lg text-foreground-dim leading-relaxed">
              Connecting cleared professionals with organizations that
              require discretion, expertise, and proven operational capability.
            </p>
          </div>

          <div className="mt-12 flex items-center gap-6 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <Link
              href="/signup?role=candidate"
              className="group relative px-8 py-4 bg-primary text-white text-sm font-medium tracking-wide uppercase hover:bg-primary-light transition-all duration-300"
            >
              <span className="relative z-10">Find Positions</span>
            </Link>
            <Link
              href="/signup?role=employer"
              className="group px-8 py-4 border border-border-light text-foreground-dim text-sm font-medium tracking-wide uppercase hover:border-primary hover:text-primary transition-all duration-300"
            >
              Source Talent
            </Link>
          </div>

          {/* Stats bar */}
          <div className="mt-24 pt-8 border-t border-border flex gap-16 animate-fade-up" style={{ animationDelay: '0.7s' }}>
            {[
              { value: 'TS/SCI', label: 'Clearance Levels' },
              { value: '4', label: 'NRC Regions' },
              { value: '6+', label: 'Certification Types' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-serif text-primary">{stat.value}</p>
                <p className="text-xs text-muted tracking-wide uppercase mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider line */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="h-px bg-border animate-line-expand origin-left" style={{ animationDelay: '0.9s' }} />
      </div>

      {/* How It Works */}
      <section className="py-28 px-6 relative">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-4 mb-20">
            <span className="text-xs font-mono text-muted tracking-[0.3em] uppercase">Process</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid md:grid-cols-2 gap-20">
            {/* Candidates */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-2 h-2 bg-primary" />
                <h3 className="text-sm font-medium text-primary tracking-[0.2em] uppercase">For Operators</h3>
              </div>
              <div className="space-y-10">
                {[
                  { num: '01', title: 'Establish Your Dossier', desc: 'Certifications, clearance level, plant experience, and operational availability.' },
                  { num: '02', title: 'Review Opportunities', desc: 'Filtered by contract type, plant type, NRC region, and security requirements.' },
                  { num: '03', title: 'Engage Directly', desc: 'Submit applications with tracked status and direct employer communication.' },
                ].map((item) => (
                  <div key={item.num} className="group flex gap-6">
                    <span className="text-xs font-mono text-primary/40 pt-1 group-hover:text-primary transition-colors">{item.num}</span>
                    <div>
                      <h4 className="text-foreground font-medium mb-2">{item.title}</h4>
                      <p className="text-sm text-foreground-dim leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Employers */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-2 h-2 bg-foreground-dim" />
                <h3 className="text-sm font-medium text-foreground-dim tracking-[0.2em] uppercase">For Organizations</h3>
              </div>
              <div className="space-y-10">
                {[
                  { num: '01', title: 'Register Your Facility', desc: 'Company profile with project scope, facility details, and operational requirements.' },
                  { num: '02', title: 'Define Requirements', desc: 'Certifications, clearance levels, contract terms, and compensation parameters.' },
                  { num: '03', title: 'Evaluate & Deploy', desc: 'Review candidate dossiers, update application status, and make selections.' },
                ].map((item) => (
                  <div key={item.num} className="group flex gap-6">
                    <span className="text-xs font-mono text-muted/40 pt-1 group-hover:text-muted transition-colors">{item.num}</span>
                    <div>
                      <h4 className="text-foreground font-medium mb-2">{item.title}</h4>
                      <p className="text-sm text-foreground-dim leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clearances section */}
      <section className="py-20 px-6 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-4 mb-16">
            <span className="text-xs font-mono text-muted tracking-[0.3em] uppercase">Supported Domains</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['SRO', 'RO', 'NRC', 'ANSI', 'HP', 'RP'].map((cert) => (
              <div
                key={cert}
                className="group border border-border hover:border-primary/40 p-6 text-center transition-all duration-300 hover:glow-gold"
              >
                <span className="text-xl font-mono text-foreground group-hover:text-primary transition-colors">{cert}</span>
                <div className="mt-2 h-px w-6 mx-auto bg-border group-hover:bg-primary/40 group-hover:w-full transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="mx-auto max-w-3xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif italic text-foreground leading-tight">
            Access the network
          </h2>
          <p className="mt-6 text-foreground-dim max-w-md mx-auto">
            Vetted professionals. Cleared facilities. Secure connections across all four NRC regions.
          </p>
          <div className="mt-10">
            <Link
              href="/signup"
              className="inline-block px-10 py-4 bg-primary text-white text-sm font-medium tracking-wide uppercase hover:bg-primary-light transition-all duration-300"
            >
              Request Access
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border border-primary/40 rotate-45 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary/60" />
            </div>
            <span className="text-sm font-serif text-foreground-dim">Moderator</span>
          </div>
          <p className="text-xs text-muted tracking-wide">
            &copy; {new Date().getFullYear()} Moderator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
