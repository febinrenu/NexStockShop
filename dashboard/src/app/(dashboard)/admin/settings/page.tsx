'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { LoadingState } from '@/components/ui/states';
import { adminService } from '@/services/api/admin-service';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form settings states
  const [allowNewSignups, setAllowNewSignups] = useState(true);
  const [systemMaintenance, setSystemMaintenance] = useState(false);
  const [registrationLimit, setRegistrationLimit] = useState(500);
  const [defaultPricingTier, setDefaultPricingTier] = useState('starter');

  const fetchSettings = React.useCallback(async (isMounted: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const data = await adminService.getSettings();
      if (isMounted) {
        setAllowNewSignups(data.allow_new_signups === 'true');
        setSystemMaintenance(data.system_maintenance === 'true');
        setRegistrationLimit(parseInt(data.registration_limit) || 500);
        setDefaultPricingTier(data.default_pricing_tier || 'starter');
      }
    } catch (e) {
      console.error(e);
      setError('Could not retrieve platform configuration settings.');
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [router]);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      fetchSettings(isMounted);
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSavedSuccess(false);
      setError(null);
      await adminService.updateSettings({
        allow_new_signups: allowNewSignups ? 'true' : 'false',
        system_maintenance: systemMaintenance ? 'true' : 'false',
        registration_limit: String(registrationLimit),
        default_pricing_tier: defaultPricingTier,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      setError('Failed to update platform settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Platform Global Settings</h2>
        <p className="text-sm text-gray-500">Configure global parameters, maintenance locks, subscription thresholds, and seeder defaults.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg flex items-center gap-2 text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="max-w-2xl bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          <h4 className="text-base font-bold text-gray-900 flex items-center gap-1.5 pb-2 border-b">
            <Settings className="h-5 w-5 text-indigo-500" />
            <span>Infrastructure Configuration</span>
          </h4>

          {/* New Signups Toggle */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-gray-800">Allow New Tenant Registrations</label>
              <p className="text-xs text-gray-400">When disabled, public onboarding /signup steps will return a blocked error.</p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-gray-300 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
              checked={allowNewSignups}
              onChange={(e) => setAllowNewSignups(e.target.checked)}
            />
          </div>

          {/* Maintenance Lock */}
          <div className="flex items-start justify-between gap-4 border-t pt-4">
            <div className="space-y-0.5">
              <label className="text-sm font-semibold text-gray-800">Platform Maintenance Mode</label>
              <p className="text-xs text-gray-400">Lock the central panel. Blocks tenant configuration edits during backend migrations.</p>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-gray-300 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
              checked={systemMaintenance}
              onChange={(e) => setSystemMaintenance(e.target.checked)}
            />
          </div>

          {/* Max Tenants limit */}
          <div className="border-t pt-4 grid sm:grid-cols-2 gap-4">
            <Input
              label="Registration Limit (Max Tenants)"
              type="number"
              required
              value={registrationLimit}
              onChange={(e) => setRegistrationLimit(parseInt(e.target.value) || 0)}
            />

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Default Onboarding Tier</label>
              <select
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 bg-white"
                value={defaultPricingTier}
                onChange={(e) => setDefaultPricingTier(e.target.value)}
              >
                <option value="starter">Starter Plan ($0.00)</option>
                <option value="growth">Growth Plan ($29.00)</option>
                <option value="scale">Scale Plan ($99.00)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
          <Button type="button" variant="outline" onClick={() => fetchSettings(true)} className="flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </Button>
          
          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 py-1.5 px-3 rounded border border-emerald-250">
                Platform settings saved successfully!
              </span>
            )}
            <Button type="submit" isLoading={saving} className="flex items-center gap-1.5">
              <Save className="h-4 w-4" />
              <span>Save Configuration</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
