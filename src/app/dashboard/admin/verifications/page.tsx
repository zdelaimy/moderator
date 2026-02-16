import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import VerifyActions from './verify-actions';

export default async function VerificationsPage() {
  const supabase = await createClient();

  const { data: pendingDocs } = await supabase
    .from('certification_documents')
    .select('*, candidate:profiles(first_name, last_name, email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  const { data: recentDocs } = await supabase
    .from('certification_documents')
    .select('*, candidate:profiles(first_name, last_name, email)')
    .neq('status', 'pending')
    .order('updated_at', { ascending: false })
    .limit(20);

  return (
    <div>
      <Link href="/dashboard/admin" className="text-sm text-primary hover:underline mb-4 inline-block">
        &larr; Back to admin
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-6">Certification Verifications</h1>

      {/* Pending queue */}
      <h2 className="font-semibold text-foreground mb-3">
        Pending Review ({pendingDocs?.length ?? 0})
      </h2>

      {pendingDocs && pendingDocs.length > 0 ? (
        <div className="space-y-3 mb-10">
          {pendingDocs.map((doc) => (
            <div key={doc.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-foreground">
                    {doc.candidate?.first_name} {doc.candidate?.last_name}
                  </p>
                  <p className="text-sm text-muted">{doc.candidate?.email}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded bg-blue-50 text-primary">
                  {doc.certification_type}
                </span>
              </div>
              <div className="flex items-center gap-4 mb-3 text-sm text-muted">
                <a
                  href={doc.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View document
                </a>
                {doc.expiration_date && (
                  <span>Expires: {new Date(doc.expiration_date).toLocaleDateString()}</span>
                )}
                <span>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</span>
              </div>
              <VerifyActions documentId={doc.id} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted mb-10">No pending verifications.</p>
      )}

      {/* Recent history */}
      <h2 className="font-semibold text-foreground mb-3">Recent Decisions</h2>
      {recentDocs && recentDocs.length > 0 ? (
        <div className="space-y-2">
          {recentDocs.map((doc) => (
            <div key={doc.id} className="bg-card rounded-lg border border-border p-4 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">
                  {doc.candidate?.first_name} {doc.candidate?.last_name}
                </span>
                <span className="text-sm text-muted ml-2">{doc.certification_type}</span>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${
                doc.status === 'verified' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-danger'
              }`}>
                {doc.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted">No recent decisions.</p>
      )}
    </div>
  );
}
