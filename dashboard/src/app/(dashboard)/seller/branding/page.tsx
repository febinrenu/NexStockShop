'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Check, Save, Image as ImageIcon, Eye } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { LoadingState } from '@/components/ui/states';
import { sellerService, BrandingSettings } from '@/services/api/seller-service';

export default function SellerBrandingPage() {
  const [settings, setSettings] = useState<BrandingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState('#4f46e5');
  const [formThemeId, setFormThemeId] = useState('aurumeclat');

  const fetchBranding = React.useCallback(async (isMounted: boolean) => {
    try {
      setLoading(true);
      const data = await sellerService.getBrandingSettings();
      if (isMounted) {
        setSettings(data);
        setFormName(data.store_name);
        setFormColor(data.primary_color);
        setFormThemeId(data.theme_template_id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      fetchBranding(isMounted);
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchBranding]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSavedSuccess(false);
      const updated = await sellerService.saveBrandingSettings({
        store_name: formName,
        primary_color: formColor,
        theme_template_id: formThemeId,
      });
      setSettings(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Storefront Branding</h2>
        <p className="text-sm text-gray-500">Configure your store identity, accent colors, and template layout. These options dynamically brand your customer-facing pages.</p>
      </div>

      <form onSubmit={handleSave} className="grid lg:grid-cols-3 gap-6">
        {/* Branding inputs card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
            <h4 className="text-base font-bold text-gray-900 flex items-center gap-1.5 pb-2 border-b">
              <Palette className="h-5 w-5 text-indigo-500" />
              <span>Identity & Palette</span>
            </h4>

            {/* Store Name */}
            <Input
              label="Storefront Business Name"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Acme Jewelers"
            />

            {/* Logo placeholder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Logo</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-650 justify-center">
                    <span className="relative cursor-pointer bg-white rounded-md font-semibold text-indigo-600 hover:text-indigo-500 px-1 border">
                      Upload logo image
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">PNG or JPG up to 2MB (recommended 400x100px)</p>
                </div>
              </div>
            </div>

            {/* Accent Color picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Theme Accent Color</label>
              <p className="text-xs text-gray-400 mb-2">Used for buttons, links, search highlights, and header borders.</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                />
                <input
                  type="text"
                  className="block w-32 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 font-mono uppercase"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Theme grid */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h4 className="text-base font-bold text-gray-900 pb-2 border-b">Storefront Theme Template</h4>
            <p className="text-xs text-gray-400">Select a homepage template to layout your store catalog. Each template targets a specific business niche.</p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {settings.theme_templates_available.map((theme) => {
                const isSelected = formThemeId === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => setFormThemeId(theme.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-gray-450 uppercase tracking-wider">{theme.niche}</span>
                        {isSelected && <Check className="h-4 w-4 text-indigo-600" />}
                      </div>
                      <h5 className="font-bold text-gray-900 mt-1">{theme.name}</h5>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">{theme.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Preview / Sticky Save */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 sticky top-6">
            <h4 className="text-base font-bold text-gray-900 flex items-center gap-1.5 pb-2 border-b">
              <Eye className="h-5 w-5 text-gray-400" />
              <span>Theme Preview</span>
            </h4>

            {/* Simulating Storefront preview badge */}
            <div className="border border-gray-150 rounded-lg p-4 bg-slate-50 space-y-4 text-center">
              <div className="h-8 w-24 bg-gray-200 rounded mx-auto flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                {formName || 'Store Logo'}
              </div>
              <hr />
              <div className="space-y-2">
                <div className="h-2 w-32 bg-gray-200 rounded mx-auto" />
                <div className="h-2 w-20 bg-gray-200 rounded mx-auto" />
              </div>
              <button
                type="button"
                className="w-full py-2 px-4 rounded text-xs font-semibold text-white transition-colors"
                style={{ backgroundColor: formColor }}
                onClick={() => alert(`Accent Color ${formColor} Trigger Test`)}
              >
                Shop Accent Button
              </button>
            </div>

            <div className="border-t pt-4 space-y-3">
              <Button type="submit" isLoading={saving} className="w-full flex items-center justify-center gap-1.5 shadow-sm">
                <Save className="h-4 w-4" />
                <span>Save Branding Changes</span>
              </Button>
              {savedSuccess && (
                <p className="text-center text-xs text-emerald-600 font-semibold bg-emerald-50 py-1.5 rounded border border-emerald-200">
                  Branding settings saved successfully!
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
