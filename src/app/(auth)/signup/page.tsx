'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') === 'employer' ? 'employer' : 'candidate';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setError('Signup succeeded but no user ID returned.');
      setLoading(false);
      return;
    }

    // Create base profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({ user_id: userId, role, first_name: firstName, last_name: lastName, email })
      .select()
      .single();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    // Create role-specific profile
    if (role === 'candidate') {
      const { error: candError } = await supabase
        .from('candidate_profiles')
        .insert({ id: profile.id });

      if (candError) {
        setError(candError.message);
        setLoading(false);
        return;
      }
    } else if (role === 'employer') {
      const { data: company, error: compError } = await supabase
        .from('companies')
        .insert({ name: `${firstName} ${lastName}'s Company` })
        .select()
        .single();

      if (compError) {
        setError(compError.message);
        setLoading(false);
        return;
      }

      const { error: empError } = await supabase
        .from('employer_profiles')
        .insert({ id: profile.id, company_id: company.id });

      if (empError) {
        setError(empError.message);
        setLoading(false);
        return;
      }
    }

    router.push('/dashboard/profile');
    router.refresh();
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
