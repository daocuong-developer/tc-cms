import React, { useState, useEffect, useCallback } from "react";
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
import { useAuth } from "@contexts/AuthContext";
import { securityService, UserDetail, RoleDetail, PermissionDetail, DepartmentDetail } from "@services/securityApi";

const SecurityManagement: React.FC = () => {
    const { user, hasPermission, isLoading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<"users" | "roles" | "departments" | "permissions">("users");
    const [searchTerm, setSearchTerm] = useState("");

    const [users, setUsers] = useState<UserDetail[]>([]);
    const [roles, setRoles] = useState<RoleDetail[]>([]);
    const [departments, setDepartments] = useState<DepartmentDetail[]>([]);
    const [permissions, setPermissions] = useState<PermissionDetail[]>([]);

    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoadingData(true);
        setError(null);
        try {
            if (activeTab === "users" && hasPermission("view_user")) {
                const fetchedUsers = await securityService.getUsers();

                setUsers(
                    fetchedUsers.map((u) => ({
                        ...u,
                        status: u.is_active ? "active" : "inactive",
                        lastLogin: u.last_login ?? "N/A",
                        role: u.roles && u.roles.length > 0 ? u.roles.map((r) => r.name).join(", ") : "No Role",
                        department: u.department?.name ?? "No Department",
                    }))
                );
            } else if (activeTab === "roles" && hasPermission("view_role")) {
                const fetchedRoles = await securityService.getRoles();
                setRoles(
                    fetchedRoles.map((r) => ({
                        ...r,
                        userCount: r.user_count,
                        permissions: r.permissions.map((p) => p.codename),
                    }))
                );
            } else if (activeTab === "departments" && hasPermission("view_department")) {
                const fetchedDepartments = await securityService.getDepartments();
                setDepartments(fetchedDepartments);
            } else if (activeTab === "permissions" && hasPermission("view_permission")) {
                const fetchedPermissions = await securityService.getPermissions();
                setPermissions(fetchedPermissions);
            }
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError("Failed to load data. Please try again.");
        } finally {
            setLoadingData(false);
        }
    }, [activeTab, hasPermission]);

    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
    }, [activeTab, authLoading, fetchData]);

    // Derived counts for tabs
    const tabCounts = {
        users: users.length,
        roles: roles.length,
        departments: departments.length,
        permissions: permissions.length,
    };

    const tabs = [
        { id: "users", label: "Users", icon: Users, count: tabCounts.users, permission: "view_user" },
        { id: "roles", label: "Roles", icon: Shield, count: tabCounts.roles, permission: "view_role" },
        {
            id: "departments",
            label: "Departments",
            icon: Users,
            count: tabCounts.departments,
            permission: "view_department",
        },
        {
            id: "permissions",
            label: "Permissions",
            icon: Lock,
            count: tabCounts.permissions,
            permission: "view_permission",
        },
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
            case "read":
                return `${baseClasses} bg-green-100 text-green-800`;
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
                {hasPermission("add_user") && (
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                    </button>
                )}
            </div>
            {loadingData ? (
                <div>Loading users...</div>
            ) : error ? (
                <div className="text-red-600">{error}</div>
            ) : (
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
                                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.department}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={getStatusBadge(user.status)}>{user.status}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.lastLogin}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            {hasPermission("view_user") && (
                                                <button className="text-blue-600 hover:text-blue-900">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            )}
                                            {hasPermission("change_user") && (
                                                <button className="text-gray-600 hover:text-gray-900">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            )}
                                            {hasPermission("delete_user") && (
                                                <button className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderRoles = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Role Management</h3>
                {hasPermission("add_role") && (
                    <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Role
                    </button>
                )}
            </div>

            {loadingData ? (
                <div>Loading roles...</div>
            ) : error ? (
                <div className="text-red-600">{error}</div>
            ) : (
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
                                {(hasPermission("change_role") || hasPermission("delete_role")) && (
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-500 uppercase">Permissions</p>
                                <div className="flex flex-wrap gap-1">
                                    {role.permissions.slice(0, 3).map((permission, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                        >
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
            )}
        </div>
    );

    const renderDepartments = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Department Management</h3>
                {hasPermission("add_department") && (
                    <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Department
                    </button>
                )}
            </div>

            {loadingData ? (
                <div>Loading departments...</div>
            ) : error ? (
                <div className="text-red-600">{error}</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {departments.map((department) => (
                        <div key={department.id} className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900">{department.name}</h4>
                                    {/* <p className="text-sm text-gray-500">{department.members} members</p> */}
                                </div>
                                {(hasPermission("change_department") || hasPermission("delete_department")) && (
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{department.description}</p>
                            {/* Loại bỏ hiển thị Assigned Roles vì nó không có trong dữ liệu API của DepartmentDetail */}
                            {/* <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-500 uppercase">Assigned Roles</p>
                                <div className="flex flex-wrap gap-1">
                                    {department.roles.map((role, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div> */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderPermissions = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Permission Management</h3>
                {hasPermission("add_permission") && (
                    <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Permission
                    </button>
                )}
            </div>

            {loadingData ? (
                <div>Loading permissions...</div>
            ) : error ? (
                <div className="text-red-600">{error}</div>
            ) : (
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
                                        <span className={getPermissionTypeBadge(permission.type)}>
                                            {permission.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{permission.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            {hasPermission("change_permission") && (
                                                <button className="text-gray-600 hover:text-gray-900">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            )}
                                            {hasPermission("delete_permission") && (
                                                <button className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    if (authLoading) {
        return <div>Loading authentication...</div>;
    }

    if (!user) {
        return <div className="text-red-600">You must be logged in to view this page.</div>;
    }

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
                        // Only render tab if user has permission to view it
                        if (hasPermission(tab.permission)) {
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
                        }
                        return null;
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === "users" && hasPermission("view_user") && renderUsers()}
                {activeTab === "roles" && hasPermission("view_role") && renderRoles()}
                {activeTab === "departments" && hasPermission("view_department") && renderDepartments()}
                {activeTab === "permissions" && hasPermission("view_permission") && renderPermissions()}

                {!hasPermission("view_user") &&
                    !hasPermission("view_role") &&
                    !hasPermission("view_department") &&
                    !hasPermission("view_permission") && (
                        <div className="text-center text-red-600 mt-10">
                            You do not have permission to view any security management sections.
                        </div>
                    )}
            </div>
        </div>
    );
};

export default SecurityManagement;
