import React from "react";
import {
    FileText,
    Users,
    CheckCircle,
    BarChart3,
    Search,
    Settings,
    ArrowRight,
    Menu,
    Home,
    Shield,
    Database,
    Activity,
    List,
    Building,
    Monitor
} from "lucide-react";

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    setUserMenuOpen: (open: boolean) => void;
    activeSection: string;
    setActiveSection: (section: string) => void;
}

const sections = [
    { id: "executive", title: "Executive Summary", icon: Home },
    { id: "receiving", title: "Receiving & Returning", icon: ArrowRight },
    { id: "backoffice", title: "Back-office Processing", icon: Users },
    { id: "leadership", title: "Leadership & Approval", icon: CheckCircle },
    { id: "statistics", title: "Statistics & Reporting", icon: BarChart3 },
    { id: "lookup", title: "Lookup & Search", icon: Search },
    { id: "cross-module", title: "Cross-Module Requirements", icon: FileText },
    { id: "technical", title: "Technical Considerations", icon: Database },
    { id: "contract-management", title: "Contract Management", icon: FileText },
    { id: "software-management", title: "Software Management", icon: Monitor },
    { id: "customer-management", title: "Customer Management", icon: Users },
];

const adminSections = [
    { id: "administration", title: "System Administration", icon: Settings },
    { id: "role-list", title: "Role List", icon: List },
    { id: "security", title: "Security & Compliance", icon: Shield },
    { id: "monitoring", title: "System Monitoring", icon: Activity },
    { id: "organizations", title: "Organizations", icon: Building },
    { id: "security-management", title: "Security Management", icon: Users, path: "/admin/security-management" },
];

const Sidebar: React.FC<SidebarProps> = ({
    collapsed,
    setCollapsed,
    setUserMenuOpen,
    activeSection,
    setActiveSection,
}) => (
    <div
        className={`bg-white shadow-lg transition-all duration-300 ${
            collapsed ? "w-16" : "w-64"
        } flex flex-col fixed h-full z-10`}
    >
        <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
                {!collapsed && (
                    <div className="flex items-center">
                        <FileText className="h-8 w-8 text-blue-600 mr-2" />
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">DMS Admin</h1>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>
        </div>
        <nav className="flex-1 p-4 flex flex-col">
            <div className="space-y-1">
                {!collapsed && (
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Documentation
                    </div>
                )}
                {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center px-2 py-2.5 text-sm rounded-lg transition-colors ${
                                isActive
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                            title={collapsed ? section.title : ""}
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            {!collapsed && <span className="ml-3 text-left truncate">{section.title}</span>}
                        </button>
                    );
                })}
            </div>
            <div className="mt-8 pt-4 border-t border-gray-200">
                <div className="space-y-1">
                    {!collapsed && (
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Administration
                        </div>
                    )}
                    {adminSections.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center px-2 py-2.5 text-sm rounded-lg transition-colors ${
                                    isActive
                                        ? "bg-red-50 text-red-700 border border-red-200"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                                title={collapsed ? section.title : ""}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {!collapsed && <span className="ml-3 text-left truncate">{section.title}</span>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    </div>
);

export default Sidebar;
