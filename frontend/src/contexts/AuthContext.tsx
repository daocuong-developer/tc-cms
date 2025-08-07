import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthContextType, LoginCredentials, RegisterData, User } from "../types/auth.types";
import { authApi } from "@services/authApi";
import { toast } from "react-toastify";
import { setAuthContext } from "@services/authContextHelper";

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

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await authApi.logout();
            setUser(null);
            navigate("/login");
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    const forceLogout = useCallback(
        async (message = "Your session has expired. Please log in again.") => {
            toast.error(message);
            await logout();
        },
        [logout]
    );

    const normalizePermission = (code: string): string => {
        return code.trim().toLowerCase().replace(/_?s$/, "");
    };

    const hasPermission = (codename: string): boolean => {
        if (!user) return false;

        const target = normalizePermission(codename);

        return user.permissions?.some((perm) => normalizePermission(perm) === target) ?? false;
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        register,
        forceLogout,
        hasPermission,
        isAuthenticated: !!user,
        isLoading,
    };

    useEffect(() => {
        if (value.isAuthenticated) {
            setAuthContext(value);
        }
    }, [value]);
    
    if (isLoading) {
        return <div>Loading...</div>; // You can replace this with a proper loading component
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
