'use client';

import React, { useState } from 'react';
import { ArrowRight, Sparkles, Store, Check, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { onboardingService } from '@/services/api/onboarding-service';
import Link from 'next/link';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tenant Details
  const [tenantId, setTenantId] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [domain, setDomain] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Branding Details
  const [templateId, setTemplateId] = useState('aurumeclat');
  const [businessDescription, setBusinessDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');

  // Activation & Demo Options
  const [goLiveErrorDetail, setGoLiveErrorDetail] = useState<string | null>(null);
  const [showDemoBypass, setShowDemoBypass] = useState(false);

  const templates = [
    { id: 'aurumeclat', name: 'Aurum Eclat', niche: 'Luxury Goods', desc: 'Luxury jewelry, watches, and fine accessories template.' },
    { id: 'homeluxe', name: 'Home Luxe', niche: 'Home Decor', desc: 'Upscale home interior, furniture, and decor layout.' },
    { id: 'freshcart', name: 'Fresh Cart', niche: 'Groceries', desc: 'Clean layout tailored for groceries and organic food.' },
    { id: 'futurex', name: 'Future X', niche: 'Electronics', desc: 'Dark high-tech layout for modern gadgets and consumer tech.' },
  ];

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !subdomain || !adminName || !adminEmail || !adminPassword) return;

    try {
      setLoading(true);
      setError(null);
      const res = await onboardingService.signup({
        business_name: businessName,
        subdomain: subdomain.toLowerCase().replace(/\s+/g, '-'),
        admin_name: adminName,
        admin_email: adminEmail,
        admin_password: adminPassword,
      });
      setTenantId(res.tenant_id);
      setDomain(res.domain);
      setStep(2);
    } catch (err) {
      const errObj = err as { response?: { status?: number; data?: { message?: string } } };
      const isExpected = errObj.response && (errObj.response.status === 422 || errObj.response.status === 400);
      if (!isExpected) {
        console.error('Signup error:', err);
      } else {
        console.warn('Signup validation:', errObj.response?.data?.message);
      }
      setError(errObj.response?.data?.message || 'Tenant registration failed. Subdomain may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await onboardingService.saveTheme(tenantId, {
        template_id: templateId,
        business_description: businessDescription,
        primary_color: primaryColor,
      });
      setStep(4);
    } catch (err) {
      const errObj = err as { response?: { status?: number; data?: { message?: string } } };
      const isExpected = errObj.response && (errObj.response.status === 422 || errObj.response.status === 400);
      if (!isExpected) {
        console.error('Theme submission error:', err);
      } else {
        console.warn('Theme validation:', errObj.response?.data?.message);
      }
      setError(errObj.response?.data?.message || 'Failed to save theme settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoLiveSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setGoLiveErrorDetail(null);
      setShowDemoBypass(false);
      
      await onboardingService.goLive(tenantId);
      setStep(5);
    } catch (err) {
      const errObj = err as { response?: { status?: number; data?: { message?: string } } };
      const statusMsg = errObj.response?.data?.message || 'Go live check failed.';
      setGoLiveErrorDetail(statusMsg);
      
      const isExpected = errObj.response && (errObj.response.status === 422);
      if (!isExpected) {
        console.error('Go-live error:', err);
      } else {
        console.warn('Go-live expected block:', statusMsg);
      }
      
      // If error is expected 422 product requirement, present clearly labeled Demo Bypass option
      if (errObj.response?.status === 422 && statusMsg.includes('product')) {
        setShowDemoBypass(true);
      } else {
        setError(statusMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypassActivate = () => {
    // Explicit demo fallback bypass mode
    setShowDemoBypass(false);
    setGoLiveErrorDetail(null);
    setStep(5);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px]" />

      {/* Header */}
      <div className="text-center space-y-2 z-10">
        <div className="flex items-center justify-center gap-2">
          <Store className="h-8 w-8 text-indigo-400" />
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            NexStockShop Onboarding
          </span>
        </div>
        <p className="text-slate-400 text-sm">Launch your branded e-commerce storefront in seconds</p>
      </div>

      {/* Stepper Wizard Main Block */}
      <div className="max-w-xl w-full mx-auto bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl z-10 my-8">
        
        {/* Step Indicator Header */}
        {step < 5 && (
          <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-xs transition-colors ${
                    step >= s ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {step > s ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < 4 && <div className={`h-0.5 w-8 sm:w-16 ${step > s ? 'bg-indigo-500' : 'bg-slate-800'}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg flex items-center gap-2 text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: SIGNUP */}
        {step === 1 && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Create your Store Workspace</h3>
              <p className="text-xs text-slate-400">Configure your domain coordinates and administrator profile.</p>
            </div>

            <Input
              label="Business Store Name"
              required
              placeholder="e.g. Acme Luxury Jewelry"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="bg-slate-950 border-slate-800 text-white placeholder-slate-500"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Subdomain Address</label>
              <div className="flex rounded-md shadow-sm">
                <input
                  type="text"
                  required
                  placeholder="acme-luxury"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  className="block w-full rounded-l-md border border-slate-800 bg-slate-950 text-white text-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-hidden"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-800 bg-slate-800 text-slate-400 text-xs font-semibold">
                  .trippleshop.test
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Admin Full Name"
                required
                placeholder="Amina Diop"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />
              <Input
                label="Admin Email"
                type="email"
                required
                placeholder="amina@email.test"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>

            <Input
              label="Admin Password"
              type="password"
              required
              placeholder="••••••••"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />

            <Button type="submit" isLoading={loading} className="w-full flex items-center justify-center gap-1.5 shadow-md">
              <span>Next: Select Theme template</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* STEP 2: THEME SELECTION */}
        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Choose Storefront Theme Template</h3>
              <p className="text-xs text-slate-400">Select a layout matching your product niche. You can adjust colors in the next step.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {templates.map((tpl) => {
                const isSel = templateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setTemplateId(tpl.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSel
                        ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{tpl.niche}</span>
                      <h4 className="font-bold text-white mt-1 text-sm">{tpl.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{tpl.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button type="submit" className="flex-1">Next: Configure Branding</Button>
            </div>
          </form>
        )}

        {/* STEP 3: BRANDING CONFIG */}
        {step === 3 && (
          <form onSubmit={handleThemeSubmit} className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Configure Store Brand</h3>
              <p className="text-xs text-slate-400">Define your primary accent colors and write a store profile description.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Business description</label>
              <textarea
                className="block w-full rounded-md border border-slate-800 bg-slate-950 text-white text-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-hidden"
                rows={3}
                placeholder="Introduce your business to shoppers..."
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Brand Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-10 w-20 border border-slate-800 rounded bg-transparent cursor-pointer"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
                <input
                  type="text"
                  className="block w-32 rounded-md border border-slate-800 bg-slate-950 text-white text-sm p-2 font-mono uppercase focus:outline-hidden"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  maxLength={7}
                />
              </div>
            </div>

            {/* Simulated Storefront Theme Preview Card */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-indigo-400" />
                <span>Live Brand Preview</span>
              </h5>
              <div className="border border-slate-800/80 rounded bg-slate-900 p-3 text-center space-y-2">
                <div className="text-xs font-bold text-white tracking-tight uppercase">{businessName || 'Business Shop'}</div>
                <div className="h-1.5 w-24 bg-slate-800 rounded mx-auto" />
                <button
                  type="button"
                  className="px-4 py-1.5 rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Shopping Accent
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button type="submit" isLoading={loading} className="flex-1">Next: Activate Shop</Button>
            </div>
          </form>
        )}

        {/* STEP 4: ACTIVATION / GO LIVE */}
        {step === 4 && (
          <div className="space-y-6 text-center py-4">
            <div className="space-y-2">
              <Sparkles className="h-12 w-12 text-indigo-400 mx-auto animate-pulse" />
              <h3 className="text-lg font-bold text-white">Activate Storefront Instance</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Ready to activate your database and publish your theme template? Clicking &quot;Go Live&quot; will initialize your shop storefront on domain:
              </p>
              <div className="font-mono text-sm font-semibold bg-slate-950 py-2 px-4 border border-slate-800 rounded-lg inline-block text-indigo-400 mt-2">
                {domain || `${subdomain}.trippleshop.test`}
              </div>
            </div>

            {/* Go Live Fail Status Alert */}
            {goLiveErrorDetail && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-xl text-left text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-400">
                  <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                  <span>Go-Live Product Restriction</span>
                </div>
                <p className="leading-relaxed">
                  Laravel `/go-live` check failed because your tenant database does not have any products. Because backend Product Write APIs are currently not implemented (Person A dependency), you can proceed by toggling the Demo/Development Bypass mode.
                </p>
                <div className="font-semibold p-2 bg-slate-950/80 rounded border border-slate-800 text-[11px]">
                  Server response (422): &quot;{goLiveErrorDetail}&quot;
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800 justify-center">
              {!showDemoBypass ? (
                <>
                  <Button variant="outline" onClick={() => setStep(3)} className="sm:flex-1">Back</Button>
                  <Button onClick={handleGoLiveSubmit} isLoading={loading} className="sm:flex-1 flex items-center justify-center gap-1.5">
                    <span>Activate Store</span>
                  </Button>
                </>
              ) : (
                <div className="w-full space-y-3">
                  <Button
                    onClick={handleDemoBypassActivate}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Demo/Development Bypass & Go Live</span>
                  </Button>
                  <Button variant="ghost" onClick={() => setShowDemoBypass(false)} className="w-full text-slate-400 hover:text-white text-xs">
                    Cancel and Retry Live Validation
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: ONBOARDING COMPLETED */}
        {step === 5 && (
          <div className="text-center space-y-6 py-6">
            <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
              <Check className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Congratulations!</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                Your store &quot;{businessName}&quot; has been initialized. You can now log into your Seller Dashboard using your administrator credentials.
              </p>
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl max-w-sm mx-auto text-left space-y-1.5 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subdomain:</span>
                  <span className="text-slate-350 font-mono">{domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Admin Email:</span>
                  <span className="text-slate-350">{adminEmail}</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <Link href="/seller">
                <Button className="w-full shadow-md">Go to Seller Dashboard</Button>
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Footer link to home */}
      <div className="text-center z-10 text-xs">
        <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Back to Platform Portal
        </Link>
      </div>
    </div>
  );
}
