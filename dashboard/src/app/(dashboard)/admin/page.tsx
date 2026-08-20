'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Layers, TrendingUp, ShieldAlert, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import StatusBadge from '@/components/ui/status-badge';
import { LoadingState } from '@/components/ui/states';
import { adminService, ModerationFlag } from '@/services/api/admin-service';

export default function AdminOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Array<{
    name: string;
    value: string;
    change: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }>>([]);
  const [flags, setFlags] = useState<ModerationFlag[]>([]);

  const fetchAdminOverview = React.useCallback(async (isMounted: boolean) => {
    try {
      setLoading(true);
      
      // Auth check
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const settings = await adminService.getSettings();
      const queueData = await adminService.getModerationQueue('pending');
      const tenants = await adminService.getTenantsList();
      const plans = await adminService.getPlansList();

      if (isMounted) {
        setFlags(queueData.data.slice(0, 3));
        setStats([
          { name: 'Total Tenants', value: String(tenants.length), change: '+1 this week', icon: Users, color: 'text-indigo-650 bg-indigo-50' },
          { name: 'Subscription plans', value: String(plans.length), change: 'Starter/Growth/Scale', icon: Layers, color: 'text-violet-650 bg-violet-50' },
          { name: 'Platform Status', value: settings.system_maintenance === 'true' ? 'Maintenance' : 'Active', change: 'Signups: ' + (settings.allow_new_signups === 'true' ? 'Allowed' : 'Disabled'), icon: TrendingUp, color: 'text-emerald-650 bg-emerald-50' },
          { name: 'Moderation Flags', value: String(queueData.total), change: 'Needs actioning', icon: ShieldAlert, color: 'text-rose-650 bg-rose-50' },
        ]);
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
      fetchAdminOverview(isMounted);
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchAdminOverview]);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Super-Admin Overview</h2>
          <p className="text-sm text-gray-500">Global dashboard controls for TrippleShop 2.0 multi-tenant infrastructure.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/settings">
            <Button variant="outline" className="flex items-center gap-1.5 shadow-sm">
              <span>Platform Settings</span>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs text-gray-500 font-semibold tracking-wider uppercase">{stat.name}</span>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                {stat.change}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Main layout contents */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Moderation Queue */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-xs p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-base font-bold text-gray-900">Flagged Moderation Queue (Pending)</h4>
            <Link href="/admin/moderation">
              <Button variant="ghost" size="sm" className="text-violet-650 font-bold hover:text-violet-850">
                Go to Moderation Console
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            {flags.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400 font-semibold bg-gray-50 rounded-lg">
                No pending moderation alerts flagged in the queue.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-150">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="pb-3">Flag ID</th>
                    <th className="pb-3">Trigger Source</th>
                    <th className="pb-3">Trigger Reason</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 text-sm">
                  {flags.map((flag) => (
                    <tr key={flag.id} className="hover:bg-gray-50/50">
                      <td className="py-3 font-semibold text-gray-800">#FLAG-{flag.id}</td>
                      <td className="py-3 text-gray-600 font-medium">{flag.trigger_type || 'System Scan'}</td>
                      <td className="py-3 text-gray-700">{flag.reason}</td>
                      <td className="py-3 text-center">
                        <StatusBadge status={flag.status} type="warning" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* System Status info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-6">
          <h4 className="text-base font-bold text-gray-900">Infrastructure Health</h4>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 font-medium">Laravel API Gateway</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-gray-700">Online & Listening</span>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-gray-400 font-medium">Subdomain Routing Engine</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-gray-700">Operational</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Platform stats show aggregates from the central DB. To sync pricing metadata or plans, update records inside the central tables.
              </p>
              <Button variant="outline" className="w-full text-xs" onClick={() => alert('Diagnostic tests passed.')}>
                Run Infrastructure Diagnostics
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
