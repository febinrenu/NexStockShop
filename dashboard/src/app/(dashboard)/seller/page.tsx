'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import StatusBadge from '@/components/ui/status-badge';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { sellerService, AnalyticsOverview, Order } from '@/services/api/seller-service';
import Chart from '@/components/ui/chart';

export default function SellerOverviewPage() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverviewData = React.useCallback(async (isMounted: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const data = await sellerService.getAnalytics();
      const orders = await sellerService.getOrdersList();
      if (isMounted) {
        setAnalytics(data);
        setRecentOrders(orders.slice(0, 3));
      }
    } catch (e) {
      console.error(e);
      if (isMounted) {
        setError('Failed to load dashboard metrics. Check server connections.');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      fetchOverviewData(isMounted);
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchOverviewData]);

  if (loading) return <LoadingState />;
  if (error || !analytics) return <ErrorState message={error || undefined} onRetry={() => fetchOverviewData(true)} />;

  const getOrderStatusBadgeType = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'shipped':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const statCards = [
    { name: 'Monthly Revenue', value: `$${(analytics.total_revenue.amount_minor / 100).toLocaleString()}`, change: '+12% vs last month', icon: DollarSign, color: 'text-emerald-650 bg-emerald-50' },
    { name: 'Active Orders', value: analytics.active_orders_count.toString(), change: 'Fulfillment pending', icon: ShoppingCart, color: 'text-indigo-650 bg-indigo-50' },
    { name: 'Total Products', value: analytics.total_products_count.toString(), change: 'Read-only from API', icon: Package, color: 'text-blue-650 bg-blue-50' },
    { name: 'Low Stock Alerts', value: analytics.low_stock_count.toString(), change: 'Action required', icon: AlertTriangle, color: 'text-amber-650 bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Seller Dashboard Overview</h2>
          <p className="text-sm text-gray-500">Acme Jewelers Storefront Manager</p>
        </div>
        <div className="flex gap-2">
          <Link href="/seller/products">
            <Button size="sm" variant="outline">Catalog Editor</Button>
          </Link>
          <Link href="/seller/orders">
            <Button size="sm" className="shadow-sm">Fulfill Orders</Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs text-gray-500 font-semibold tracking-wider uppercase">{stat.name}</span>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
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

      {/* Analytics chart and recent actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-gray-900 mb-2">Revenue Trend</h4>
            <p className="text-xs text-gray-500 mb-6">Daily sales volume tracking (in USD)</p>
          </div>
          <Chart 
            data={analytics.revenue_trend.map(item => ({ label: item.date, value: item.amount }))} 
            type="line" 
            height={200}
            color="indigo"
          />
        </div>

        {/* Recent Activity List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-gray-900 mb-4">Top Seller Products</h4>
            <div className="space-y-4">
              {analytics.top_products.map((p) => (
                <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-0 border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.sales_count} units sold</p>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">{p.revenue_formatted}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t pt-4 mt-6">
            <Link href="/seller/analytics">
              <Button size="sm" variant="outline" className="w-full text-xs">
                Open Detailed Analytics
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-base font-bold text-gray-900">Recent Store Orders</h4>
          <Link href="/seller/orders">
            <Button variant="ghost" size="sm" className="text-indigo-650 font-bold hover:text-indigo-800">
              View All Orders
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-150">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="pb-3">Order Number</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3 text-right">Total</th>
                <th className="pb-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-sm">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50">
                  <td className="py-3 font-semibold text-gray-800">{order.order_number}</td>
                  <td className="py-3 text-gray-650">{order.customer.name}</td>
                  <td className="py-3 text-right text-gray-700 font-semibold">{order.formatted_amount}</td>
                  <td className="py-3 text-center">
                    <StatusBadge status={order.status} type={getOrderStatusBadgeType(order.status)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
