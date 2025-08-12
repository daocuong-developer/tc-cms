import { UserDetail, PermissionDetail } from "@/services/securityApi";

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
