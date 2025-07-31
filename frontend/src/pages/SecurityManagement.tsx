import React, { useState } from "react";
import {
    Users,
    Shield,
    UserPlus,
    Edit,
    Trash2,
    Search,
    Filter,
    Plus,
    Eye,
    Lock,
    Unlock,
    MoreVertical,
} from "lucide-react";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    status: "active" | "inactive";
    lastLogin: string;
}

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    userCount: number;
}

interface Group {
    id: string;
    name: string;
    description: string;
    members: number;
    roles: string[];
}

interface Permission {
    id: string;
    name: string;
    module: string;
    description: string;
    type: "read" | "write" | "delete" | "admin";
}

const SecurityManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"users" | "roles" | "groups" | "permissions">("users");
    const [searchTerm, setSearchTerm] = useState("");

    // Sample data
    const users: User[] = [
        {
            id: "1",
            name: "John Doe",
            email: "john.doe@dms.com",
            role: "Administrator",
            department: "IT",
            status: "active",
            lastLogin: "2025-01-15 09:30",
        },
        {
            id: "2",
            name: "Jane Smith",
            email: "jane.smith@dms.com",
            role: "Processing Officer",
            department: "Operations",
            status: "active",
            lastLogin: "2025-01-15 08:45",
        },
        {
            id: "3",
            name: "Mike Johnson",
            email: "mike.johnson@dms.com",
            role: "Reception Clerk",
            department: "Front Office",
            status: "inactive",
            lastLogin: "2025-01-14 17:20",
        },
    ];

    const roles: Role[] = [
        {
            id: "1",
            name: "Administrator",
            description: "Full system access and management capabilities",
            permissions: ["user_management", "system_config", "security_admin", "all_modules"],
            userCount: 2,
        },
        {
            id: "2",
            name: "Processing Officer",
            description: "Document processing and workflow management",
            permissions: ["document_process", "workflow_manage", "status_update"],
            userCount: 15,
        },
        {
            id: "3",
            name: "Reception Clerk",
            description: "Document receiving and basic operations",
            permissions: ["document_receive", "basic_search", "status_view"],
            userCount: 8,
        },
    ];

    const groups: Group[] = [
        {
            id: "1",
            name: "IT Department",
            description: "Information Technology staff with system access",
            members: 5,
            roles: ["Administrator", "System Analyst"],
        },
        {
            id: "2",
            name: "Operations Team",
            description: "Document processing and workflow management team",
            members: 20,
            roles: ["Processing Officer", "Quality Reviewer"],
        },
        {
            id: "3",
            name: "Front Office",
            description: "Customer-facing staff handling document reception",
            members: 12,
            roles: ["Reception Clerk", "Customer Service"],
        },
    ];

    const permissions: Permission[] = [
        {
            id: "1",
            name: "User Management",
            module: "Administration",
            description: "Create, edit, and delete user accounts",
            type: "admin",
        },
        {
            id: "2",
            name: "Document Processing",
            module: "Back-office",
            description: "Process and update document status",
            type: "write",
        },
        {
            id: "3",
            name: "Document Viewing",
            module: "All Modules",
            description: "View document details and status",
            type: "read",
        },
        {
            id: "4",
            name: "System Configuration",
            module: "Administration",
            description: "Modify system settings and configurations",
            type: "admin",
        },
    ];

    const tabs = [
        { id: "users", label: "Users", icon: Users, count: users.length },
        { id: "roles", label: "Roles", icon: Shield, count: roles.length },
        { id: "groups", label: "Groups", icon: Users, count: groups.length },
        { id: "permissions", label: "Permissions", icon: Lock, count: permissions.length },
    ];

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
        if (status === "active") {
            return `${baseClasses} bg-green-100 text-green-800`;
        }
        return `${baseClasses} bg-red-100 text-red-800`;
    };

    const getPermissionTypeBadge = (type: string) => {
        const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
        switch (type) {
            case "admin":
                return `${baseClasses} bg-red-100 text-red-800`;
            case "write":
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case "delete":
                return `${baseClasses} bg-orange-100 text-orange-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const renderUsers = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </button>
                </div>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                </button>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Department
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Login
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.department}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={getStatusBadge(user.status)}>{user.status}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLogin}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button className="text-blue-600 hover:text-blue-900">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button className="text-gray-600 hover:text-gray-900">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderRoles = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Role Management</h3>
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                                <Shield className="h-8 w-8 text-green-600 mr-3" />
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900">{role.name}</h4>
                                    <p className="text-sm text-gray-500">{role.userCount} users</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-500 uppercase">Permissions</p>
                            <div className="flex flex-wrap gap-1">
                                {role.permissions.slice(0, 3).map((permission, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                        {permission.replace("_", " ")}
                                    </span>
                                ))}
                                {role.permissions.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                        +{role.permissions.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderGroups = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Group Management</h3>
                <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.map((group) => (
                    <div key={group.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h4 className="text-lg font-medium text-gray-900">{group.name}</h4>
                                <p className="text-sm text-gray-500">{group.members} members</p>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-500 uppercase">Assigned Roles</p>
                            <div className="flex flex-wrap gap-1">
                                {group.roles.map((role, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                                    >
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPermissions = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Permission Management</h3>
                <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Permission
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Permission
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Module
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {permissions.map((permission) => (
                            <tr key={permission.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <Lock className="h-4 w-4 text-gray-400 mr-2" />
                                        <span className="text-sm font-medium text-gray-900">{permission.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {permission.module}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={getPermissionTypeBadge(permission.type)}>{permission.type}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{permission.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button className="text-gray-600 hover:text-gray-900">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Security Management</h3>
                <p className="text-gray-700 leading-relaxed">
                    Manage users, roles, groups, and permissions to ensure proper access control and security across the
                    document management system.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                <Icon className="h-5 w-5 mr-2" />
                                {tab.label}
                                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === "users" && renderUsers()}
                {activeTab === "roles" && renderRoles()}
                {activeTab === "groups" && renderGroups()}
                {activeTab === "permissions" && renderPermissions()}
            </div>
        </div>
    );
};

export default SecurityManagement;
