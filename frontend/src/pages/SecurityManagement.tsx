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
    Building2,
    Crown,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { securityService, UserDetail, RoleDetail, PermissionDetail, DepartmentDetail } from "../services/securityApi";
import UserModal from "@components/models/UserModal";
import ConfirmDialog from "@components/models/ConfirmDialog";
import RoleModal from "@components/models/RoleModal";
import DepartmentModal from "@components/models/DepartmentModal";
import PermissionModal from "@components/models/PermissionModal";

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

    // Check if user is Super Admin
    const isSuperAdmin =
        user?.is_superuser ||
        user?.roles?.some(
            (role) => role.name.toLowerCase().includes("super") || role.name.toLowerCase().includes("admin")
        );

    // Enhanced permission check that allows Super Admin full access
    const checkPermission = (permission: string) => {
        return isSuperAdmin || hasPermission(permission);
    };

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

    const [departmentModal, setDepartmentModal] = useState<{
        isOpen: boolean;
        mode: "view" | "edit" | "create";
        department?: DepartmentDetail | null;
    }>({
        isOpen: false,
        mode: "view",
        department: null,
    });

    const [permissionModal, setPermissionModal] = useState<{
        isOpen: boolean;
        mode: "view" | "edit" | "create";
        permission?: PermissionDetail | null;
    }>({
        isOpen: false,
        mode: "view",
        permission: null,
    });

    const fetchAllData = useCallback(async () => {
        setLoadingData(true);
        setError(null);
        try {
            const promises = [];

            if (checkPermission("view_user")) {
                promises.push(securityService.getUsers().then(setUsers));
            }
            if (checkPermission("view_role")) {
                promises.push(securityService.getRoles().then(setRoles));
            }
            if (checkPermission("view_department")) {
                const canViewAllDepartments = checkPermission("view_all_departments");
                promises.push(securityService.getDepartments(canViewAllDepartments).then(setDepartments));
            }
            if (checkPermission("view_permission")) {
                promises.push(securityService.getPermissions().then(setPermissions));
            }

            await Promise.all(promises);
        } catch (err) {
            console.error("Failed to fetch all data:", err);
            setError("Failed to load data. Please try again.");
        } finally {
            setLoadingData(false);
        }
    }, [isSuperAdmin, hasPermission]);

    useEffect(() => {
        if (!authLoading) {
            fetchAllData();
        }
    }, [authLoading, fetchAllData]);

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
            icon: Building2,
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

    const confirmDeleteRole = async (roleId: string) => {
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

    // Department action handlers
    const handleViewDepartment = (department: DepartmentDetail) => {
        setDepartmentModal({
            isOpen: true,
            mode: "view",
            department,
        });
    };

    const handleEditDepartment = (department: DepartmentDetail) => {
        setDepartmentModal({
            isOpen: true,
            mode: "edit",
            department,
        });
    };

    const handleCreateDepartment = () => {
        setDepartmentModal({
            isOpen: true,
            mode: "create",
            department: null,
        });
    };

    const handleDeleteDepartment = (department: DepartmentDetail) => {
        setConfirmDialog({
            isOpen: true,
            title: "Delete Department",
            message: `Are you sure you want to delete department "${department.name}"? This action cannot be undone.`,
            onConfirm: () => confirmDeleteDepartment(department.id),
            loading: false,
        });
    };

    const confirmDeleteDepartment = async (departmentId: string) => {
        setConfirmDialog((prev) => ({ ...prev, loading: true }));
        try {
            await securityService.deleteDepartment(departmentId);
            setDepartments(departments.filter((d) => d.id !== departmentId));
            setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
        } catch (error) {
            console.error("Error deleting department:", error);
            setConfirmDialog((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleSaveDepartment = async (departmentData: any) => {
        try {
            if (departmentModal.mode === "create") {
                const newDepartment = await securityService.createDepartment(departmentData);
                setDepartments([...departments, newDepartment]);
            } else if (departmentModal.mode === "edit" && departmentModal.department) {
                const updatedDepartment = await securityService.updateDepartment(
                    departmentModal.department.id,
                    departmentData
                );
                setDepartments(departments.map((d) => (d.id === updatedDepartment.id ? updatedDepartment : d)));
            }
            setDepartmentModal({ isOpen: false, mode: "view", department: null });
        } catch (error) {
            console.error("Error saving department:", error);
            throw error;
        }
    };

    // Permission action handlers
    const handleViewPermission = (permission: PermissionDetail) => {
        setPermissionModal({
            isOpen: true,
            mode: "view",
            permission,
        });
    };

    const handleEditPermission = (permission: PermissionDetail) => {
        setPermissionModal({
            isOpen: true,
            mode: "edit",
            permission,
        });
    };

    const handleCreatePermission = () => {
        setPermissionModal({
            isOpen: true,
            mode: "create",
            permission: null,
        });
    };

    const handleDeletePermission = (permission: PermissionDetail) => {
        setConfirmDialog({
            isOpen: true,
            title: "Delete Permission",
            message: `Are you sure you want to delete permission "${permission.name}"? This action cannot be undone and may affect user access.`,
            onConfirm: () => confirmDeletePermission(permission.id),
            loading: false,
        });
    };

    const confirmDeletePermission = async (permissionId: string) => {
        setConfirmDialog((prev) => ({ ...prev, loading: true }));
        try {
            await securityService.deletePermission(permissionId);
            setPermissions(permissions.filter((p) => p.id !== permissionId));
            setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
        } catch (error) {
            console.error("Error deleting permission:", error);
            setConfirmDialog((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleSavePermission = async (permissionData: any) => {
        try {
            if (permissionModal.mode === "create") {
                const newPermission = await securityService.createPermission(permissionData);
                setPermissions([...permissions, newPermission]);
            } else if (permissionModal.mode === "edit" && permissionModal.permission) {
                const updatedPermission = await securityService.updatePermission(
                    permissionModal.permission.id,
                    permissionData
                );
                setPermissions(permissions.map((p) => (p.id === updatedPermission.id ? updatedPermission : p)));
            }
            setPermissionModal({ isOpen: false, mode: "view", permission: null });
        } catch (error) {
            console.error("Error saving permission:", error);
            throw error;
        }
    };

    const formatDateTime = (dateString: string | null | undefined) => {
        if (!dateString) return "Never";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            timeZone: "Asia/Ho_Chi_Minh",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getUserStatus = (user: UserDetail) => {
        if (user.is_online) {
            return "Online";
        }
        if (user.is_active) {
            return "Active";
        }
        return "Inactive";
    };

    const getUserStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
        switch (status) {
            case "Online":
                return `${baseClasses} bg-green-100 text-green-800`;
            case "Active":
                return `${baseClasses} bg-blue-100 text-blue-800`;
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
                {checkPermission("add_user") && (
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
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading users...</span>
                </div>
            ) : error ? (
                <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">{error}</div>
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
                            {console.log(users)}
                            {users
                                .filter(
                                    (user) =>
                                        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-white">
                                                            {user.full_name?.charAt(0) ||
                                                                user.username?.charAt(0) ||
                                                                "U"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 flex items-center">
                                                        {user.full_name || user.username}
                                                        {user.is_superuser && (
                                                            <Crown
                                                                className="h-4 w-4 ml-2 text-yellow-500"
                                                                title="Super Admin"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.roles && user.roles.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.slice(0, 2).map((role, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                        >
                                                            {role.name}
                                                        </span>
                                                    ))}
                                                    {user.roles.length > 2 && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                            +{user.roles.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : user.is_superuser ? (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                                    Super Admin
                                                </span>
                                            ) : (
                                                "No roles"
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.department?.name || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={getUserStatusBadge(getUserStatus(user))}>
                                                {getUserStatus(user)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDateTime(user.last_login)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                {checkPermission("view_user") && (
                                                    <button
                                                        onClick={() => handleViewUser(user)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                        title="View user"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {checkPermission("change_user") && (
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                                                        title="Edit user"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {checkPermission("delete_user") && !user.is_superuser && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                        title="Delete user"
                                                    >
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
                </div>
                {checkPermission("add_role") && (
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
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-gray-600">Loading roles...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles
                        .filter(
                            (role) =>
                                role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                role.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
                                        {role.permissions?.slice(0, 3).map((permission, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                            >
                                                {permission.name?.replace("_", " ")}
                                            </span>
                                        ))}
                                        {role.permissions && role.permissions.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                +{role.permissions.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                                    {checkPermission("view_role") && (
                                        <button
                                            onClick={() => handleViewRole(role)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View role"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    )}
                                    {checkPermission("change_role") && (
                                        <button
                                            onClick={() => handleEditRole(role)}
                                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                            title="Edit role"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                    )}
                                    {checkPermission("delete_role") && (
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
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search departments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                </div>
                {checkPermission("add_department") && (
                    <button
                        onClick={handleCreateDepartment}
                        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Department
                    </button>
                )}
            </div>

            {loadingData ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-600">Loading departments...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments
                        .filter(
                            (department) =>
                                department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                department.description?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((department) => (
                            <div
                                key={department.id}
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                            <Building2 className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-medium text-gray-900">{department.name}</h4>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <Users className="h-4 w-4 mr-1" />
                                                {department.members || 0} members
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{department.description}</p>

                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Assigned Roles
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {department.roles && department.roles.length > 0 ? (
                                            <>
                                                {department.roles.slice(0, 2).map((role, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                                                    >
                                                        {role.name}
                                                    </span>
                                                ))}
                                                {department.roles.length > 2 && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                        +{department.roles.length - 2} more
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                No roles assigned
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                                    {checkPermission("view_department") && (
                                        <button
                                            onClick={() => handleViewDepartment(department)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View department"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    )}
                                    {checkPermission("change_department") && (
                                        <button
                                            onClick={() => handleEditDepartment(department)}
                                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                            title="Edit department"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                    )}
                                    {checkPermission("delete_department") && (
                                        <button
                                            onClick={() => handleDeleteDepartment(department)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete department"
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

    const renderPermissions = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search permissions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                </div>
                {checkPermission("add_permission") && (
                    <button
                        onClick={handleCreatePermission}
                        className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Permission
                    </button>
                )}
            </div>

            {loadingData ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                    <span className="ml-2 text-gray-600">Loading permissions...</span>
                </div>
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
                            {permissions
                                .filter(
                                    (permission) =>
                                        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        permission.module.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((permission) => (
                                    <tr key={permission.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Lock className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {permission.name}
                                                </span>
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
                                                {checkPermission("view_permission") && (
                                                    <button
                                                        onClick={() => handleViewPermission(permission)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                        title="View permission"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {checkPermission("change_permission") && (
                                                    <button
                                                        onClick={() => handleEditPermission(permission)}
                                                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                                                        title="Edit permission"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {checkPermission("delete_permission") && (
                                                    <button
                                                        onClick={() => handleDeletePermission(permission)}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                        title="Delete permission"
                                                    >
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
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-lg text-gray-600">Loading authentication...</span>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-600 text-xl mb-2">Access Denied</div>
                    <div className="text-gray-600">You must be logged in to view this page.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Super Admin indicator */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            Security Management
                            {isSuperAdmin && (
                                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                    <Crown className="h-4 w-4 mr-1" />
                                    Super Admin Access
                                </span>
                            )}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            Manage users, roles, departments, and permissions to ensure proper access control and
                            security across the document management system.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        // Show tab if user has permission OR is Super Admin
                        if (checkPermission(tab.permission)) {
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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
                {activeTab === "users" && checkPermission("view_user") && renderUsers()}
                {activeTab === "roles" && checkPermission("view_role") && renderRoles()}
                {activeTab === "departments" && checkPermission("view_department") && renderDepartments()}
                {activeTab === "permissions" && checkPermission("view_permission") && renderPermissions()}

                {!checkPermission("view_user") &&
                    !checkPermission("view_role") &&
                    !checkPermission("view_department") &&
                    !checkPermission("view_permission") && (
                        <div className="text-center py-12">
                            <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
                            <p className="text-gray-600">
                                You do not have permission to view any security management sections.
                            </p>
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

            <DepartmentModal
                isOpen={departmentModal.isOpen}
                onClose={() => setDepartmentModal({ isOpen: false, mode: "view", department: null })}
                department={departmentModal.department}
                mode={departmentModal.mode}
                roles={roles}
                onSave={handleSaveDepartment}
            />

            <PermissionModal
                isOpen={permissionModal.isOpen}
                onClose={() => setPermissionModal({ isOpen: false, mode: "view", permission: null })}
                permission={permissionModal.permission}
                mode={permissionModal.mode}
                onSave={handleSavePermission}
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
