import { useState, useCallback, useMemo } from "react";
import { securityService, UserDetail, RoleDetail, GroupDetail, PermissionDetail } from "@/services/securityApi";
import { isDefaultDjangoPermission, itemsPerPageConfig, filterByOrganization } from "@/utils/securityHelpers";

export const useSecurityData = (
    checkPermission: (permission: string) => boolean,
    currentOrganizationId?: string | null,
    isSuperAdmin: boolean = false,
    currentUser?: any
) => {
    const [users, setUsers] = useState<UserDetail[]>([]);
    const [roles, setRoles] = useState<RoleDetail[]>([]);
    const [groups, setGroups] = useState<GroupDetail[]>([]);
    const [permissions, setPermissions] = useState<PermissionDetail[]>([]);

    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter and Pagination States
    const [searchTerm, setSearchTerm] = useState("");
    const [permissionTypeFilter, setPermissionTypeFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const fetchAllData = useCallback(async () => {
        setLoadingData(true);
        setError(null);
        try {
            const promises = [];

            if (checkPermission("view_user")) {
                promises.push(
                    securityService.getUsers().then((data) => {
                        const filteredUsers = filterByOrganization.users(
                            data,
                            currentOrganizationId ?? null,
                            isSuperAdmin,
                            currentUser
                        );
                        setUsers(filteredUsers);
                    })
                );
            }
            if (checkPermission("view_role")) {
                promises.push(
                    securityService.getRoles().then((data) => {
                        const filteredRoles = filterByOrganization.roles(
                            data,
                            currentOrganizationId ?? null,
                            isSuperAdmin,
                            currentUser
                        );
                        setRoles(filteredRoles);
                    })
                );
            }
            if (checkPermission("view_group")) {
                promises.push(
                    securityService.getGroups().then((data) => {
                        const filteredGroups = filterByOrganization.groups(
                            data,
                            currentOrganizationId ?? null,
                            isSuperAdmin,
                            currentUser
                        );
                        setGroups(filteredGroups);
                    })
                );
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
    }, [checkPermission, currentOrganizationId, isSuperAdmin]);

    // Derived counts for tabs
    const tabCounts = useMemo(
        () => ({
            users: users.length,
            roles: roles.length,
            groups: groups.length,
            permissions: permissions.length,
        }),
        [users.length, roles.length, groups.length, permissions.length]
    );

    const filteredAndPaginatedUsers = useMemo(() => {
        let filtered = users.filter(
            (user) =>
                user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPageConfig.users);
        const startIndex = (currentPage - 1) * itemsPerPageConfig.users;
        const endIndex = startIndex + itemsPerPageConfig.users;
        const data = filtered.slice(startIndex, endIndex);

        return {
            data,
            totalItems,
            totalPages,
        };
    }, [users, searchTerm, currentPage]);

    const filteredAndPaginatedPermissions = useMemo(() => {
        let filtered = permissions.filter((p) => {
            const matchesSearch =
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.codename.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType =
                permissionTypeFilter === "all" ||
                (permissionTypeFilter === "default-django" && isDefaultDjangoPermission(p.codename)) ||
                (permissionTypeFilter === "no-default-django" && !isDefaultDjangoPermission(p.codename)) ||
                (permissionTypeFilter !== "default-django" && p.type.toLowerCase() === permissionTypeFilter);
            return matchesSearch && matchesType;
        });

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPageConfig.permissions);
        const startIndex = (currentPage - 1) * itemsPerPageConfig.permissions;
        const endIndex = startIndex + itemsPerPageConfig.permissions;
        const data = filtered.slice(startIndex, endIndex);

        return {
            data,
            totalItems,
            totalPages,
        };
    }, [permissions, searchTerm, permissionTypeFilter, currentPage]);

    const filteredRoles = useMemo(
        () =>
            roles.filter(
                (role) =>
                    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [roles, searchTerm]
    );

    const filteredGroups = useMemo(
        () =>
            groups.filter(
                (group) =>
                    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [groups, searchTerm]
    );

    const resetFilters = useCallback(() => {
        setCurrentPage(1);
        setSearchTerm("");
        setPermissionTypeFilter("all");
    }, []);

    return {
        // Data
        users,
        roles,
        groups,
        permissions,
        setUsers,
        setRoles,
        setGroups,
        setPermissions,

        // Loading & Error states
        loadingData,
        error,

        // Filter states
        searchTerm,
        setSearchTerm,
        permissionTypeFilter,
        setPermissionTypeFilter,
        currentPage,
        setCurrentPage,

        // Computed data
        tabCounts,
        filteredAndPaginatedUsers,
        filteredAndPaginatedPermissions,
        filteredRoles,
        filteredGroups,

        // Functions
        fetchAllData,
        resetFilters,
    };
};
