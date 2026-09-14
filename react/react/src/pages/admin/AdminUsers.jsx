import { useEffect, useState, useCallback } from 'react';
import { Search, ShieldCheck, User as UserIcon } from 'lucide-react';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users/', {
        params: { page, search: search || undefined },
      });
      setUsers(data.results ?? data);
      setCount(data.count ?? (data.results ?? data).length);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.ceil(count / 12);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Users</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {count} account{count === 1 ? '' : 's'} registered
        </p>
      </div>

      <div className="relative max-w-md">
        <Search
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by username or email…"
          className="input pl-10"
        />
      </div>

      {loading ? (
        <Loader />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">User</th>
                  <th className="px-5 py-3 text-left font-semibold">Role</th>
                  <th className="px-5 py-3 text-center font-semibold">Orders</th>
                  <th className="px-5 py-3 text-left font-semibold">Joined</th>
                  <th className="px-5 py-3 text-left font-semibold">Last login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold uppercase text-brand-700">
                          {u.username[0]}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">
                            {u.full_name || u.username}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {u.email || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {u.is_admin ? (
                        <span className="badge bg-brand-100 text-brand-700">
                          <ShieldCheck size={11} className="mr-1" /> Admin
                        </span>
                      ) : (
                        <span className="badge bg-slate-100 text-slate-600">
                          <UserIcon size={11} className="mr-1" /> Customer
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center font-semibold text-slate-700">
                      {u.order_count ?? 0}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}