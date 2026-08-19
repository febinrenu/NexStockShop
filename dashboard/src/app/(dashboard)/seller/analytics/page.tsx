'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Percent } from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { sellerService, AnalyticsOverview } from '@/services/api/seller-service';
import Chart from '@/components/ui/chart';

export default function SellerAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = React.useCallback(async (isMounted: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const data = await sellerService.getAnalytics();
      if (isMounted) {
        setAnalytics(data);
      }
    } catch (e) {
      console.error(e);
      if (isMounted) {
        setError('Could not compile analytics reports. Check API connectivity.');
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
      fetchAnalytics(isMounted);
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchAnalytics]);

  if (loading) return <LoadingState />;
  if (error || !analytics) return <ErrorState message={error || undefined} onRetry={() => fetchAnalytics(true)} />;

  const metricCards = [
    { name: 'Store Sales MRR', value: `$${(analytics.total_revenue.amount_minor / 100).toLocaleString()}`, change: '+12.4%', icon: DollarSign, color: 'text-indigo-650 bg-indigo-50' },
    { name: 'Total Transactions', value: '184', change: '+8.2%', icon: ShoppingCart, color: 'text-violet-650 bg-violet-50' },
    { name: 'Average Order Basket', value: '$45.92', change: '+1.5%', icon: Percent, color: 'text-blue-650 bg-blue-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
        <p className="text-sm text-gray-500">View store sales performance, revenue trends, conversion aggregates, and product rankings.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {metricCards.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs text-gray-500 font-semibold tracking-wider uppercase">{stat.name}</span>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
                <TrendingUp className="h-3.5 w-3.5" />
                {stat.change}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Grid of charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales trend */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="mb-6">
            <h4 className="text-base font-bold text-gray-900">Revenue Growth Line</h4>
            <p className="text-xs text-gray-400 mt-1">Daily gross revenue sales tracking (USD)</p>
          </div>
          <Chart
            data={analytics.revenue_trend.map(r => ({ label: r.date, value: r.amount }))}
            type="line"
            height={220}
            color="indigo"
          />
        </div>

        {/* Orders status distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="mb-6">
            <h4 className="text-base font-bold text-gray-900">Fulfillment Status Distribution</h4>
            <p className="text-xs text-gray-400 mt-1">Breakdown of orders in processing queue</p>
          </div>
          <Chart
            data={analytics.order_status_distribution.map(o => ({ label: o.status.toUpperCase(), value: o.count }))}
            type="bar"
            height={220}
            color="violet"
          />
        </div>
      </div>

      {/* Tables row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top products list */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h4 className="text-base font-bold text-gray-900 mb-6">Top Product Sales Performance</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-150">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="pb-3">Product Title</th>
                  <th className="pb-3 text-center">Units Sold</th>
                  <th className="pb-3 text-right">Gross Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-sm">
                {analytics.top_products.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-gray-800">{item.name}</td>
                    <td className="py-3 text-center font-bold text-gray-700">{item.sales_count}</td>
                    <td className="py-3 text-right font-bold text-indigo-650">{item.revenue_formatted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Conversion stats */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h4 className="text-base font-bold text-gray-900">Sales Insights</h4>
          <div className="space-y-4 text-xs text-gray-500 leading-relaxed">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800">Jewelry Segment Demand</span>
              <p className="mt-1">
                Eternity rings represents 72% of total store revenue this week. Recommendation: Ensure variant sizes 6 and 7 are restocked to avoid cart drop-offs.
              </p>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800">Checkout Conversion</span>
              <p className="mt-1">
                Shopping cart abandonment rate is hovering around 24%. Confirm payment gateway setups are fully active on checkout domains.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
