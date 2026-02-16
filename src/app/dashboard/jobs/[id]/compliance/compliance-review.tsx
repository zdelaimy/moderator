'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { ComplianceRequirement, ComplianceSubmission, ComplianceStatus } from '@/types';

const statusStyles: Record<ComplianceStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-danger',
};

interface ApplicationWithCandidate {
  id: string;
  candidate_id: string;
  candidate?: { first_name: string; last_name: string; email: string } | null;
}

export default function ComplianceReview({
  requirements,
  applications,
  submissions,
}: {
  requirements: ComplianceRequirement[];
  applications: ApplicationWithCandidate[];
  submissions: ComplianceSubmission[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  function getSubmission(applicationId: string, requirementId: string) {
    return submissions.find(
      (s) => s.application_id === applicationId && s.requirement_id === requirementId
    );
  }

  async function handleAction(submissionId: string, status: 'approved' | 'rejected', reason?: string) {
    setLoading(submissionId);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    await supabase
      .from('compliance_submissions')
      .update({
        status,
        reviewed_by: profile?.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason || null,
      })
      .eq('id', submissionId);

    setLoading(null);
    setRejectingId(null);
    setRejectionReason('');
    router.refresh();
  }

  if (applications.length === 0) {
    return <p className="text-muted">No shortlisted or accepted applicants yet.</p>;
  }

  return (
    <div className="space-y-6">
      {applications.map((app) => (
        <div key={app.id} className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-1">
            {app.candidate?.first_name} {app.candidate?.last_name}
          </h3>
          <p className="text-sm text-muted mb-4">{app.candidate?.email}</p>

          <div className="space-y-3">
            {requirements.map((req) => {
              const sub = getSubmission(app.id, req.id);
              return (
                <div key={req.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{req.name}</span>
                      {req.required && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-50 text-danger">
                          Required
                        </span>
                      )}
                    </div>
                    {sub ? (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${statusStyles[sub.status]}`}>
                        {sub.status}
                      </span>
                    ) : (
                      <span className="text-xs text-muted">Not submitted</span>
                    )}
                  </div>

                  {sub && (
                    <div className="mt-2 space-y-2">
                      <a
                        href={sub.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View document
                      </a>

                      {sub.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAction(sub.id, 'approved')}
                            disabled={loading === sub.id}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          {rejectingId !== sub.id ? (
                            <button
                              onClick={() => setRejectingId(sub.id)}
                              disabled={loading === sub.id}
                              className="px-2 py-1 text-xs border border-danger text-danger rounded hover:bg-red-50 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          ) : (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Reason..."
                                className="px-2 py-1 text-xs border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary-light"
                              />
                              <button
                                onClick={() => handleAction(sub.id, 'rejected', rejectionReason)}
                                disabled={!rejectionReason.trim() || loading === sub.id}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                                className="text-xs text-muted hover:text-foreground"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
