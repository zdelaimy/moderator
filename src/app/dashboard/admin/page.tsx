import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: totalJobs } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true });

  const { count: totalApps } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true });

  const { count: pendingVerifications } = await supabase
    .from('certification_documents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted">Total Users</p>
          <p className="text-3xl font-bold text-foreground mt-1">{totalUsers ?? 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted">Total Jobs</p>
          <p className="text-3xl font-bold text-foreground mt-1">{totalJobs ?? 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted">Total Applications</p>
          <p className="text-3xl font-bold text-foreground mt-1">{totalApps ?? 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted">Pending Verifications</p>
          <p className="text-3xl font-bold text-accent-dark mt-1">{pendingVerifications ?? 0}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/dashboard/admin/verifications"
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
        >
          Review Verifications
        </Link>
        <Link
          href="/dashboard/admin/users"
          className="px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          Manage Users
        </Link>
      </div>
    </div>
  );
}
