import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-muted',
  reviewed: 'bg-blue-50 text-primary',
  shortlisted: 'bg-green-50 text-success',
  rejected: 'bg-red-50 text-danger',
  accepted: 'bg-emerald-50 text-emerald-700',
};

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user!.id)
    .single();

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Your profile is still being set up. Please check back shortly.</p>
      </div>
    );
  }

  const { data: applications } = await supabase
    .from('applications')
    .select('*, job:jobs(*, company:companies(name))')
    .eq('candidate_id', profile.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">My Applications</h1>

      {applications && applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-card rounded-xl border border-border p-5 flex items-center justify-between"
            >
              <div>
                <Link
                  href={`/dashboard/jobs/${app.job_id}`}
                  className="font-semibold text-foreground hover:text-primary"
                >
                  {app.job?.title}
                </Link>
                <p className="text-sm text-muted mt-1">
                  {app.job?.company?.name} &middot;{' '}
                  Applied {new Date(app.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {(app.status === 'shortlisted' || app.status === 'accepted') && (
                  <Link
                    href={`/dashboard/jobs/${app.job_id}/compliance`}
                    className="text-xs text-primary hover:underline"
                  >
                    Compliance
                  </Link>
                )}
                <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${statusColors[app.status] ?? ''}`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted mb-4">You haven&apos;t applied to any jobs yet.</p>
          <Link
            href="/dashboard/jobs"
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
          >
            Browse Jobs
          </Link>
        </div>
      )}
    </div>
  );
}
