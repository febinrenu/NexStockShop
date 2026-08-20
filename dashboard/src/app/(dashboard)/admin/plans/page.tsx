'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { LoadingState } from '@/components/ui/states';
import { adminService, SubscriptionPlan } from '@/services/api/admin-service';

export default function AdminPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = React.useCallback(async (isMounted: boolean) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const data = await adminService.getPlansList();
      if (isMounted) {
        setPlans(data);
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
      fetchPlans(isMounted);
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchPlans]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Subscription Plans Management</h2>
        <p className="text-sm text-gray-500">Edit billing intervals, currency definitions, product listing quotas, and staff limits across pricing plans.</p>
      </div>

      {/* Info Warning Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 p-3 rounded-lg flex items-center gap-2 text-xs">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>Central Billing Plans CRUD APIs are currently unavailable (Person A dependency). Showing mock listings.</span>
      </div>

      {/* Data display */}
      {loading ? (
        <LoadingState />
      ) : (
        /* Plans Grid */
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const features = Object.entries(p.feature_flags)
              .map(([key, val]) => `${key.replace(/_/g, ' ')}: ${val ? 'Enabled' : 'Disabled'}`);

            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xxs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                      Plan ID #{p.id}
                    </span>
                    {p.is_active && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500" title="Active Plan" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{p.name}</h4>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">slug: {p.slug}</p>
                  </div>

                  {/* Pricing Details */}
                  <div className="text-2xl font-extrabold text-slate-800">
                    ${(p.price_cents / 100).toFixed(2)}
                    <span className="text-xs font-semibold text-slate-400">/{p.billing_interval}</span>
                  </div>

                  {/* Limits */}
                  <div className="border-t border-b py-3 space-y-2 text-xs text-gray-650">
                    <div className="flex justify-between">
                      <span>Product Limit:</span>
                      <span className="font-semibold text-gray-800">{p.product_limit !== null ? `${p.product_limit} items` : 'Unlimited'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Staff Accounts:</span>
                      <span className="font-semibold text-gray-800">{p.staff_limit !== null ? `${p.staff_limit} accounts` : 'Unlimited'}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-1.5 text-xxs text-gray-500 font-semibold uppercase tracking-wider">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t text-center">
                  <button
                    onClick={() => alert('Plan configuration edit blocked: missing backend plan edit APIs.')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-850"
                  >
                    Edit Limits & Flags
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
