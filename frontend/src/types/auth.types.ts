export interface User {
    id: number;
    email: string;
    full_name: string;
    roles: Role[];
    permissions?: string[]; 
}

export interface Role {
    id: number;
    name: string;
    description: string;
    permissions: Permission[];
}

export interface Permission {
    id: number;
    codename: string;
    description: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    full_name: string;
    password: string;
    password_confirm: string;
}

export interface AuthResponse {
    user: User;
    access: string;
    refresh: string;
}

export interface AuthContextType {
    user: User | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    hasPermission: (codename: string) => boolean;
    isAuthenticated: boolean;
    isLoading: boolean;
}
