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

export const checkSuperAdmin = (user: any): boolean => {
    if (!user) return false;
    return user.is_superuser === true || user.roles?.some((role: any) => role.is_super_admin === true);
};

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

export const filterByOrganization = {
    users: (
        users: UserDetail[],
        organizationId: string | number | null,
        isSuperAdmin: boolean,
        currentUser?: UserDetail
    ): UserDetail[] => {
        console.log("Check User:", organizationId);
        if (isSuperAdmin) return users;

        if (!organizationId) {
            // User không thuộc tổ chức → chỉ thấy user không thuộc tổ chức và không phải superuser
            return users.filter((u) => !u.organization && !(u as any).is_superuser);
        }

        // User thuộc tổ chức → chỉ thấy user cùng tổ chức
        return users.filter((u) => u.organization?.id === organizationId);
    },

    roles: (
        roles: RoleDetail[],
        organizationId: string | number | null,
        isSuperAdmin: boolean,
        currentUser?: UserDetail
    ): RoleDetail[] => {
        if (isSuperAdmin) return roles;

        if (!organizationId) {
            const userRoleIds = currentUser?.roles?.map((r) => r.id) || [];
            const filteredRoles = roles.filter((role) => !role.organization || userRoleIds.includes(role.id));

            return filteredRoles;
        }

        // Hiển thị roles thuộc organization + roles của user
        const userRoleIds = currentUser?.roles?.map((r) => r.id) || [];
        const filteredRoles = roles.filter(
            (role) => String(role.organization?.id) === String(organizationId) || userRoleIds.includes(role.id)
        );

        console.log("Filtered roles (with org):", filteredRoles.length);
        return filteredRoles;
    },

    groups: (
        groups: GroupDetail[],
        organizationId: string | number | null,
        isSuperAdmin: boolean,
        currentUser?: UserDetail
    ): GroupDetail[] => {
        if (isSuperAdmin) return groups;

        if (!organizationId) {
            // Không thuộc tổ chức → chỉ thấy group mình đang tham gia
            return groups.filter((group) => currentUser?.groups?.some((g) => g.id === group.id));
        }

        // Thuộc tổ chức → chỉ thấy group thuộc tổ chức đó
        return groups.filter(
            (group) => group.organization?.id === organizationId || currentUser?.groups?.some((g) => g.id === group.id)
        );
    },
};
