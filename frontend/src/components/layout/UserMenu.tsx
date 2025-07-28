import React from 'react';
import { Settings, LogOut } from 'lucide-react';

interface UserMenuProps {
  open: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ open }) => {
  if (!open) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
      <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </button>
      <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </button>
    </div>
  );
};

export default UserMenu; 