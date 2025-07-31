import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthContextType, LoginCredentials, RegisterData, User } from "../types/auth.types";
import { authApi } from "../services/authApi";

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const checkAuth = async () => {
        try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            const response = await authApi.login(credentials);
            setUser(response.user);
            navigate("/dashboard");
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterData) => {
        setIsLoading(true);
        try {
            const response = await authApi.register(data);
            setUser(response.user);
            navigate("/dashboard");
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authApi.logout();
            setUser(null);
            navigate("/login");
        } finally {
            setIsLoading(false);
        }
    };

    const hasPermission = (codename: string): boolean => {
        if (!user) return false;

        // Tách phần sau dấu ":" nếu có
        const cleanCodename = codename.includes(":") ? codename.split(":")[1] : codename;

        return user.roles.some((role) => role.permissions.some((permission) => permission.codename === cleanCodename));
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        register,
        hasPermission,
        isAuthenticated: !!user,
        isLoading,
    };

    if (isLoading) {
        return <div>Loading...</div>; // You can replace this with a proper loading component
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
