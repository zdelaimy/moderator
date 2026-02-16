import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import StatusSelect from './status-select';
import VerifiedBadge from '@/components/verified-badge';

export default async function JobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Verify employer owns this job
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user!.id)
    .single();

  if (profile?.role !== 'employer') {
    notFound();
  }

  const { data: job } = await supabase
    .from('jobs')
    .select('*, company:companies(*)')
    .eq('id', id)
    .single();

  if (!job) {
    notFound();
  }

  const { data: applications } = await supabase
    .from('applications')
    .select('*, candidate:profiles(*, candidate_profile:candidate_profiles(*))')
    .eq('job_id', id)
    .order('created_at', { ascending: false });

  // Fetch verified certs for all applicants
  const candidateIds = applications?.map((a) => a.candidate_id).filter(Boolean) ?? [];
  const { data: verifiedCerts } = candidateIds.length > 0
    ? await supabase
        .from('certification_documents')
        .select('candidate_id, certification_type')
        .in('candidate_id', candidateIds)
        .eq('status', 'verified')
    : { data: [] };

  const verifiedCertMap = new Map<string, Set<string>>();
  verifiedCerts?.forEach((vc) => {
    if (!verifiedCertMap.has(vc.candidate_id)) {
      verifiedCertMap.set(vc.candidate_id, new Set());
    }
    verifiedCertMap.get(vc.candidate_id)!.add(vc.certification_type);
  });

  return (
    <div>
      <Link href="/dashboard/jobs" className="text-sm text-primary hover:underline mb-4 inline-block">
        &larr; Back to my jobs
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-2">
        Applications for {job.title}
      </h1>
      <p className="text-muted mb-6">{applications?.length ?? 0} applicants</p>

      {applications && applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {app.candidate?.first_name} {app.candidate?.last_name}
                  </h3>
                  <p className="text-sm text-muted">
                    {app.candidate?.email} &middot; Applied {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusSelect applicationId={app.id} currentStatus={app.status} />
              </div>

              {/* Candidate details */}
              {app.candidate?.candidate_profile?.[0] && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {app.candidate.candidate_profile[0].title && (
                      <span className="text-xs px-2 py-1 rounded bg-blue-50 text-primary">
                        {app.candidate.candidate_profile[0].title}
                      </span>
                    )}
                    {app.candidate.candidate_profile[0].clearance_level !== 'None' && (
                      <span className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-700">
                        {app.candidate.candidate_profile[0].clearance_level} Clearance
                      </span>
                    )}
                    {(app.candidate.candidate_profile[0].certifications as string[])?.map((cert: string) => (
                      <span key={cert} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-50 text-green-700">
                        {cert}
                        {verifiedCertMap.get(app.candidate_id)?.has(cert) && <VerifiedBadge />}
                      </span>
                    ))}
                  </div>
                  {app.candidate.candidate_profile[0].years_experience != null && (
                    <p className="text-sm text-muted">
                      {app.candidate.candidate_profile[0].years_experience} years experience
                    </p>
                  )}
                </div>
              )}

              {app.cover_message && (
                <div className="border-t border-border pt-3 mt-3">
                  <p className="text-sm font-medium text-foreground mb-1">Cover Message</p>
                  <p className="text-sm text-muted whitespace-pre-wrap">{app.cover_message}</p>
                </div>
              )}

              {app.candidate?.bio && (
                <div className="border-t border-border pt-3 mt-3">
                  <p className="text-sm font-medium text-foreground mb-1">Bio</p>
                  <p className="text-sm text-muted">{app.candidate.bio}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted">No applications yet.</p>
      )}
    </div>
  );
}
