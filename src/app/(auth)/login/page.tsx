'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 bg-border" />
        <h2 className="text-xs font-mono text-muted tracking-[0.3em] uppercase">Authenticate</h2>
        <div className="h-px flex-1 bg-border" />
      </div>
      {error && (
        <div className="mb-4 p-3 text-sm text-danger border border-danger/20 bg-danger/5">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-foreground-dim mb-2 tracking-wide uppercase">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-foreground-dim mb-2 tracking-wide uppercase">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-primary text-white font-medium text-sm tracking-wide uppercase hover:bg-primary-light disabled:opacity-50 transition-colors"
        >
          {loading ? 'Authenticating...' : 'Log In'}
        </button>
      </form>
      <p className="mt-8 text-sm text-center text-muted">
        Need access?{' '}
        <Link href="/signup" className="text-primary hover:text-primary-light transition-colors">
          Request account
        </Link>
      </p>
    </>
  );
}
