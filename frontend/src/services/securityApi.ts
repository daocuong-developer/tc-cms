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
    department?: {
        id: number;
        name: string;
        description: string;
        organization: {
            id: number;
            name: string;
            description: string;
            created_at: string;
            updated_at: string;
        };
        created_at: string;
        updated_at: string;
    };
    organization?: {
        id: number;
        name: string;
        description: string;
        created_at: string;
        updated_at: string;
    };
    groups: {
        id: string;
        name: string;
        organization_id: number;
    }[];

    is_active: boolean;
    is_online: boolean;
    last_login: string;
    last_logout: string;
    roles: { id: string; name: string; permissions: { codename: string }[] }[];
}

export interface OrganizationDetail {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface GroupDetail {
    id: string;
    name: string;
    description: string;
    organization_id: number;
    organization?: OrganizationDetail;
    members: number;
    roles: { id: string; name: string }[];
    users: { id: string; username: string; full_name?: string }[];
}

export interface DepartmentDetail {
    id: string;
    name: string;
    description: string;
    organization_id: number;
    organization?: OrganizationDetail;
    members: number;
    roles?: { id: string; name: string }[];
}

export interface RoleDetail {
    id: string;
    name: string;
    description: string;
    organization_id?: number; 
    organization?: OrganizationDetail;
    permissions: { id: string; name: string; codename: string }[];
    user_count: number;
    is_system_role?: boolean;  
}

export interface PermissionDetail {
    id: string;
    name: string;
    codename: string;
    module: string;
    description: string;
    type: "create" | "view" | "update" | "delete" | "admin" | "write" | "read";
}

export interface CustomerDetail {
    id: string;
    customerName: string;
    email: string;
    phone: string | null;
    deviceName: string | null;
    organization: string | null;
    created_at: string;
    updated_at: string;
}

export interface ContractDetail {
    id: string;
    customer: CustomerDetail;
    deviceName: string;
    organization: string;
    timesMarked: number;
    startDate: string;
    endDate: string;
    status: "ACTIVE" | "EXPIRED" | "PAUSED";
    create_at: string;
    update_at: string;
}

export interface ContractCreatePayload {
    customer_id: string;
    deviceName: string;
    organization: string;
    totalAmount: number;
    startDate: string;
    endDate: string;
    status: "ACTIVE" | "EXPIRED" | "PAUSED";
}

export interface SoftwareDetail {
    id: string;
    name: string;
    version: string;
    platform: string;
    isCurrentVersion: boolean;
    status: "ACTIVE" | "INACTIVE";
    lastUpdated: string;
    created_at: string;
}

const API_URL = import.meta.env.VITE_API_URL;

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

    createOrganization: async (organizationData: any): Promise<OrganizationDetail> => {
        const response = await securityApi.post<OrganizationDetail>("/auth/organizations/", organizationData);
        return response.data;
    },
    updateOrganization: async (id: string, organizationData: any): Promise<OrganizationDetail> => {
        const response = await securityApi.put<OrganizationDetail>(`/auth/organizations/${id}/`, organizationData);
        return response.data;
    },
    deleteOrganization: async (id: string): Promise<void> => {
        await securityApi.delete(`/auth/organizations/${id}/`);
    },

    // Group Management
    getGroups: async (): Promise<GroupDetail[]> => {
        const response = await securityApi.get<GroupDetail[]>("/auth/groups/");
        return response.data;
    },
    createGroup: async (groupData: any): Promise<GroupDetail> => {
        const response = await securityApi.post<GroupDetail>("/auth/groups/", groupData);
        return response.data;
    },
    updateGroup: async (id: string, groupData: any): Promise<GroupDetail> => {
        const response = await securityApi.put<GroupDetail>(`/auth/groups/${id}/`, groupData);
        return response.data;
    },
    deleteGroup: async (id: string): Promise<void> => {
        await securityApi.delete(`/auth/groups/${id}/`);
    },

    // Departments Management
    getDepartments: async (includeAllOrganizations = false): Promise<DepartmentDetail[]> => {
        let url = "/auth/departments/";
        if (includeAllOrganizations) {
            url = "/auth/departments/?all_organizations=true";
        }
        const response = await securityApi.get<DepartmentDetail[]>(url);
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

    // Customer Management
    getCustomers: async (): Promise<CustomerDetail[]> => {
        const response = await securityApi.get<CustomerDetail[]>("/auth/customers/");
        return response.data;
    },
    createCustomer: async (
        customerData: Omit<CustomerDetail, "id" | "created_at" | "updated_at">
    ): Promise<CustomerDetail> => {
        const response = await securityApi.post<CustomerDetail>("/auth/customers/", customerData);
        return response.data;
    },
    updateCustomer: async (id: string, customerData: Partial<CustomerDetail>): Promise<CustomerDetail> => {
        const response = await securityApi.patch<CustomerDetail>(`/auth/customers/${id}/`, customerData);
        return response.data;
    },
    deleteCustomer: async (id: string): Promise<void> => {
        await securityApi.delete(`/auth/customers/${id}/`);
    },

    // Contract Management
    getContracts: async (): Promise<ContractDetail[]> => {
        const response = await securityApi.get<ContractDetail[]>("/auth/contracts/");
        return response.data;
    },
    createContract: async (contractData: ContractCreatePayload): Promise<ContractDetail> => {
        const response = await securityApi.post<ContractDetail>("/auth/contracts/", contractData);
        return response.data;
    },
    updateContract: async (id: string, contractData: Partial<ContractDetail>): Promise<ContractDetail> => {
        const response = await securityApi.patch<ContractDetail>(`/auth/contracts/${id}/`, contractData);
        return response.data;
    },
    deleteContract: async (id: string): Promise<void> => {
        await securityApi.delete(`/auth/contracts/${id}/`);
    },

    // Software Management
    getSoftware: async (): Promise<SoftwareDetail[]> => {
        const response = await securityApi.get<SoftwareDetail[]>("/auth/software/");
        return response.data;
    },
    createSoftware: async (
        softwareData: Omit<SoftwareDetail, "id" | "created_at" | "lastUpdated">
    ): Promise<SoftwareDetail> => {
        const response = await securityApi.post<SoftwareDetail>("/auth/software/", softwareData);
        return response.data;
    },
    updateSoftware: async (id: string, softwareData: Partial<SoftwareDetail>): Promise<SoftwareDetail> => {
        const response = await securityApi.patch<SoftwareDetail>(`/auth/software/${id}/`, softwareData);
        return response.data;
    },
    deleteSoftware: async (id: string): Promise<void> => {
        await securityApi.delete(`/auth/software/${id}/`);
    },
};

export default securityApi;
