'use client';

import React from 'react';
import { Users, Layers, TrendingUp, ShieldAlert, ArrowUpRight, Plus } from 'lucide-react';
import Button from '@/components/ui/button';
import StatusBadge from '@/components/ui/status-badge';

export default function AdminOverviewPage() {
  const stats = [
    { name: 'Total Tenants', value: '342', change: '+24 this month', icon: Users, color: 'text-indigo-650 bg-indigo-50' },
    { name: 'Active Plans', value: '184', change: '85% Enterprise', icon: Layers, color: 'text-violet-650 bg-violet-50' },
    { name: 'Platform MRR', value: '$34,950.00', change: '+8% vs last month', icon: TrendingUp, color: 'text-emerald-650 bg-emerald-50' },
    { name: 'Moderation Queue', value: '7 Pending', change: 'Immediate attention', icon: ShieldAlert, color: 'text-rose-650 bg-rose-50' },
  ];

  const moderationFlagQueue = [
    { id: '#FLAG-102', tenant: 'Freshcart Shop', reason: 'Profanity in product title', flagger: 'System Scan', severity: 'High', type: 'error' as const },
    { id: '#FLAG-101', tenant: 'Pawluxe Pets', reason: 'Unusual refund rate spike', flagger: 'Risk Engine', severity: 'Medium', type: 'warning' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Super-Admin Overview</h2>
          <p className="text-sm text-gray-500">Global dashboard controls for TrippleShop 2.0 multi-tenant infrastructure.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-1.5 shadow-sm">
            <span>Platform Settings</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>
          <Button className="flex items-center gap-1 bg-violet-600 hover:bg-violet-750">
            <Plus className="h-4 w-4" />
            <span>Create Plan</span>
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">{stat.name}</span>
              <h3 className="text-2xl font-bold text-gray-950">{stat.value}</h3>
              <p className="text-xs text-gray-405 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                {stat.change}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        ))}
      </div>

      {/* Main layout contents */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Moderation Queue */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-xs p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-base font-bold text-gray-900">Flagged Moderation Queue</h4>
            <Button variant="ghost" size="sm" className="text-violet-600 font-semibold hover:text-violet-800">
              Go to Moderation
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-150">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="pb-3">Flag ID</th>
                  <th className="pb-3">Tenant Workspace</th>
                  <th className="pb-3">Trigger Reason</th>
                  <th className="pb-3 text-center">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-sm">
                {moderationFlagQueue.map((flag) => (
                  <tr key={flag.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-gray-800">{flag.id}</td>
                    <td className="py-3 text-gray-600">{flag.tenant}</td>
                    <td className="py-3 text-gray-700">{flag.reason}</td>
                    <td className="py-3 text-center">
                      <StatusBadge status={flag.severity} type={flag.type} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Status info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-6">
          <h4 className="text-base font-bold text-gray-900">Infrastructure Health</h4>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 font-medium">Laravel API Gateway</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-gray-700">Online (Healthy)</span>
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
              <Button variant="outline" className="w-full text-xs">
                Inspect System Logs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
