'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'] as const;

const statusColors: Record<string, string> = {
  pending: 'border-gray-300',
  reviewed: 'border-blue-300',
  shortlisted: 'border-green-300',
  rejected: 'border-red-300',
  accepted: 'border-emerald-300',
};

export default function StatusSelect({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: string;
}) {
  const router = useRouter();

  async function handleChange(newStatus: string) {
    const supabase = createClient();
    await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId);
    router.refresh();
  }

  return (
    <select
      value={currentStatus}
      onChange={(e) => handleChange(e.target.value)}
      className={`text-sm px-2 py-1 rounded border ${statusColors[currentStatus] ?? ''} focus:outline-none focus:ring-2 focus:ring-primary-light`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="capitalize">
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}
