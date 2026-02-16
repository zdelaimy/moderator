import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import type { ContractType, PlantType, ClearanceLevel } from '@/types';

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ contract_type?: string; plant_type?: string; clearance?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user!.id)
    .single();

  const isEmployer = profile?.role === 'employer';

  if (isEmployer) {
    return <EmployerJobsList profileId={profile!.id} />;
  }

  // Candidate: browse active jobs with filters
  let query = supabase
    .from('jobs')
    .select('*, company:companies(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (params.contract_type) {
    query = query.eq('contract_type', params.contract_type);
  }
  if (params.plant_type) {
    query = query.eq('plant_type', params.plant_type);
  }
  if (params.clearance && params.clearance !== 'None') {
    query = query.eq('required_clearance', params.clearance);
  }

  const { data: jobs } = await query;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Browse Jobs</h1>

      {/* Filters */}
      <form className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            name="contract_type"
            defaultValue={params.contract_type ?? ''}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          >
            <option value="">All Contract Types</option>
            {(['Outage', 'Long-term', 'Permanent'] as ContractType[]).map((ct) => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
          <select
            name="plant_type"
            defaultValue={params.plant_type ?? ''}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          >
            <option value="">All Plant Types</option>
            {(['PWR', 'BWR', 'AP1000', 'ABWR', 'EPR', 'SMR'] as PlantType[]).map((pt) => (
              <option key={pt} value={pt}>{pt}</option>
            ))}
          </select>
          <select
            name="clearance"
            defaultValue={params.clearance ?? ''}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          >
            <option value="">Any Clearance</option>
            {(['None', 'L', 'Q'] as ClearanceLevel[]).map((cl) => (
              <option key={cl} value={cl}>{cl}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
          >
            Filter
          </button>
        </div>
      </form>

      {/* Job List */}
      {jobs && jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/dashboard/jobs/${job.id}`}
              className="block bg-card rounded-xl border border-border p-5 hover:border-primary-light transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{job.title}</h3>
                  <p className="text-sm text-muted mt-1">
                    {job.company?.name} &middot; {job.location}
                    {job.remote && ' (Remote)'}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded bg-blue-50 text-primary">
                  {job.contract_type}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.plant_type && (
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-muted">{job.plant_type}</span>
                )}
                {job.required_clearance !== 'None' && (
                  <span className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-700">
                    {job.required_clearance} Clearance
                  </span>
                )}
                {job.required_certifications?.map((cert: string) => (
                  <span key={cert} className="text-xs px-2 py-1 rounded bg-green-50 text-green-700">{cert}</span>
                ))}
              </div>
              {(job.min_rate || job.max_rate) && (
                <p className="mt-2 text-sm text-muted">
                  ${job.min_rate ?? '?'} - ${job.max_rate ?? '?'}/hr
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted">No jobs match your filters.</p>
      )}
    </div>
  );
}

async function EmployerJobsList({ profileId }: { profileId: string }) {
  const supabase = await createClient();

  const { data: empProfile } = await supabase
    .from('employer_profiles')
    .select('company_id')
    .eq('id', profileId)
    .single();

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, applications(count)')
    .eq('company_id', empProfile?.company_id ?? '')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Jobs</h1>
        <Link
          href="/dashboard/jobs/new"
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
        >
          Post New Job
        </Link>
      </div>

      {jobs && jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-card rounded-xl border border-border p-5 flex items-center justify-between"
            >
              <div>
                <Link href={`/dashboard/jobs/${job.id}`} className="font-semibold text-foreground hover:text-primary">
                  {job.title}
                </Link>
                <p className="text-sm text-muted mt-1">
                  {job.location} &middot; {job.contract_type}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-medium px-2 py-1 rounded ${job.is_active ? 'bg-green-50 text-success' : 'bg-gray-100 text-muted'}`}>
                  {job.is_active ? 'Active' : 'Closed'}
                </span>
                <Link
                  href={`/dashboard/jobs/${job.id}/applications`}
                  className="text-sm text-primary hover:underline"
                >
                  {(job.applications as unknown as { count: number }[])?.[0]?.count ?? 0} applicants
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted mb-4">You haven&apos;t posted any jobs yet.</p>
          <Link
            href="/dashboard/jobs/new"
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
          >
            Post Your First Job
          </Link>
        </div>
      )}
    </div>
  );
}
