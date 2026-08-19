import React from 'react';
import Link from 'next/link';
import { Store, ShieldCheck, ChevronRight, UserCog } from 'lucide-react';
import Button from '@/components/ui/button';

export default function DashboardPortalPage() {
  return (
    <div className="py-8 max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center md:text-left mb-10 border-b pb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">NexStockShop Admin Portal</h2>
        <p className="mt-2 text-base text-gray-600">
          Welcome to the TrippleShop 2.0 administration hub. Choose a portal below to access the management interface.
        </p>
      </div>

      {/* Grid of Portals */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Seller Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between p-6">
          <div>
            <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
              <Store className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Seller / Tenant Dashboard</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Manage your individual store workspace. Add catalog items, check inventory levels, fulfill shopper orders, and customize storefront colors or visuals.
            </p>
          </div>
          <div className="mt-8 border-t pt-4">
            <Link href="/seller" className="w-full block">
              <Button className="w-full flex items-center justify-between">
                <span>Enter Seller Dashboard</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Super-Admin Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between p-6">
          <div>
            <div className="h-12 w-12 rounded-lg bg-violet-50 flex items-center justify-center text-violet-650 mb-4">
              <ShieldCheck className="h-6 w-6 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Platform Super-Admin</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Oversee the entire multi-tenant platform. Monitor registered tenants, define pricing tiers, track subscription billing, update platform settings, and moderate content.
            </p>
          </div>
          <div className="mt-8 border-t pt-4">
            <Link href="/admin" className="w-full block">
              <Button variant="outline" className="w-full flex items-center justify-between border-violet-200 text-violet-750 hover:bg-violet-50">
                <span className="text-violet-700 font-semibold">Enter Super-Admin</span>
                <ChevronRight className="h-4 w-4 ml-1 text-violet-500" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-12 p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
        <UserCog className="h-5 w-5 text-slate-500" />
        <p className="text-xs text-slate-600">
          <strong>Note:</strong> Sanctum login sessions are currently bypassed for demonstration. Use the sidebar controls to toggle workspaces.
        </p>
      </div>
    </div>
  );
}
