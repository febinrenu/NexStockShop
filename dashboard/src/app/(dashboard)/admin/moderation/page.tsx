'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import StatusBadge from '@/components/ui/status-badge';
import { LoadingState } from '@/components/ui/states';
import { adminService, ModerationFlag } from '@/services/api/admin-service';

export default function AdminModerationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data queue lists
  const [flags, setFlags] = useState<ModerationFlag[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');

  // Modal details
  const [selectedFlag, setSelectedFlag] = useState<ModerationFlag | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actioning, setActioning] = useState(false);

  const fetchQueue = React.useCallback(async (isMounted: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const res = await adminService.getModerationQueue(statusFilter !== 'all' ? statusFilter : undefined);
      if (isMounted) {
        setFlags(res.data);
      }
    } catch (e) {
      console.error(e);
      setError('Could not pull moderation flag items from database.');
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [statusFilter, router]);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      fetchQueue(isMounted);
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchQueue]);

  const handleOpenDetail = (flag: ModerationFlag) => {
    setSelectedFlag(flag);
    setIsDetailOpen(true);
  };

  const handleAction = async (status: 'actioned' | 'dismissed') => {
    if (!selectedFlag) return;
    try {
      setActioning(true);
      setError(null);
      await adminService.actionModerationFlag(selectedFlag.id, status);
      setIsDetailOpen(false);
      setSelectedFlag(null);
      fetchQueue(true);
    } catch {
      setError('Failed to update moderation flag status.');
    } finally {
      setActioning(false);
    }
  };

  const getStatusBadgeType = (status: string) => {
    switch (status) {
      case 'actioned':
        return 'error';
      case 'dismissed':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'actioned':
        return 'Banned / Actioned';
      case 'dismissed':
        return 'Cleared / Dismissed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Moderation Queue</h2>
        <p className="text-sm text-gray-500">Monitor flagged content, profanity triggers, and trademark infringements. Take actions to restrict violating tenants.</p>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-250 text-xs font-semibold">
          {[
            { value: 'all', label: 'All Reports' },
            { value: 'pending', label: 'Pending Action' },
            { value: 'actioned', label: 'Banned / Actioned' },
            { value: 'dismissed', label: 'Cleared / Dismissed' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === tab.value
                  ? 'bg-white text-gray-800 shadow-xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg flex items-center gap-2 text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Data display */}
      {loading ? (
        <LoadingState />
      ) : flags.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400 font-semibold bg-white border rounded-xl shadow-xs">
          No moderation reports found in the queue matching criteria.
        </div>
      ) : (
        /* Queue Table */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-150">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Flag ID</th>
                  <th className="px-6 py-3">Trigger Source</th>
                  <th className="px-6 py-3">Trigger Reason</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-sm">
                {flags.map((flag) => (
                  <tr key={flag.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-900">#FLAG-{flag.id}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{flag.trigger_type || 'System Scan'}</td>
                    <td className="px-6 py-4 text-gray-700">{flag.reason}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge
                        status={getStatusLabel(flag.status)}
                        type={getStatusBadgeType(flag.status)}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(flag)}
                        className="text-indigo-650 hover:text-indigo-900 font-bold flex items-center gap-1 ml-auto"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- FLAG DETAIL / RESOLVE MODAL --- */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Moderation Action Center">
        {selectedFlag && (
          <div className="space-y-5">
            {/* Split Info Cards */}
            <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <div className="space-y-1">
                <span className="text-slate-450 uppercase font-bold">Trigger Reason</span>
                <p className="font-semibold text-slate-800">{selectedFlag.reason}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-450 uppercase font-bold">Detection Source</span>
                <p className="font-semibold text-slate-800">{selectedFlag.trigger_type || 'System Engine'}</p>
              </div>
            </div>

            {/* Violating Content display */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Violating Flag Content</label>
              <div className="p-3 bg-red-50/40 border border-red-200 text-red-950 font-mono text-xs rounded-md">
                {selectedFlag.violating_content || 'No violating metadata recorded.'}
              </div>
            </div>

            {/* If actioned, show details */}
            {selectedFlag.status !== 'pending' ? (
              <div className="border-t pt-4 space-y-2 text-xs">
                <span className="text-gray-400 uppercase font-bold block">Resolution Details</span>
                <div className="p-3 bg-slate-50 border rounded-md text-slate-650 flex justify-between">
                  <div>
                    <span className="font-bold">Status:</span> {getStatusLabel(selectedFlag.status)}
                  </div>
                  <div>
                    <span className="font-bold">Actioned By:</span> {String(selectedFlag.actioned_by || 'Admin')}
                  </div>
                </div>
              </div>
            ) : (
              /* Fulfill / Action Form */
              <div className="border-t pt-4 space-y-4">
                <h5 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <ShieldAlert className="h-4.5 w-4.5 text-indigo-500" />
                  <span>Choose Moderation Action</span>
                </h5>
                <p className="text-xs text-gray-400 leading-relaxed">
                  If the content violates safety parameters, choose &quot;Action & Ban&quot;. If it is false positive, choose &quot;Dismiss Report&quot;.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="danger"
                    isLoading={actioning}
                    onClick={() => handleAction('actioned')}
                    className="flex-1 flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Action & Ban Content</span>
                  </Button>
                  <Button
                    isLoading={actioning}
                    onClick={() => handleAction('dismissed')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-650 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Dismiss Report / Clear</span>
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close Panel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
