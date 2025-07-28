import React from 'react';
import { Bell, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  setUserMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ setUserMenuOpen }) => (
  <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-2">
    <div className="flex items-center justify-between">
      <div>
        <input
          type="text"
          placeholder="Search..."
          className="w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
          <Bell className="h-5 w-5" />
        </button>
        <div className="h-8 w-px bg-gray-300"></div>
        <button
          onClick={() => setUserMenuOpen((open: boolean) => !open)}
          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
        >
          <User className="h-5 w-5 flex-shrink-0" />
          <span className="ml-3 flex-1 text-left">Admin User</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  </header>
);

export default Header; 