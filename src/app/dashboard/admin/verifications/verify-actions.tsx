'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function VerifyActions({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    await supabase
      .from('certification_documents')
      .update({
        status: 'verified',
        verified_by: profile?.id,
        verified_at: new Date().toISOString(),
      })
      .eq('id', documentId);

    router.refresh();
  }

  async function handleReject() {
    if (!rejectionReason.trim()) return;
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    await supabase
      .from('certification_documents')
      .update({
        status: 'rejected',
        verified_by: profile?.id,
        verified_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
      })
      .eq('id', documentId);

    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleVerify}
        disabled={loading}
        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        Verify
      </button>
      {!showReject ? (
        <button
          onClick={() => setShowReject(true)}
          disabled={loading}
          className="px-3 py-1.5 text-xs border border-danger text-danger rounded-lg hover:bg-red-50 disabled:opacity-50"
        >
          Reject
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Rejection reason..."
            className="px-2 py-1 text-xs border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-light"
          />
          <button
            onClick={handleReject}
            disabled={loading || !rejectionReason.trim()}
            className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Confirm Reject
          </button>
          <button
            onClick={() => setShowReject(false)}
            className="text-xs text-muted hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
