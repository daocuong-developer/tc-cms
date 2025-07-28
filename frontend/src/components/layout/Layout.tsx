import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import UserMenu from './UserMenu';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeSection, setActiveSection }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        setUserMenuOpen={setUserMenuOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
        <div className="relative">
          <Header setUserMenuOpen={setUserMenuOpen} />
          {userMenuOpen && (
            <div className="absolute right-8 top-16 z-50">
              <UserMenu open={userMenuOpen} />
            </div>
          )}
        </div>
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 