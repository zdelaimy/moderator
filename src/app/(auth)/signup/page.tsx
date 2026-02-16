'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import type { UserRole } from '@/types';

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') === 'employer' ? 'employer' : 'candidate';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return <ConfirmationScreen email={email} />;
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 bg-border" />
        <h2 className="text-xs font-mono text-muted tracking-[0.3em] uppercase">Request Access</h2>
        <div className="h-px flex-1 bg-border" />
      </div>
      {error && (
        <div className="mb-4 p-3 text-sm text-danger border border-danger/20 bg-danger/5">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-xs font-medium text-foreground-dim mb-2 tracking-wide uppercase">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-xs font-medium text-foreground-dim mb-2 tracking-wide uppercase">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground-dim mb-3 tracking-wide uppercase">Role</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`py-3 px-4 border text-sm font-medium transition-colors ${
                role === 'candidate'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-border text-foreground-dim hover:border-border-light'
              }`}
            >
              Operator
            </button>
            <button
              type="button"
              onClick={() => setRole('employer')}
              className={`py-3 px-4 border text-sm font-medium transition-colors ${
                role === 'employer'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-border text-foreground-dim hover:border-border-light'
              }`}
            >
              Organization
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-primary text-white font-medium text-sm tracking-wide uppercase hover:bg-primary-light disabled:opacity-50 transition-colors"
        >
          {loading ? 'Processing...' : 'Create Account'}
        </button>
      </form>
      <p className="mt-8 text-sm text-center text-muted">
        Already have access?{' '}
        <Link href="/login" className="text-primary hover:text-primary-light transition-colors">
          Authenticate
        </Link>
      </p>
    </>
  );
}

function ConfirmationScreen({ email }: { email: string }) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    setResending(true);
    const supabase = createClient();
    await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setResent(true);
    setResending(false);
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-6">
        <div className="w-12 h-12 border border-primary/40 flex items-center justify-center">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="square" strokeLinejoin="miter" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-border" />
        <h2 className="text-xs font-mono text-muted tracking-[0.3em] uppercase">Verify Your Email</h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="text-sm text-foreground-dim mb-2">
        We sent a confirmation link to
      </p>
      <p className="text-sm font-medium text-foreground mb-6">
        {email}
      </p>
      <p className="text-sm text-muted mb-8">
        Click the link in the email to activate your account. The link will expire in 24 hours.
      </p>

      <div className="space-y-4">
        <button
          onClick={handleResend}
          disabled={resending || resent}
          className="w-full py-3 px-4 border border-border text-sm font-medium text-foreground-dim hover:border-border-light disabled:opacity-50 transition-colors"
        >
          {resent ? 'Email Resent' : resending ? 'Sending...' : 'Resend Confirmation Email'}
        </button>

        <Link
          href="/login"
          className="block w-full py-3 px-4 bg-primary text-white text-sm font-medium text-center tracking-wide uppercase hover:bg-primary-light transition-colors"
        >
          Back to Login
        </Link>
      </div>

      <p className="mt-6 text-xs text-muted">
        Check your spam folder if you don&apos;t see the email.
      </p>
    </div>
  );
}
