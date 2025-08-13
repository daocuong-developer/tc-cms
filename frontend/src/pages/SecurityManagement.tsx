// File: SecurityManagement.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import ContentHeader from "@/components/ui/ContentHeader";
// import {
//     Users,
//     Shield,
//     UserPlus,
//     Edit,
//     Trash2,
//     Search,
//     Filter,
//     Plus,
//     Eye,
//     Lock,
//     Unlock,
//     MoreVertical,
//     Building,
//     Building2,
//     Crown,
// } from "lucide-react";
import { Users, Shield, UserPlus, Edit, Trash2, Plus, Eye, Lock, Crown, Building } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { securityService } from "@/services/securityApi";
import UserModal from "@/components/models/UserModal";
import ConfirmDialog from "@/components/models/ConfirmDialog";
import RoleModal from "@/components/models/RoleModal";
import PermissionModal from "@/components/models/PermissionModal";
import GroupModal from "@/components/models/GroupModal";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { useSecurityActions } from "@/hooks/useSecurityActions";
import { useSecurityData } from "@/hooks/useSecurityData";
import {
    formatDateTime,
    getUserStatus,
    getUserStatusBadge,
    getPermissionTypeBadge,
    isDefaultDjangoPermission,
    checkSuperAdmin,
    createPermission,
    permissionTypeOptions,
} from "@/utils/securityHelpers";
import { ButtonGroup } from "@mantine/core";

const SecurityManagement: React.FC = () => {
    const { user, hasPermission, isLoading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<"users" | "roles" | "permissions" | "groups">("users");

    // Check if user is Super Admin
    const isSuperAdmin = checkSuperAdmin(user);
    const checkPerm = useCallback(
        (permission: string) => createPermission(permission, isSuperAdmin, hasPermission),
        [isSuperAdmin, hasPermission]
    );

    const currentOrganizationId = user?.organization?.id;
    const isOrganizationUser = !isSuperAdmin && currentOrganizationId;

    // Custom hooks
    const {
        userModal,
        roleModal,
        groupModal,
        permissionModal,
        confirmDialog,
        userActions,
        roleActions,
        groupActions,
        permissionActions,
        createDeleteHandler,
        createSaveHandler,
        setConfirmDialog,
    } = useSecurityActions();

    const {
        users,
        roles,
        groups,
        permissions,
        setUsers,
        setRoles,
        setGroups,
        setPermissions,
        loadingData,
        error,
        searchTerm,
        setSearchTerm,
        permissionTypeFilter,
        setPermissionTypeFilter,
        currentPage,
        setCurrentPage,
        tabCounts,
        filteredAndPaginatedUsers,
        filteredAndPaginatedPermissions,
        filteredRoles,
        filteredGroups,
        fetchAllData,
        resetFilters,
    } = useSecurityData(checkPerm, currentOrganizationId, isSuperAdmin);

    useEffect(() => {
        if (!authLoading) {
            fetchAllData();
        }
    }, [authLoading, fetchAllData]);

    useEffect(() => {
        resetFilters();
    }, [activeTab, resetFilters]);

    // Create specific action handlers using the factory functions
    const handleDeleteUser = createDeleteHandler("User", securityService.deleteUser, setUsers);
    const handleDeleteRole = createDeleteHandler("Role", securityService.deleteRole, setRoles);
    const handleDeleteGroup = createDeleteHandler("Group", securityService.deleteGroup, setGroups);
    const handleDeletePermission = createDeleteHandler("Permission", securityService.deletePermission, setPermissions);

    // Create save handlers
    const handleSaveUser = createSaveHandler(
        userModal,
        (state) => userActions.close(),
        securityService.createUser,
        securityService.updateUser,
        setUsers
    );

    const handleSaveRole = createSaveHandler(
        roleModal,
        (state) => roleActions.close(),
        securityService.createRole,
        securityService.updateRole,
        setRoles
    );

    const handleSaveGroup = createSaveHandler(
        groupModal,
        (state) => groupActions.close(),
        securityService.createGroup,
        securityService.updateGroup,
        setGroups
    );

    const handleSavePermission = createSaveHandler(
        permissionModal,
        (state) => permissionActions.close(),
        securityService.createPermission,
        securityService.updatePermission,
        setPermissions
    );

    // Thêm logic phân biệt trạng thái
    const getOrganizationStatus = () => {
        if (isSuperAdmin) return { type: "super", message: "Super Admin Access" };
        if (!currentOrganizationId) return { type: "no-org", message: "No Organization Assigned" };
        return { type: "org", message: user?.organization?.name || "Unknown Organization" };
    };

    const orgStatus = getOrganizationStatus();

    const tabs = [
        { id: "users", label: "Users", icon: Users, count: tabCounts.users, permission: "view_user" },
        { id: "roles", label: "Roles", icon: Shield, count: tabCounts.roles, permission: "view_role" },
        { id: "groups", label: "Groups", icon: Users, count: tabCounts.groups, permission: "view_group" },
        {
            id: "permissions",
            label: "Permissions",
            icon: Lock,
            count: tabCounts.permissions,
            permission: "view_permission",
        },
    ];

    const renderUsers = () => (
        <div className="space-y-4">
            {isOrganizationUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center">
                        <Building className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm text-blue-800">
                            Showing users from organization: <strong>{user?.organization?.name}</strong>
                        </span>
                    </div>
                </div>
            )}

            {!isSuperAdmin && (
                <div
                    className={`border rounded-lg p-3 ${
                        orgStatus.type === "no-org" ? "bg-yellow-50 border-yellow-200" : "bg-blue-50 border-blue-200"
                    }`}
                >
                    <div className="flex items-center">
                        <Building
                            className={`h-4 w-4 mr-2 ${
                                orgStatus.type === "no-org" ? "text-yellow-600" : "text-blue-600"
                            }`}
                        />
                        <span
                            className={`text-sm ${orgStatus.type === "no-org" ? "text-yellow-800" : "text-blue-800"}`}
                        >
                            {orgStatus.type === "no-org"
                                ? "Showing users without organization assignment"
                                : `Showing users from organization:`}
                            {orgStatus.type === "org" && <strong>{orgStatus.message}</strong>}
                        </span>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <SearchInput
                        value={searchTerm}
                        onChange={(value) => {
                            setSearchTerm(value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search users..."
                    />
                </div>
                {checkPerm("add_user") && (
                    <button
                        onClick={userActions.create}
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
            ) : filteredAndPaginatedUsers.data.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-2">No users found</div>
                    <div className="text-gray-400 text-sm">Try adjusting your search criteria.</div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>
                            Showing {filteredAndPaginatedUsers.data.length} out of a total of{" "}
                            {filteredAndPaginatedUsers.totalItems} users
                        </span>
                        <span>
                            Page {currentPage} / {filteredAndPaginatedUsers.totalPages}
                        </span>
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
                                {filteredAndPaginatedUsers.data.map((user) => (
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
                                                            <Crown className="h-4 w-4 ml-2 text-yellow-500" />
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
                                                {checkPerm("view_user") && (
                                                    <button
                                                        onClick={() => userActions.view(user)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                        title="View user"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {checkPerm("change_user") && (
                                                    <button
                                                        onClick={() => userActions.edit(user)}
                                                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                                                        title="Edit user"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {checkPerm("delete_user") && !user.is_superuser && (
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
                    {filteredAndPaginatedUsers.totalPages > 1 && (
                        <div className="mt-4 flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={filteredAndPaginatedUsers.totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );

    const renderRoles = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <SearchInput
                            value={searchTerm}
                            onChange={(value) => {
                                setSearchTerm(value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search roles..."
                        />
                    </div>
                </div>
                {checkPerm("add_role") && (
                    <ButtonGroup
                        onClick={roleActions.create}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Role
                    </ButtonGroup>
                )}
            </div>

            {loadingData ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-gray-600">Loading roles...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRoles.map((role) => (
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
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Permissions</p>
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
                                {checkPerm("view_role") && (
                                    <button
                                        onClick={() => roleActions.view(role)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="View role"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                )}
                                {checkPerm("change_role") && (
                                    <button
                                        onClick={() => roleActions.edit(role)}
                                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                        title="Edit role"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                )}
                                {checkPerm("delete_role") && (
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

    const renderGroups = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <SearchInput
                            value={searchTerm}
                            onChange={(value) => {
                                setSearchTerm(value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search groups..."
                        />
                    </div>
                </div>
                {checkPerm("add_group") && (
                    <button
                        onClick={groupActions.create}
                        className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Group
                    </button>
                )}
            </div>

            {loadingData ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                    <span className="ml-2 text-gray-600">Loading departments...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.map((group) => (
                        <div
                            key={group.id}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-cyan-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="p-2 bg-cyan-100 rounded-lg mr-3">
                                        <Building className="h-6 w-6 text-cyan-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900">{group.name}</h4>
                                        <p className="text-sm text-gray-500 flex items-center">
                                            <Users className="h-4 w-4 mr-1" />
                                            {group.members + 1 || 0} members
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>

                            <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    Assigned Roles
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {group.roles && group.roles.length > 0 ? (
                                        <>
                                            {group.roles.slice(0, 2).map((role, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded-full"
                                                >
                                                    {role.name}
                                                </span>
                                            ))}
                                            {group.roles.length > 2 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                    +{group.roles.length - 2} more
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
                                {checkPerm("view_group") && (
                                    <button
                                        onClick={() => groupActions.view(group)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="View group"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                )}
                                {checkPerm("change_group") && (
                                    <button
                                        onClick={() => groupActions.edit(group)}
                                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                        title="Edit group"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                )}
                                {checkPerm("delete_group") && (
                                    <button
                                        onClick={() => handleDeleteGroup(group)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete group"
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
            {/* Permission Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SearchInput
                        value={searchTerm}
                        onChange={(value) => {
                            setSearchTerm(value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search by name, description, module..."
                    />
                    <FilterDropdown
                        options={permissionTypeOptions}
                        value={permissionTypeFilter}
                        onChange={(value) => {
                            setPermissionTypeFilter(value);
                            setCurrentPage(1);
                        }}
                        placeholder="Select permission type"
                    />
                </div>
            </div>
            {loadingData ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                    <span className="ml-2 text-gray-600">Loading permissions...</span>
                </div>
            ) : filteredAndPaginatedPermissions.data.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-2">No permissions found</div>
                    <div className="text-gray-400 text-sm">Try adjusting your search criteria.</div>
                </div>
            ) : (
                <>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        CodeName
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Permission Name
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
                                {filteredAndPaginatedPermissions.data.map((permission) => (
                                    <tr
                                        key={permission.id}
                                        className={`hover:bg-gray-50 ${
                                            isDefaultDjangoPermission(permission.codename) ? "bg-blue-50" : ""
                                        }`}
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-500">{permission.codename}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Lock className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {permission.name}
                                                    {isDefaultDjangoPermission(permission.codename) && (
                                                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-200 text-yellow-800">
                                                            Default
                                                        </span>
                                                    )}
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
                                                {checkPerm("view_permission") && (
                                                    <button
                                                        onClick={() => permissionActions.view(permission)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                        title="View permission"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {checkPerm("change_permission") && (
                                                    <button
                                                        onClick={() => permissionActions.edit(permission)}
                                                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                                                        title="Edit permission"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {checkPerm("delete_permission") &&
                                                    !["add_", "change_", "delete_", "view_"].some((prefix) =>
                                                        permission.codename.startsWith(prefix)
                                                    ) && (
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
                    {filteredAndPaginatedPermissions.totalPages > 1 && (
                        <div className="mt-4 flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={filteredAndPaginatedPermissions.totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </>
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
            {/* <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
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
            </div> */}
            <ContentHeader
                title="Security Management"
                isSuperAdmin={true}
                description="Manage users, roles, departments, and permissions to ensure proper access control and security across the document management system."
                storageKey="securityManagementHeaderClosed"
                userId={user?.id} // Assuming no specific user ID is needed for this context
            />

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        if (checkPerm(tab.permission)) {
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
                {activeTab === "users" && checkPerm("view_user") && renderUsers()}
                {activeTab === "roles" && checkPerm("view_role") && renderRoles()}
                {activeTab === "permissions" && checkPerm("view_permission") && renderPermissions()}
                {activeTab === "groups" && checkPerm("view_group") && renderGroups()}

                {!checkPerm("view_user") &&
                    !checkPerm("view_role") &&
                    !checkPerm("view_group") &&
                    !checkPerm("view_permission") && (
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
                onClose={userActions.close}
                user={userModal.item}
                mode={userModal.mode}
                roles={roles}
                onSave={handleSaveUser}
            />

            <RoleModal
                isOpen={roleModal.isOpen}
                onClose={roleActions.close}
                role={roleModal.item}
                mode={roleModal.mode}
                permissions={permissions}
                onSave={handleSaveRole}
            />

            <GroupModal
                isOpen={groupModal.isOpen}
                onClose={groupActions.close}
                group={groupModal.item}
                mode={groupModal.mode}
                roles={roles}
                onSave={handleSaveGroup}
            />

            <PermissionModal
                isOpen={permissionModal.isOpen}
                onClose={permissionActions.close}
                permission={permissionModal.item}
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
