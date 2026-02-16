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
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-6 grid-bg overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-24 left-8 w-px h-48 bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-fade-in" style={{ animationDelay: '0.6s' }} />
        <div className="absolute bottom-20 left-1/4 w-64 h-px bg-gradient-to-r from-transparent via-border-light to-transparent animate-fade-in" style={{ animationDelay: '1s' }} />

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text content */}
            <div>
              <h1 className="animate-fade-up font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] text-foreground" style={{ animationDelay: '0.2s' }}>
                Nuclear talent solutions
                <br />
                for the{' '}
                <span className="text-gold-gradient">intelligence</span>
                <br />
                <span className="text-gold-gradient">era</span>
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

            {/* Right: Isometric geometric illustration */}
            <div className="hidden lg:block relative animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="relative w-full aspect-square max-w-lg ml-auto">
                <svg viewBox="0 60 520 520" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  {/*
                    Isometric coordinate helpers:
                    Right face: x+0.866, y+0.5 per unit
                    Left face:  x-0.866, y+0.5 per unit
                    Up:         x+0, y-1 per unit
                    Unit cube side = 52px
                  */}

                  {/* === BACK-LEFT TOWER (3 cubes tall) === */}
                  {/* Bottom cube */}
                  {/* Top face */}
                  <polygon points="130,270 175,244 220,270 175,296" fill="#f5f4eb" stroke="#1a1a18" strokeWidth="1.2" />
                  {/* Left face */}
                  <polygon points="130,270 175,296 175,348 130,322" fill="#8b6914" stroke="#1a1a18" strokeWidth="1.2" />
                  {/* Right face */}
                  <polygon points="220,270 175,296 175,348 220,322" fill="#6f5410" stroke="#1a1a18" strokeWidth="1.2" />

                  {/* Middle cube */}
                  <polygon points="130,218 175,192 220,218 175,244" fill="#f5f4eb" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="130,218 175,244 175,296 130,270" fill="#8b6914" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="220,218 175,244 175,296 220,270" fill="#6f5410" stroke="#1a1a18" strokeWidth="1.2" />

                  {/* Top cube */}
                  <polygon points="130,166 175,140 220,166 175,192" fill="#a67e1e" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="130,166 175,192 175,244 130,218" fill="#8b6914" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="220,166 175,244 175,192 220,218" fill="#6f5410" stroke="#1a1a18" strokeWidth="1.2" />

                  {/* === FRONT-CENTER CLUSTER (2x2 base, varied heights) === */}
                  {/* Row 1, Col 1 - single cube */}
                  <polygon points="220,322 265,296 310,322 265,348" fill="#f5f4eb" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="220,322 265,348 265,400 220,374" fill="#a67e1e" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="310,322 265,348 265,400 310,374" fill="#8b6914" stroke="#1a1a18" strokeWidth="1.2" />

                  {/* Row 1, Col 2 - two cubes tall */}
                  {/* Bottom */}
                  <polygon points="310,348 355,322 400,348 355,374" fill="#f5f4eb" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="310,348 355,374 355,426 310,400" fill="#6f5410" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="400,348 355,374 355,426 400,400" fill="#8b6914" stroke="#1a1a18" strokeWidth="1.2" />
                  {/* Top */}
                  <polygon points="310,296 355,270 400,296 355,322" fill="#a67e1e" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="310,296 355,322 355,374 310,348" fill="#8b6914" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="400,296 355,322 355,374 400,348" fill="#6f5410" stroke="#1a1a18" strokeWidth="1.2" />

                  {/* Row 2, Col 1 - three cubes tall (tallest element) */}
                  {/* Bottom */}
                  <polygon points="220,374 265,348 310,374 265,400" fill="#d6d4c8" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="220,374 265,400 265,452 220,426" fill="#8b6914" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="310,374 265,400 265,452 310,426" fill="#6f5410" stroke="#1a1a18" strokeWidth="1.2" />
                  {/* Middle */}
                  <polygon points="220,322 265,296 310,322 265,348" fill="#d6d4c8" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="220,322 265,348 265,400 220,374" fill="#a67e1e" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="310,322 265,348 265,400 310,374" fill="#8b6914" stroke="#1a1a18" strokeWidth="1.2" />
                  {/* Top */}
                  <polygon points="220,270 265,244 310,270 265,296" fill="#a67e1e" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="220,270 265,296 265,348 220,322" fill="#8b6914" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="310,270 265,296 265,348 310,322" fill="#6f5410" stroke="#1a1a18" strokeWidth="1.2" />

                  {/* Row 2, Col 2 - single cube */}
                  <polygon points="310,400 355,374 400,400 355,426" fill="#f5f4eb" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="310,400 355,426 355,478 310,452" fill="#a67e1e" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="400,400 355,426 355,478 400,452" fill="#6f5410" stroke="#1a1a18" strokeWidth="1.2" />

                  {/* === FLOATING CUBE top-right === */}
                  <polygon points="350,140 395,114 440,140 395,166" fill="#f5f4eb" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="350,140 395,166 395,218 350,192" fill="#8b6914" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="440,140 395,166 395,218 440,192" fill="#6f5410" stroke="#1a1a18" strokeWidth="1.2" />

                  {/* === SMALL CUBE far right === */}
                  <polygon points="410,260 437,246 464,260 437,274" fill="#f5f4eb" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="410,260 437,274 437,308 410,294" fill="#a67e1e" stroke="#1a1a18" strokeWidth="1.2" />
                  <polygon points="464,260 437,274 437,308 464,294" fill="#8b6914" stroke="#1a1a18" strokeWidth="1.2" />


                  {/* === ATOM SYMBOL (upper-left, replacing donut) === */}
                  <g transform="translate(75, 130)">
                    {/* Orbital 1 - tilted right */}
                    <ellipse cx="0" cy="0" rx="52" ry="18" transform="rotate(-30)" fill="none" stroke="#1a1a18" strokeWidth="1.5" />
                    {/* Orbital 2 - tilted left */}
                    <ellipse cx="0" cy="0" rx="52" ry="18" transform="rotate(30)" fill="none" stroke="#1a1a18" strokeWidth="1.5" />
                    {/* Orbital 3 - horizontal */}
                    <ellipse cx="0" cy="0" rx="52" ry="18" transform="rotate(90)" fill="none" stroke="#1a1a18" strokeWidth="1.5" />
                    {/* Nucleus */}
                    <circle cx="0" cy="0" r="7" fill="#8b6914" stroke="#1a1a18" strokeWidth="1.2" />
                    {/* Electrons */}
                    <circle cx="44" cy="-22" r="4.5" fill="#6f5410" stroke="#1a1a18" strokeWidth="1.2" />
                    <circle cx="-46" cy="-18" r="4.5" fill="#a67e1e" stroke="#1a1a18" strokeWidth="1.2" />
                    <circle cx="6" cy="50" r="4.5" fill="#1a1a18" stroke="#1a1a18" strokeWidth="1.2" />
                  </g>


                  {/* === FLAT BARS (stacked, far right) === */}
                  <g transform="translate(430, 200)">
                    {/* Bar 1 */}
                    <polygon points="0,0 50,-26 80,-10 30,16" fill="#f5f4eb" stroke="#1a1a18" strokeWidth="1.2" />
                    <polygon points="30,16 80,-10 80,-2 30,24" fill="#8b6914" stroke="#1a1a18" strokeWidth="1.2" />
                    <polygon points="0,0 30,16 30,24 0,8" fill="#a67e1e" stroke="#1a1a18" strokeWidth="1.2" />
                    {/* Bar 2 */}
                    <polygon points="0,16 50,-10 80,6 30,32" fill="#f5f4eb" stroke="#1a1a18" strokeWidth="1.2" />
                    <polygon points="30,32 80,6 80,14 30,40" fill="#6f5410" stroke="#1a1a18" strokeWidth="1.2" />
                    <polygon points="0,16 30,32 30,40 0,24" fill="#8b6914" stroke="#1a1a18" strokeWidth="1.2" />
                  </g>

                  {/* === OUTLINE-ONLY CUBE (wireframe, scattered) === */}
                  <g transform="translate(80, 320)">
                    <polygon points="0,0 27,-14 54,0 27,14" fill="none" stroke="#1a1a18" strokeWidth="1.2" />
                    <polygon points="0,0 27,14 27,40 0,26" fill="none" stroke="#1a1a18" strokeWidth="1.2" />
                    <polygon points="54,0 27,14 27,40 54,26" fill="none" stroke="#1a1a18" strokeWidth="1.2" />
                  </g>

                  {/* === OUTLINE-ONLY SMALL CUBE === */}
                  <g transform="translate(320, 90)">
                    <polygon points="0,0 20,-10 40,0 20,10" fill="none" stroke="#1a1a18" strokeWidth="1.2" />
                    <polygon points="0,0 20,10 20,30 0,20" fill="none" stroke="#1a1a18" strokeWidth="1.2" />
                    <polygon points="40,0 20,10 20,30 40,20" fill="none" stroke="#1a1a18" strokeWidth="1.2" />
                  </g>
                </svg>
              </div>
            </div>
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
            Join the network
          </h2>
          <p className="mt-6 text-foreground-dim max-w-md mx-auto">
            Vetted professionals. Cleared facilities. Secure connections across all four NRC regions.
          </p>
          <div className="mt-10">
            <Link
              href="/signup"
              className="inline-block px-10 py-4 bg-primary text-white text-sm font-medium tracking-wide uppercase hover:bg-primary-light transition-all duration-300"
            >
              Sign Up
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
