'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  PackageCheck,
  ShoppingCart,
  Palette,
  BarChart3,
  Users,
  CreditCard,
  Settings,
  ShieldAlert,
  Layers,
  Store,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '', onCloseMobile }) => {
  const pathname = usePathname();

  // Determine current mode based on pathname for demonstration
  const isAdminView = pathname?.startsWith('/admin');
  const isSellerView = pathname?.startsWith('/seller');

  const sellerLinks = [
    { name: 'Overview', href: '/seller', icon: LayoutDashboard },
    { name: 'Products', href: '/seller/products', icon: ShoppingBag },
    { name: 'Inventory', href: '/seller/inventory', icon: PackageCheck },
    { name: 'Orders', href: '/seller/orders', icon: ShoppingCart },
    { name: 'Branding / Theme', href: '/seller/branding', icon: Palette },
    { name: 'Analytics', href: '/seller/analytics', icon: BarChart3 },
  ];

  const adminLinks = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Tenants', href: '/admin/tenants', icon: Users },
    { name: 'Plans', href: '/admin/plans', icon: Layers },
    { name: 'Billing', href: '/admin/billing', icon: CreditCard },
    { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
    { name: 'Moderation', href: '/admin/moderation', icon: ShieldAlert },
  ];

  const activeLinks = isAdminView ? adminLinks : isSellerView ? sellerLinks : [];
  const currentTitle = isAdminView ? 'Super Admin' : isSellerView ? 'Seller Panel' : 'Dashboard';

  return (
    <aside className={`w-64 bg-slate-900 text-slate-100 flex flex-col h-full border-r border-slate-800 ${className}`}>
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
        <Store className="h-6 w-6 text-indigo-400" />
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          NexStockShop
        </span>
      </div>

      {/* Role / View Status Indicator */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Workspace</p>
        <h4 className="text-sm font-bold text-slate-200 mt-0.5">{currentTitle}</h4>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {activeLinks.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-350 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              />
              {item.name}
            </Link>
          );
        })}

        {activeLinks.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            Please choose a dashboard workspace from the home page.
          </div>
        )}
      </nav>

      {/* Context Switcher (Quick Toggle for Demo / Verification) */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20 space-y-2">
        <p className="text-xxs uppercase tracking-wider text-slate-500 font-semibold px-2">Demo View Toggle</p>
        <div className="grid grid-cols-2 gap-2 text-center text-xs font-medium">
          <Link
            href="/seller"
            className={`py-1.5 rounded-md transition-all ${
              isSellerView
                ? 'bg-slate-800 text-indigo-400 font-bold border border-slate-700'
                : 'text-slate-450 hover:bg-slate-800/50'
            }`}
          >
            Seller View
          </Link>
          <Link
            href="/admin"
            className={`py-1.5 rounded-md transition-all ${
              isAdminView
                ? 'bg-slate-800 text-indigo-400 font-bold border border-slate-700'
                : 'text-slate-450 hover:bg-slate-800/50'
            }`}
          >
            Admin View
          </Link>
        </div>
        <Link
          href="/dashboard"
          className="block w-full text-center py-2 text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-850 hover:bg-slate-800 rounded-md transition-colors"
        >
          Back to Portal
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
