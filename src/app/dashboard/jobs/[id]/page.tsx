import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ApplyButton from './apply-button';

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: job } = await supabase
    .from('jobs')
    .select('*, company:companies(*)')
    .eq('id', id)
    .single();

  if (!job) {
    notFound();
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user!.id)
    .single();

  const isCandidate = profile?.role === 'candidate';
  const isEmployer = profile?.role === 'employer';

  // Check if candidate already applied
  let existingApplication = null;
  if (isCandidate && profile) {
    const { data } = await supabase
      .from('applications')
      .select('id, status')
      .eq('job_id', id)
      .eq('candidate_id', profile.id)
      .single();
    existingApplication = data;
  }

  return (
    <div className="max-w-3xl">
      <Link href="/dashboard/jobs" className="text-sm text-primary hover:underline mb-4 inline-block">
        &larr; Back to jobs
      </Link>

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
            <p className="text-muted mt-1">
              {job.company?.name} &middot; {job.location}
              {job.remote && ' (Remote)'}
            </p>
          </div>
          <span className="text-sm font-medium px-3 py-1 rounded bg-blue-50 text-primary">
            {job.contract_type}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {job.plant_type && (
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-muted">{job.plant_type}</span>
          )}
          {job.nrc_region && (
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-muted">NRC Region {job.nrc_region}</span>
          )}
          {job.required_clearance !== 'None' && (
            <span className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-700">
              {job.required_clearance} Clearance Required
            </span>
          )}
          {job.required_certifications?.map((cert: string) => (
            <span key={cert} className="text-xs px-2 py-1 rounded bg-green-50 text-green-700">{cert}</span>
          ))}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          {(job.min_rate || job.max_rate) && (
            <div>
              <p className="text-muted">Rate</p>
              <p className="font-medium">${job.min_rate ?? '?'} - ${job.max_rate ?? '?'}/hr</p>
            </div>
          )}
          {job.start_date && (
            <div>
              <p className="text-muted">Start Date</p>
              <p className="font-medium">{new Date(job.start_date).toLocaleDateString()}</p>
            </div>
          )}
          {job.duration && (
            <div>
              <p className="text-muted">Duration</p>
              <p className="font-medium">{job.duration}</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="border-t border-border pt-6">
          <h2 className="font-semibold text-foreground mb-3">Description</h2>
          <div className="text-sm text-foreground whitespace-pre-wrap">{job.description}</div>
        </div>

        {/* Company info */}
        {job.company && (
          <div className="border-t border-border pt-6 mt-6">
            <h2 className="font-semibold text-foreground mb-2">About {job.company.name}</h2>
            {job.company.description && (
              <p className="text-sm text-muted">{job.company.description}</p>
            )}
            {job.company.website && (
              <a
                href={job.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline mt-1 inline-block"
              >
                {job.company.website}
              </a>
            )}
          </div>
        )}

        {/* Apply / Status */}
        <div className="border-t border-border pt-6 mt-6">
          {isCandidate && !existingApplication && (
            <ApplyButton jobId={id} candidateId={profile!.id} />
          )}
          {isCandidate && existingApplication && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-primary">
                You have already applied. Status:{' '}
                <span className="capitalize">{existingApplication.status}</span>
              </p>
              {(existingApplication.status === 'shortlisted' || existingApplication.status === 'accepted') && (
                <Link
                  href={`/dashboard/jobs/${id}/compliance`}
                  className="text-sm text-primary hover:underline mt-2 inline-block"
                >
                  View Compliance Checklist
                </Link>
              )}
            </div>
          )}
          {isEmployer && (
            <div className="flex gap-3">
              <Link
                href={`/dashboard/jobs/${id}/applications`}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
              >
                View Applications
              </Link>
              <Link
                href={`/dashboard/jobs/${id}/compliance`}
                className="px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Compliance Checklist
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
