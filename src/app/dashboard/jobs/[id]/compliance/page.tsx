import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ComplianceUpload from './compliance-upload';
import ComplianceReview from './compliance-review';

export default async function CompliancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user!.id)
    .single();

  if (!profile) notFound();

  const { data: job } = await supabase
    .from('jobs')
    .select('*, company:companies(*)')
    .eq('id', id)
    .single();

  if (!job) notFound();

  // Get compliance requirements for this job
  const { data: requirements } = await supabase
    .from('compliance_requirements')
    .select('*')
    .eq('job_id', id)
    .order('created_at', { ascending: true });

  const isCandidate = profile.role === 'candidate';
  const isEmployer = profile.role === 'employer';

  // Candidate view: show their checklist
  if (isCandidate) {
    const { data: application } = await supabase
      .from('applications')
      .select('id, status')
      .eq('job_id', id)
      .eq('candidate_id', profile.id)
      .single();

    if (!application || (application.status !== 'shortlisted' && application.status !== 'accepted')) {
      return (
        <div>
          <Link href={`/dashboard/jobs/${id}`} className="text-sm text-primary hover:underline mb-4 inline-block">
            &larr; Back to job
          </Link>
          <p className="text-muted">Compliance checklist is only available for shortlisted or accepted applications.</p>
        </div>
      );
    }

    // Get existing submissions
    const { data: submissions } = await supabase
      .from('compliance_submissions')
      .select('*')
      .eq('application_id', application.id);

    return (
      <div>
        <Link href={`/dashboard/jobs/${id}`} className="text-sm text-primary hover:underline mb-4 inline-block">
          &larr; Back to job
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-2">Compliance Checklist</h1>
        <p className="text-muted mb-6">{job.title} at {job.company?.name}</p>

        {requirements && requirements.length > 0 ? (
          <ComplianceUpload
            requirements={requirements}
            submissions={submissions ?? []}
            applicationId={application.id}
          />
        ) : (
          <p className="text-muted">No compliance requirements for this position.</p>
        )}
      </div>
    );
  }

  // Employer view: show matrix of all shortlisted applicants
  if (isEmployer) {
    const { data: applications } = await supabase
      .from('applications')
      .select('*, candidate:profiles(first_name, last_name, email)')
      .eq('job_id', id)
      .in('status', ['shortlisted', 'accepted']);

    const applicationIds = applications?.map((a) => a.id) ?? [];

    const { data: allSubmissions } = applicationIds.length > 0
      ? await supabase
          .from('compliance_submissions')
          .select('*')
          .in('application_id', applicationIds)
      : { data: [] };

    return (
      <div>
        <Link href={`/dashboard/jobs/${id}`} className="text-sm text-primary hover:underline mb-4 inline-block">
          &larr; Back to job
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-2">Compliance Overview</h1>
        <p className="text-muted mb-6">{job.title}</p>

        {requirements && requirements.length > 0 ? (
          <ComplianceReview
            requirements={requirements}
            applications={applications ?? []}
            submissions={allSubmissions ?? []}
          />
        ) : (
          <p className="text-muted">No compliance requirements defined for this position.</p>
        )}
      </div>
    );
  }

  notFound();
}
