'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import StatusBadge from '@/components/ui/status-badge';
import { LoadingState } from '@/components/ui/states';
import { adminService, BillingInvoice } from '@/services/api/admin-service';

export default function AdminBillingPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBilling = React.useCallback(async (isMounted: boolean) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const data = await adminService.getBillingLogs();
      if (isMounted) {
        setInvoices(data);
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
      fetchBilling(isMounted);
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchBilling]);

  const getStatusBadgeType = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'failed':
        return 'error';
      case 'open':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Platform Billing Logs</h2>
        <p className="text-sm text-gray-500">Track tenant subscription payments, invoice transactions, and Stripe checkout session states.</p>
      </div>

      {/* Info Warning Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 p-3 rounded-lg flex items-center gap-2 text-xs">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>Central Stripe Webhook invoices and subscription CRUD routes are currently managed in the backend (Person A). Showing mock billing logs.</span>
      </div>

      {/* Data display */}
      {loading ? (
        <LoadingState />
      ) : (
        /* Invoices Table */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-150">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Invoice ID</th>
                  <th className="px-6 py-3">Tenant Client</th>
                  <th className="px-6 py-3 text-right">Amount Charged</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Invoice Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-sm">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-650">#{inv.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{inv.tenant_name}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-800">{inv.amount_formatted}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={inv.status.toUpperCase()} type={getStatusBadgeType(inv.status)} />
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500 text-xs">{inv.created_at}</td>
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
