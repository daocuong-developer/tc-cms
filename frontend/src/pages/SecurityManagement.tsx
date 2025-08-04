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
import UserModal from "@components/models/UserModal";
import ConfirmDialog from "@components/models/ConfirmDialog";
import RoleModal from "@components/models/RoleModal";

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

    // Modal states
    const [userModal, setUserModal] = useState<{
        isOpen: boolean;
        mode: "view" | "edit" | "create";
        user?: UserDetail | null;
    }>({
        isOpen: false,
        mode: "view",
        user: null,
    });

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        loading: boolean;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
        loading: false,
    });

    const [roleModal, setRoleModal] = useState<{
        isOpen: boolean;
        mode: "view" | "edit" | "create";
        role?: RoleDetail | null;
    }>({
        isOpen: false,
        mode: "view",
        role: null,
    });

    const fetchData = useCallback(async () => {
        setLoadingData(true);
        setError(null);
        try {
            if (activeTab === "users" && hasPermission("view_user")) {
                const fetchedUsers = await securityService.getUsers();
                setUsers(fetchedUsers);
            } else if (activeTab === "roles" && hasPermission("view_role")) {
                const fetchedRoles = await securityService.getRoles();
                setRoles(fetchedRoles);
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

    // User action handlers
    const handleViewUser = (user: UserDetail) => {
        setUserModal({
            isOpen: true,
            mode: "view",
            user,
        });
    };

    const handleEditUser = (user: UserDetail) => {
        setUserModal({
            isOpen: true,
            mode: "edit",
            user,
        });
    };

    const handleCreateUser = () => {
        setUserModal({
            isOpen: true,
            mode: "create",
            user: null,
        });
    };

    const handleDeleteUser = (user: UserDetail) => {
        setConfirmDialog({
            isOpen: true,
            title: "Delete User",
            message: `Are you sure you want to delete user "${
                user.full_name || user.username
            }"? This action cannot be undone.`,
            onConfirm: () => confirmDeleteUser(user.id),
            loading: false,
        });
    };

    const confirmDeleteUser = async (userId: string) => {
        setConfirmDialog((prev) => ({ ...prev, loading: true }));
        try {
            await securityService.deleteUser(userId);
            setUsers(users.filter((u) => u.id !== userId));
            setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
        } catch (error) {
            console.error("Error deleting user:", error);
            setConfirmDialog((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleSaveUser = async (userData: any) => {
        try {
            if (userModal.mode === "create") {
                const newUser = await securityService.createUser(userData);
                setUsers([...users, newUser]);
            } else if (userModal.mode === "edit" && userModal.user) {
                const updatedUser = await securityService.updateUser(userModal.user.id, userData);
                setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
            }
            setUserModal({ isOpen: false, mode: "view", user: null });
        } catch (error) {
            console.error("Error saving user:", error);
            throw error;
        }
    };

    // Role action handlers
    const handleViewRole = (role: RoleDetail) => {
        setRoleModal({
            isOpen: true,
            mode: "view",
            role,
        });
    };

    const handleEditRole = (role: RoleDetail) => {
        setRoleModal({
            isOpen: true,
            mode: "edit",
            role,
        });
    };

    const handleCreateRole = () => {
        setRoleModal({
            isOpen: true,
            mode: "create",
            role: null,
        });
    };

    const handleDeleteRole = (role: RoleDetail) => {
        setConfirmDialog({
            isOpen: true,
            title: "Delete Role",
            message: `Are you sure you want to delete role "${role.name}"? This action cannot be undone and will affect ${role.user_count} users.`,
            onConfirm: () => confirmDeleteRole(role.id),
            loading: false,
        });
    };

    const confirmDeleteRole = async (roleId: number) => {
        setConfirmDialog((prev) => ({ ...prev, loading: true }));
        try {
            await securityService.deleteRole(roleId);
            setRoles(roles.filter((r) => r.id !== roleId));
            setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
        } catch (error) {
            console.error("Error deleting role:", error);
            setConfirmDialog((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleSaveRole = async (roleData: any) => {
        try {
            if (roleModal.mode === "create") {
                const newRole = await securityService.createRole(roleData);
                setRoles([...roles, newRole]);
            } else if (roleModal.mode === "edit" && roleModal.role) {
                const updatedRole = await securityService.updateRole(roleModal.role.id, roleData);
                setRoles(roles.map((r) => (r.id === updatedRole.id ? updatedRole : r)));
            }
            setRoleModal({ isOpen: false, mode: "view", role: null });
        } catch (error) {
            console.error("Error saving role:", error);
            throw error;
        }
    };

    const formatDateTime = (dateString: string | null | undefined) => {
        if (!dateString) return "Chưa từng";

        const isoString = dateString.replace(" ", "T") + "Z";

        const date = new Date(isoString);
        return date
            .toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                hour12: false,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            })
            .replace(",", "");
    };

    const getUserStatus = (user: UserDetail) => {
        if (user.is_online) {
            return "Active";
        }

        if (user.is_active) {
            return "Inactive";
        }

        return "Inactive";
    };

    const getUserStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
        switch (status) {
            case "Active":
                return `${baseClasses} bg-green-100 text-green-800`;
            case "Superuser":
                return `${baseClasses} bg-purple-100 text-purple-800`;
            case "Staff":
                return `${baseClasses} bg-blue-100 text-blue-800`;
            // case "Active":
            //     return `${baseClasses} bg-gray-100 text-gray-800`;
            case "Inactive":
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
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
                    <button
                        onClick={handleCreateUser}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
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
                            {users.map((user) => {
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.full_name}
                                                </div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.roles && user.roles.length > 0 ? user.roles[0].name : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.department ? user.department.name : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={getUserStatusBadge(getUserStatus(user))}>
                                                {getUserStatus(user)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDateTime(user.last_logout)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                {hasPermission("view_user") && (
                                                    <button
                                                        onClick={() => handleViewUser(user)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View user"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {hasPermission("change_user") && (
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        className="text-gray-600 hover:text-gray-900"
                                                        title="Edit user"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {hasPermission("delete_user") && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderRoles = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search roles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </button>
                </div>
                {hasPermission("add_role") && (
                    <button
                        onClick={handleCreateRole}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
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
                    {roles
                        .filter(
                            (role) =>
                                role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                role.description.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((role) => (
                            <div
                                key={role.id}
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-green-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                                            <Shield className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-medium text-gray-900">{role.name}</h4>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <Users className="h-4 w-4 mr-1" />
                                                {role.user_count} users
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{role.description}</p>
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Permissions
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {role.permissions.slice(0, 3).map((permission, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                            >
                                                {permission.codename.replace("_", " ")}
                                            </span>
                                        ))}
                                        {role.permissions.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                +{role.permissions.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                                    {hasPermission("view_role") && (
                                        <button
                                            onClick={() => handleViewRole(role)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View role"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    )}
                                    {hasPermission("change_role") && (
                                        <button
                                            onClick={() => handleEditRole(role)}
                                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                            title="Edit role"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                    )}
                                    {hasPermission("delete_role") && (
                                        <button
                                            onClick={() => handleDeleteRole(role)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete role"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
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

            {/* Modals */}
            <UserModal
                isOpen={userModal.isOpen}
                onClose={() => setUserModal({ isOpen: false, mode: "view", user: null })}
                user={userModal.user}
                mode={userModal.mode}
                roles={roles}
                departments={departments}
                onSave={handleSaveUser}
            />

            <RoleModal
                isOpen={roleModal.isOpen}
                onClose={() => setRoleModal({ isOpen: false, mode: "view", role: null })}
                role={roleModal.role}
                mode={roleModal.mode}
                permissions={permissions}
                onSave={handleSaveRole}
            />

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                loading={confirmDialog.loading}
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
};

export default SecurityManagement;
