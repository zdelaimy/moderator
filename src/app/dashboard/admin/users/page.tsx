import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <Link href="/dashboard/admin" className="text-sm text-primary hover:underline mb-4 inline-block">
        &larr; Back to admin
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-6">Users ({users?.length ?? 0})</h1>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-muted">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Email</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Role</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Location</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-foreground">
                  {user.first_name} {user.last_name}
                </td>
                <td className="px-4 py-3 text-muted">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-0.5 rounded capitalize bg-gray-100 text-muted">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{user.location ?? '—'}</td>
                <td className="px-4 py-3 text-muted">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
