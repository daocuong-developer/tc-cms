import axios from "axios";
import Cookies from "js-cookie";

export interface UserDetail {
    id: string;
    username: string;
    email: string;
    full_name?: string;
    phone?: string;
    position?: string;
    address?: string;
    notes?: string;
    role: string;
    department: string;
    is_active: boolean;
    is_online: boolean;
    last_login: string;
    last_logout: string;
    roles: { id: string; name: string; permissions: { codename: string }[] }[];
}

export interface RoleDetail {
    id: string;
    name: string;
    description: string;
    permissions: { id: string; name: string; codename: string }[];
    user_count: number;
}

export interface OrganizationDetail {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface DepartmentDetail {
    id: string;
    name: string;
    description: string;
    members: number;
    roles: { id: string; name: string }[];
}

export interface PermissionDetail {
    id: string;
    name: string;
    codename: string;
    module: string;
    description: string;
    type: "read" | "write" | "delete" | "admin";
}

const API_URL = "http://localhost:8000/api";

const securityApi = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add JWT token to requests if available
securityApi.interceptors.request.use((config) => {
    const token = Cookies.get("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const securityService = {
    // User Management
    getUsers: async (): Promise<UserDetail[]> => {
        const response = await securityApi.get<UserDetail[]>("/auth/users/");
        return response.data;
    },
    createUser: async (userData: any): Promise<UserDetail> => {
        const response = await securityApi.post<UserDetail>("/auth/users/", userData);
        return response.data;
    },
    updateUser: async (id: string, userData: any): Promise<UserDetail> => {
        const response = await securityApi.put<UserDetail>(`/auth/users/${id}/`, userData);
        return response.data;
    },
    deleteUser: async (id: string): Promise<void> => {
        await securityApi.delete(`/auth/users/${id}/`);
    },

    // Role Management
    getRoles: async (): Promise<RoleDetail[]> => {
        const response = await securityApi.get<RoleDetail[]>("/auth/roles/");
        return response.data;
    },
    createRole: async (roleData: any): Promise<RoleDetail> => {
        const response = await securityApi.post<RoleDetail>("/auth/roles/", roleData);
        return response.data;
    },
    updateRole: async (id: string, roleData: any): Promise<RoleDetail> => {
        const response = await securityApi.put<RoleDetail>(`/auth/roles/${id}/`, roleData);
        return response.data;
    },
    deleteRole: async (id: string): Promise<void> => {
        await securityApi.delete(`/auth/roles/${id}/`);
    },

    // Organization Manage
    getOrganizations: async (): Promise<OrganizationDetail[]> => {
        const response = await securityApi.get<OrganizationDetail[]>("/auth/organizations/");
        return response.data;
    },
    
    // Departments Management
    getDepartments: async (includeAllOrganizations = false): Promise<DepartmentDetail[]> => {
        let url = "/auth/departments/";
        if (includeAllOrganizations) {
            url = "/auth/departments/?all_organizations=true";
        }
        const response = await securityApi.get<DepartmentDetail[]>(url);
        console.log(response.data);
        return response.data;
    },
    createDepartment: async (data: any): Promise<DepartmentDetail> => {
        const response = await securityApi.post<DepartmentDetail>("/auth/departments/", data);
        return response.data;
    },
    updateDepartment: async (id: string, data: any): Promise<DepartmentDetail> => {
        const response = await securityApi.put<DepartmentDetail>(`/auth/departments/${id}/`, data);
        return response.data;
    },
    deleteDepartment: async (id: string): Promise<void> => {
        await securityApi.delete(`/auth/departments/${id}/`);
    },

    // Permission Management
    getPermissions: async (): Promise<PermissionDetail[]> => {
        const response = await securityApi.get<PermissionDetail[]>("/auth/permissions/");

        return response.data;
    },
    createPermission: async (permissionData: any): Promise<PermissionDetail> => {
        const response = await securityApi.post<PermissionDetail>("/auth/permissions/", permissionData);
        return response.data;
    },
    updatePermission: async (id: string, permissionData: any): Promise<PermissionDetail> => {
        const response = await securityApi.put<PermissionDetail>(`/auth/permissions/${id}/`, permissionData);
        return response.data;
    },
    deletePermission: async (id: string): Promise<void> => {
        await securityApi.delete(`/auth/permissions/${id}/`);
    },
};

export default securityApi;
