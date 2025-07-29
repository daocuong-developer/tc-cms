import React from "react";
import { Settings, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface UserMenuProps {
    open: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ open }) => {
    const { logout } = useAuth();

    if (!open) return null;

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
            <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Settings className="h-4 w-4 mr-2" />
                Settings
            </button>
            <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
            </button>
        </div>
    );
};

export default UserMenu;
