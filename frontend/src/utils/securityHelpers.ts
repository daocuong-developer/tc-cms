import { UserDetail, PermissionDetail, RoleDetail, GroupDetail } from "@/services/securityApi";

export const formatDateTime = (dateString: string | null | undefined): string => {
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

export const getUserStatus = (user: UserDetail): string => {
    if (user.is_online) {
        return "Online";
    }
    if (user.is_active) {
        return "Active";
    }
    return "Inactive";
};

export const getUserStatusBadge = (status: string): string => {
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

export const getPermissionTypeBadge = (type: string): string => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (type) {
        case "create":
            return `${baseClasses} bg-purple-100 text-purple-800`;
        case "view":
            return `${baseClasses} bg-green-100 text-green-800`;
        case "update":
            return `${baseClasses} bg-indigo-100 text-indigo-800`;
        case "delete":
            return `${baseClasses} bg-orange-100 text-orange-800`;
        case "admin":
            return `${baseClasses} bg-red-100 text-red-800`;
        case "write":
            return `${baseClasses} bg-blue-100 text-blue-800`;
        case "read":
            return `${baseClasses} bg-teal-100 text-teal-800`;
        default:
            return `${baseClasses} bg-gray-100 text-gray-800`;
    }
};

export const isDefaultDjangoPermission = (codename: string): boolean =>
    ["add_", "change_", "delete_", "view_"].some((prefix) => codename.startsWith(prefix));

export const checkSuperAdmin = (user: any): boolean =>
    user?.is_superuser ||
    user?.roles?.some(
        (role: any) => role.name.toLowerCase().includes("super") || role.name.toLowerCase().includes("admin")
    );

export const createPermission = (
    permission: string,
    isSuperAdmin: boolean,
    hasPermission: (perm: string) => boolean
): boolean => {
    return isSuperAdmin || hasPermission(permission);
};

export const permissionTypeOptions = [
    { value: "all", label: "All Types" },
    { value: "default-django", label: "Default Django Permission" },
    { value: "no-default-django", label: "No Default Django Permission" },
    { value: "module", label: "Module" },
    { value: "system", label: "System" },
];

export const itemsPerPageConfig = {
    users: 5,
    roles: 10,
    groups: 10,
    permissions: 10,
};

// Organization filtering functions
export const filterByOrganization = {
    users: (users: UserDetail[], organizationId: string | number | null, isSuperAdmin: boolean): UserDetail[] => {
        // Super Admin thấy tất cả users
        if (isSuperAdmin) return users;

        // User chưa thuộc tổ chức nào - chỉ thấy users không thuộc tổ chức nào VÀ không phải super admin
        if (!organizationId) {
            return users.filter((user) => !user.organization && !user.is_superuser && !checkSuperAdmin(user));
        }

        // User thuộc tổ chức - chỉ thấy users cùng tổ chức VÀ không phải super admin
        return users.filter(
            (user) => user.organization?.id === organizationId && !user.is_superuser && !checkSuperAdmin(user)
        );
    },

    roles: (roles: RoleDetail[], organizationId: string | number | null, isSuperAdmin: boolean): RoleDetail[] => {
        // Super Admin thấy tất cả roles
        if (isSuperAdmin) return roles;

        // User chưa thuộc tổ chức nào - chỉ thấy system roles cơ bản (không bao gồm admin roles)
        if (!organizationId) {
            return roles.filter((role) => {
                const roleName = role.name.toLowerCase();
                // Loại trừ các role admin/super admin
                const isAdminRole =
                    roleName.includes("admin") || roleName.includes("super") || roleName.includes("manager");

                return (
                    !isAdminRole &&
                    (roleName.includes("guest") ||
                        roleName.includes("basic") ||
                        roleName.includes("viewer") ||
                        roleName.includes("user"))
                );
            });
        }

        // User thuộc tổ chức - loại trừ super admin roles
        return roles.filter((role) => {
            const roleName = role.name.toLowerCase();
            const roleDesc = role.description?.toLowerCase() || "";

            // Loại trừ super admin roles
            const isSuperAdminRole =
                roleName.includes("super") || (roleName.includes("admin") && roleName.includes("system"));

            if (isSuperAdminRole) return false;

            return (
                roleName.includes("admin") ||
                roleName.includes("user") ||
                roleName.includes("org") ||
                roleName.includes("manager") ||
                roleDesc.includes("organization") ||
                roleDesc.includes("document")
            );
        });
    },

    groups: (groups: GroupDetail[], organizationId: string | number | null, isSuperAdmin: boolean): GroupDetail[] => {
        // Super Admin thấy tất cả groups
        if (isSuperAdmin) return groups;

        // User chưa thuộc tổ chức nào - chỉ thấy public groups
        if (!organizationId) {
            return groups.filter((group) => {
                const groupName = group.name.toLowerCase();
                const groupDesc = group.description?.toLowerCase() || "";

                // Loại trừ admin groups
                const isAdminGroup =
                    groupName.includes("admin") || groupName.includes("super") || groupDesc.includes("admin");

                return (
                    !isAdminGroup &&
                    (groupName.includes("public") ||
                        groupName.includes("general") ||
                        groupName.includes("basic") ||
                        groupName.includes("user") ||
                        groupDesc.includes("public"))
                );
            });
        }

        // User thuộc tổ chức - logic như cũ nhưng loại trừ super admin groups
        return groups.filter((group) => {
            const groupName = group.name.toLowerCase();
            const groupDesc = group.description?.toLowerCase() || "";

            // Loại trừ super admin groups
            const isSuperAdminGroup =
                groupName.includes("super") || (groupName.includes("admin") && groupName.includes("system"));

            if (isSuperAdminGroup) return false;

            const hasOrganizationRoles = group.roles?.some((role) => {
                const roleName = role.name.toLowerCase();
                return (
                    roleName.includes("org") ||
                    roleName.includes("document") ||
                    roleName.includes("user") ||
                    roleName.includes("admin")
                );
            });

            return (
                groupName.includes("org") ||
                groupName.includes("department") ||
                groupDesc.includes("organization") ||
                groupDesc.includes("document") ||
                hasOrganizationRoles
            );
        });
    },
};
