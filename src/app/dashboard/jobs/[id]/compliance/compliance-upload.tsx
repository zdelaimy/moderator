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

export default function ComplianceUpload({
  requirements,
  submissions,
  applicationId,
}: {
  requirements: ComplianceRequirement[];
  submissions: ComplianceSubmission[];
  applicationId: string;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  function getSubmission(requirementId: string) {
    return submissions.find((s) => s.requirement_id === requirementId);
  }

  async function handleUpload(requirementId: string, file: File) {
    setUploading(requirementId);
    setMessage('');

    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const filePath = `${applicationId}/${requirementId}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('compliance')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setMessage(`Error: ${uploadError.message}`);
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('compliance')
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase
      .from('compliance_submissions')
      .upsert({
        requirement_id: requirementId,
        application_id: applicationId,
        document_url: publicUrl,
        status: 'pending',
      }, { onConflict: 'requirement_id,application_id' });

    if (insertError) {
      setMessage(`Error: ${insertError.message}`);
    } else {
      setMessage('Document uploaded successfully.');
      router.refresh();
    }
    setUploading(null);
  }

  return (
    <div className="space-y-4">
      {message && (
        <p className={`text-sm ${message.startsWith('Error') ? 'text-danger' : 'text-success'}`}>
          {message}
        </p>
      )}

      {requirements.map((req) => {
        const sub = getSubmission(req.id);
        return (
          <div key={req.id} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{req.name}</h3>
                  {req.required && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-50 text-danger">
                      Required
                    </span>
                  )}
                </div>
                {req.description && (
                  <p className="text-sm text-muted mt-1">{req.description}</p>
                )}
              </div>
              {sub && (
                <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${statusStyles[sub.status]}`}>
                  {sub.status}
                </span>
              )}
            </div>

            {sub?.rejection_reason && (
              <p className="text-xs text-danger mb-2">Rejection reason: {sub.rejection_reason}</p>
            )}

            {sub?.document_url && (
              <a
                href={sub.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mb-2 inline-block"
              >
                View uploaded document
              </a>
            )}

            {(!sub || sub.status === 'rejected') && (
              <div className="mt-3">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(req.id, file);
                  }}
                  disabled={uploading === req.id}
                  className="text-xs text-muted file:mr-3 file:py-1.5 file:px-3 file:border file:border-border file:rounded-lg file:text-xs file:bg-card"
                />
                {uploading === req.id && (
                  <p className="text-xs text-muted mt-1">Uploading...</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
