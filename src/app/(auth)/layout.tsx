import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 noise">
      <Link href="/" className="mb-10 flex items-center gap-3">
        <div className="w-6 h-6 border border-primary/60 rotate-45 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary" />
        </div>
        <span className="text-xl font-serif text-foreground tracking-wide">Moderator</span>
      </Link>
      <div className="w-full max-w-md bg-card border border-border p-8">
        {children}
      </div>
    </div>
  );
}
