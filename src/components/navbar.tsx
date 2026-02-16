'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { UserRole } from '@/types';

const candidateLinks = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/jobs', label: 'Positions' },
  { href: '/dashboard/applications', label: 'Applications' },
  { href: '/dashboard/profile', label: 'Dossier' },
];

const employerLinks = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/jobs', label: 'Postings' },
  { href: '/dashboard/jobs/new', label: 'New Position' },
  { href: '/dashboard/profile', label: 'Dossier' },
];

const adminLinks = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/admin', label: 'Admin' },
  { href: '/dashboard/admin/verifications', label: 'Verifications' },
  { href: '/dashboard/admin/users', label: 'Users' },
];

export default function Navbar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const links = role === 'admin' ? adminLinks : role === 'employer' ? employerLinks : candidateLinks;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="bg-background-raised border-b border-border">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-5 h-5 border border-primary/50 rotate-45 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary" />
              </div>
              <span className="text-sm font-serif text-foreground">Moderator</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-colors ${
                    pathname === link.href
                      ? 'text-primary bg-primary/5 border border-primary/20'
                      : 'text-foreground-dim hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono px-2 py-1 border border-border text-muted tracking-wider uppercase">
              {role}
            </span>
            <button
              onClick={handleSignOut}
              className="text-xs text-muted hover:text-foreground tracking-wide uppercase transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
