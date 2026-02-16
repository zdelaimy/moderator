import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import Navbar from '@/components/navbar';
import type { UserRole } from '@/types';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const role: UserRole = (profile?.role as UserRole) ?? 'candidate';

  return (
    <div className="min-h-screen bg-background">
      <Navbar role={role} />
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
