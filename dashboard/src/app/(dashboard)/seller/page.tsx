'use client';

import React from 'react';
import { DollarSign, ShoppingCart, Package, AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react';
import Button from '@/components/ui/button';
import StatusBadge from '@/components/ui/status-badge';

export default function SellerOverviewPage() {
  const stats = [
    { name: 'Monthly Revenue', value: '$8,450.00', change: '+12%', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Active Orders', value: '18', change: '+4 yesterday', icon: ShoppingCart, color: 'text-indigo-600 bg-indigo-50' },
    { name: 'Total Products', value: '142', change: '2 variants low', icon: Package, color: 'text-blue-600 bg-blue-50' },
    { name: 'Alerts', value: '2 Pending', change: 'Action required', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
  ];

  const recentOrders = [
    { id: '#ORD-9821', customer: 'Amina Diop', total: '$145.00', status: 'Processing', type: 'info' as const },
    { id: '#ORD-9820', customer: 'Sarih Al-Mutairi', total: '$320.00', status: 'Shipped', type: 'success' as const },
    { id: '#ORD-9819', customer: 'John Doe', total: '$89.00', status: 'Pending Payment', type: 'warning' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Seller Dashboard Overview</h2>
          <p className="text-sm text-gray-500">Welcome back, Jane. Here is what is happening at Acme Jewelers today.</p>
        </div>
        <Button className="flex items-center gap-1.5 shadow-sm">
          <span>Manage Catalog</span>
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">{stat.name}</span>
              <h3 className="text-2xl font-bold text-gray-950">{stat.value}</h3>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
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
        {/* Recent orders card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-xs p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-base font-bold text-gray-900">Recent Store Orders</h4>
            <Button variant="ghost" size="sm" className="text-indigo-600 font-semibold hover:text-indigo-800">
              View All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-150">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3 text-right">Total</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-sm">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-gray-800">{order.id}</td>
                    <td className="py-3 text-gray-600">{order.customer}</td>
                    <td className="py-3 text-right text-gray-700 font-medium">{order.total}</td>
                    <td className="py-3 text-center">
                      <StatusBadge status={order.status} type={order.type} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick settings/branding info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-6">
          <h4 className="text-base font-bold text-gray-900">Storefront Branding</h4>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 font-medium">Selected Theme Layout</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">aurumeclat-homepage (Luxury Jewelry)</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-400 font-medium">Primary Accent Color</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-5 w-5 rounded bg-indigo-600 border border-gray-300" />
                <span className="text-sm font-mono text-gray-600">#4f46e5</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                This store is running on active sub-domain routing. Any changes to theme selection will update your public shop storefront immediately.
              </p>
              <Button variant="outline" className="w-full text-xs">
                Edit Theme & Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
