import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user!.id)
    .single();

  if (!profile) {
    return <p>Profile not found. Please contact support.</p>;
  }

  if (profile.role === 'admin') {
    const { redirect } = await import('next/navigation');
    redirect('/dashboard/admin');
  }

  if (profile.role === 'candidate') {
    return <CandidateDashboard profileId={profile.id} />;
  }

  return <EmployerDashboard profileId={profile.id} userId={user!.id} />;
}

async function CandidateDashboard({ profileId }: { profileId: string }) {
  const supabase = await createClient();

  const { count: totalApps } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('candidate_id', profileId);

  const { count: shortlisted } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('candidate_id', profileId)
    .eq('status', 'shortlisted');

  // Cert expiration tracking
  const { data: certDocs } = await supabase
    .from('certification_documents')
    .select('*')
    .eq('candidate_id', profileId)
    .eq('status', 'verified');

  const now = new Date();
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const expiredCerts = certDocs?.filter(
    (d) => d.expiration_date && new Date(d.expiration_date) < now
  ) ?? [];
  const expiringSoonCerts = certDocs?.filter(
    (d) => d.expiration_date && new Date(d.expiration_date) >= now && new Date(d.expiration_date) <= ninetyDaysFromNow
  ) ?? [];

  const { data: recentJobs } = await supabase
    .from('jobs')
    .select('*, company:companies(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Candidate Dashboard</h1>

      {/* Cert expiration warnings */}
      {expiredCerts.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-medium text-danger mb-1">Expired Certifications</p>
          {expiredCerts.map((d) => (
            <p key={d.id} className="text-sm text-danger">
              {d.certification_type} — expired {new Date(d.expiration_date).toLocaleDateString()}
            </p>
          ))}
        </div>
      )}
      {expiringSoonCerts.length > 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm font-medium text-amber-700 mb-1">Certifications Expiring Soon</p>
          {expiringSoonCerts.map((d) => (
            <p key={d.id} className="text-sm text-amber-700">
              {d.certification_type} — expires {new Date(d.expiration_date).toLocaleDateString()}
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted">Total Applications</p>
          <p className="text-3xl font-bold text-foreground mt-1">{totalApps ?? 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted">Shortlisted</p>
          <p className="text-3xl font-bold text-success mt-1">{shortlisted ?? 0}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Jobs</h2>
          <Link href="/dashboard/jobs" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {recentJobs && recentJobs.length > 0 ? (
          <ul className="divide-y divide-border">
            {recentJobs.map((job) => (
              <li key={job.id} className="p-4 hover:bg-gray-50">
                <Link href={`/dashboard/jobs/${job.id}`}>
                  <p className="font-medium text-foreground">{job.title}</p>
                  <p className="text-sm text-muted mt-1">
                    {job.company?.name} &middot; {job.location} &middot; {job.contract_type}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-sm text-muted">No jobs posted yet.</p>
        )}
      </div>
    </div>
  );
}

async function EmployerDashboard({ profileId, userId }: { profileId: string; userId: string }) {
  const supabase = await createClient();

  // Get employer's company
  const { data: empProfile } = await supabase
    .from('employer_profiles')
    .select('company_id')
    .eq('id', profileId)
    .single();

  const companyId = empProfile?.company_id;

  const { count: activeJobs } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId ?? '')
    .eq('is_active', true);

  // Get pending applications for employer's jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id')
    .eq('company_id', companyId ?? '');

  const jobIds = jobs?.map((j) => j.id) ?? [];

  let pendingApps = 0;
  if (jobIds.length > 0) {
    const { count } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .in('job_id', jobIds)
      .eq('status', 'pending');
    pendingApps = count ?? 0;
  }

  const { data: recentApps } = jobIds.length > 0
    ? await supabase
        .from('applications')
        .select('*, job:jobs(title), candidate:profiles(*)')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false })
        .limit(5)
    : { data: [] };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Employer Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted">Active Jobs</p>
          <p className="text-3xl font-bold text-foreground mt-1">{activeJobs ?? 0}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted">Pending Applications</p>
          <p className="text-3xl font-bold text-accent-dark mt-1">{pendingApps}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <Link
          href="/dashboard/jobs/new"
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
        >
          Post a New Job
        </Link>
        <Link
          href="/dashboard/jobs"
          className="px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          Manage Jobs
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Applications</h2>
        </div>
        {recentApps && recentApps.length > 0 ? (
          <ul className="divide-y divide-border">
            {recentApps.map((app) => (
              <li key={app.id} className="p-4">
                <p className="font-medium text-foreground">
                  {app.candidate?.first_name} {app.candidate?.last_name}
                </p>
                <p className="text-sm text-muted mt-1">
                  Applied for {app.job?.title} &middot;{' '}
                  <span className="capitalize">{app.status}</span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-sm text-muted">No applications yet.</p>
        )}
      </div>
    </div>
  );
}
