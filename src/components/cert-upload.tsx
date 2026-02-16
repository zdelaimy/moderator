'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Certification, CertificationDocument, VerificationStatus } from '@/types';
import VerifiedBadge from './verified-badge';

const statusStyles: Record<VerificationStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  verified: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-danger',
};

export default function CertUpload({
  profileId,
  certifications,
}: {
  profileId: string;
  certifications: Certification[];
}) {
  const [docs, setDocs] = useState<CertificationDocument[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadDocs() {
      const supabase = createClient();
      const { data } = await supabase
        .from('certification_documents')
        .select('*')
        .eq('candidate_id', profileId)
        .order('created_at', { ascending: false });

      if (data) setDocs(data as CertificationDocument[]);
    }
    loadDocs();
  }, [profileId]);

  async function handleUpload(certType: Certification, file: File, expirationDate: string) {
    setUploading(certType);
    setMessage('');

    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const filePath = `${profileId}/${certType}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('certifications')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setMessage(`Error uploading ${certType}: ${uploadError.message}`);
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('certifications')
      .getPublicUrl(filePath);

    const { data: inserted, error: insertError } = await supabase
      .from('certification_documents')
      .insert({
        candidate_id: profileId,
        certification_type: certType,
        document_url: publicUrl,
        expiration_date: expirationDate || null,
      })
      .select()
      .single();

    if (insertError) {
      setMessage(`Error: ${insertError.message}`);
    } else if (inserted) {
      setDocs((prev) => [inserted as CertificationDocument, ...prev]);
      setMessage(`${certType} document uploaded.`);
    }
    setUploading(null);
  }

  function getDocForCert(certType: Certification) {
    return docs.find((d) => d.certification_type === certType);
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-4">
      <h2 className="font-semibold text-foreground">Certification Documents</h2>
      <p className="text-sm text-muted">
        Upload supporting documents for each certification. These will be reviewed by an admin.
      </p>

      {message && (
        <p className={`text-sm ${message.startsWith('Error') ? 'text-danger' : 'text-success'}`}>
          {message}
        </p>
      )}

      <div className="space-y-4">
        {certifications.map((cert) => {
          const doc = getDocForCert(cert);
          return (
            <CertRow
              key={cert}
              cert={cert}
              doc={doc}
              uploading={uploading === cert}
              onUpload={handleUpload}
            />
          );
        })}
      </div>
    </div>
  );
}

function CertRow({
  cert,
  doc,
  uploading,
  onUpload,
}: {
  cert: Certification;
  doc?: CertificationDocument;
  uploading: boolean;
  onUpload: (cert: Certification, file: File, expirationDate: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [expirationDate, setExpirationDate] = useState(doc?.expiration_date ?? '');

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{cert}</span>
          {doc?.status === 'verified' && <VerifiedBadge />}
        </div>
        {doc && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${statusStyles[doc.status]}`}>
            {doc.status}
          </span>
        )}
      </div>

      {doc?.rejection_reason && (
        <p className="text-xs text-danger">Rejection reason: {doc.rejection_reason}</p>
      )}

      {doc?.document_url && (
        <a
          href={doc.document_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          View uploaded document
        </a>
      )}

      {doc?.expiration_date && (
        <p className="text-xs text-muted">
          Expires: {new Date(doc.expiration_date).toLocaleDateString()}
        </p>
      )}

      {(!doc || doc.status === 'rejected') && (
        <div className="space-y-2">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-xs text-muted file:mr-3 file:py-1 file:px-3 file:border file:border-border file:rounded file:text-xs file:bg-card"
          />
          <input
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            placeholder="Expiration date"
            className="block w-full max-w-xs px-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
          <button
            type="button"
            disabled={!file || uploading}
            onClick={() => file && onUpload(cert, file, expirationDate)}
            className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      )}
    </div>
  );
}
