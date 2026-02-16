'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function ApplyButton({ jobId, candidateId }: { jobId: string; candidateId: string }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [coverMessage, setCoverMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleApply() {
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: insertError } = await supabase.from('applications').insert({
      job_id: jobId,
      candidate_id: candidateId,
      cover_message: coverMessage || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark"
      >
        Apply for this Position
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 text-sm text-danger bg-red-50 rounded-lg">{error}</div>
      )}
      <textarea
        rows={3}
        value={coverMessage}
        onChange={(e) => setCoverMessage(e.target.value)}
        placeholder="Optional: Add a message to the employer..."
        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-sm"
      />
      <div className="flex gap-2">
        <button
          onClick={handleApply}
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
        <button
          onClick={() => setShowForm(false)}
          className="px-4 py-2 text-muted hover:text-foreground text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
