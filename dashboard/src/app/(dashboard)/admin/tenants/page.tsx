'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, AlertCircle } from 'lucide-react';
import StatusBadge from '@/components/ui/status-badge';
import { LoadingState } from '@/components/ui/states';
import { adminService, PlatformTenant } from '@/services/api/admin-service';

export default function AdminTenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<PlatformTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchTenants = React.useCallback(async (isMounted: boolean) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const data = await adminService.getTenantsList();
      if (isMounted) {
        setTenants(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [router]);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      fetchTenants(isMounted);
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchTenants]);

  const handleToggleStatus = async (tenantId: string, nextStatus: 'active' | 'suspended') => {
    try {
      setActioningId(tenantId);
      const updated = await adminService.updateTenantStatus(tenantId, nextStatus);
      setTenants(prev => prev.map(t => t.id === tenantId ? updated : t));
    } catch (e) {
      console.error(e);
      alert('Failed to update tenant status.');
    } finally {
      setActioningId(null);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeType = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Registered Platform Tenants</h2>
        <p className="text-sm text-gray-500">Global catalog listing active business storefront workspaces. Database swaps resolve dynamically on host domains.</p>
      </div>

      {/* Info Warning Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 p-3 rounded-lg flex items-center gap-2 text-xs">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>Central Tenant Control and suspend/activate status update APIs are integrated. Tenant database resolution happens dynamically on domain routing.</span>
      </div>

      {/* Search Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by store name or subdomain domain..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data display */}
      {loading ? (
        <LoadingState />
      ) : filteredTenants.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400 font-semibold bg-white border rounded-xl shadow-xs">
          No registered tenants found matching query.
        </div>
      ) : (
        /* Tenants Table */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-150">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Store Name</th>
                  <th className="px-6 py-3">Domain Workspace</th>
                  <th className="px-6 py-3 text-right">MRR contribution</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Created Date</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-sm">
                {filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{t.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-indigo-650">{t.domain}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-800">${t.mrr.toFixed(2)} USD</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={t.status.toUpperCase()} type={getStatusBadgeType(t.status)} />
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500 text-xs">{t.created_at}</td>
                    <td className="px-6 py-4 text-center">
                      {t.status === 'active' ? (
                        <button
                          onClick={() => handleToggleStatus(t.id, 'suspended')}
                          disabled={actioningId === t.id}
                          className="text-xs text-red-650 hover:text-red-800 font-bold border border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100/50 px-2.5 py-1 rounded transition-colors"
                        >
                          {actioningId === t.id ? 'Suspending...' : 'Suspend'}
                        </button>
                      ) : t.status === 'suspended' ? (
                        <button
                          onClick={() => handleToggleStatus(t.id, 'active')}
                          disabled={actioningId === t.id}
                          className="text-xs text-emerald-650 hover:text-emerald-800 font-bold border border-emerald-200 hover:border-emerald-400 bg-emerald-50 hover:bg-emerald-100/50 px-2.5 py-1 rounded transition-colors"
                        >
                          {actioningId === t.id ? 'Activating...' : 'Activate'}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
