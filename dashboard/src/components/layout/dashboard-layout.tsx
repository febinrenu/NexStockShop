'use client';

import React, { useState } from 'react';
import Sidebar from './sidebar';
import Topbar from './topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpenMobile(!isSidebarOpenMobile);
  };

  const closeSidebar = () => {
    setIsSidebarOpenMobile(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar - Desktop (Static) */}
      <Sidebar className="hidden lg:flex" />

      {/* Sidebar - Mobile (Drawer overlay) */}
      {isSidebarOpenMobile && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={closeSidebar}
          />
          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900">
            <Sidebar onCloseMobile={closeSidebar} />
          </div>
        </div>
      )}

      {/* Main Content Area Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <Topbar onToggleSidebar={toggleSidebar} />

        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 focus:outline-none">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
