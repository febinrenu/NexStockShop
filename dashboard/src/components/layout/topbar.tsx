'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Bell, User, LogOut, ChevronDown, Store } from 'lucide-react';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const pathname = usePathname();

  // Determine current mode and title
  const isAdminView = pathname?.startsWith('/admin');
  const isSellerView = pathname?.startsWith('/seller');

  // Breadcrumbs/Title parsing
  const getPageTitle = () => {
    if (!pathname) return 'Dashboard';
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return 'Overview';
    return parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
  };

  // Mock contextual info
  const tenantName = isSellerView ? 'Acme Jewelers' : null;
  const tenantDomain = isSellerView ? 'acme.localhost' : null;
  const userName = isAdminView ? 'Super Admin' : 'Jane (Store Owner)';
  const userEmail = isAdminView ? 'admin@trippleshop.com' : 'jane@acme.test';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
      {/* Left: Mobile Toggle & Page Title & Context */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 font-medium">
              {isAdminView ? 'Admin' : isSellerView ? 'Seller' : 'Portal'}
            </span>
            <span className="text-gray-300 text-xs">/</span>
            <h1 className="text-base font-bold text-gray-800 tracking-tight">{getPageTitle()}</h1>
          </div>

          {/* Tenant store context info */}
          {isSellerView && tenantName && (
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
              <Store className="h-3.5 w-3.5 text-indigo-500" />
              <span className="font-semibold text-gray-700">{tenantName}</span>
              <span className="text-gray-300">|</span>
              <span className="font-mono bg-gray-100 px-1.5 py-0.2 rounded text-[10px]">{tenantDomain}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions (Notification, Profile & Logout) */}
      <div className="flex items-center gap-4">
        {/* Mock Notifications */}
        <button
          type="button"
          className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full hover:bg-gray-50"
        >
          <span className="sr-only">Notifications</span>
          <Bell className="h-6 w-6" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-gray-200" />

        {/* User Card & Logout placeholders */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-gray-700">{userName}</span>
            <span className="text-xs text-gray-500">{userEmail}</span>
          </div>

          {/* Dropdown Menu / Avatar */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1 p-1 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-250 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>

            {/* Quick dropdown mock box */}
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 hidden group-hover:block hover:block">
              <div className="px-4 py-2 border-b border-gray-150 text-xs sm:hidden">
                <p className="font-semibold text-gray-700">{userName}</p>
                <p className="text-gray-500 truncate">{userEmail}</p>
              </div>
              <a
                href="#profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={(e) => e.preventDefault()}
              >
                <User className="mr-2 h-4 w-4 text-gray-400" />
                Profile Settings
              </a>
              <a
                href="#logout"
                className="flex items-center px-4 py-2 text-sm text-red-650 hover:bg-red-50 hover:text-red-750 border-t border-gray-150"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Demo Logout: Authed state would clear and redirect to login.');
                }}
              >
                <LogOut className="mr-2 h-4 w-4 text-red-400" />
                Log out
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
