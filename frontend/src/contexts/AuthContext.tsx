// import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import type { AuthContextType, LoginCredentials, RegisterData, User } from "../types/auth.types";
// import { authApi } from "@services/authApi";
// import { toast } from "react-toastify";
// import { setAuthContext } from "@services/authContextHelper";

// const AuthContext = createContext<AuthContextType | null>(null);

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error("useAuth must be used within an AuthProvider");
//     }
//     return context;
// };

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const [user, setUser] = useState<User | null>(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const navigate = useNavigate();

//     const checkAuth = async () => {
//         try {
//             const currentUser = await authApi.getCurrentUser();
//             setUser(currentUser);
//         } catch (error) {
//             setUser(null);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         checkAuth();
//     }, []);

//     const login = async (credentials: LoginCredentials) => {
//         setIsLoading(true);
//         try {
//             const response = await authApi.login(credentials);
//             setUser(response.user);
//             navigate("/dashboard");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const register = async (data: RegisterData) => {
//         setIsLoading(true);
//         try {
//             const response = await authApi.register(data);
//             setUser(response.user);
//             navigate("/dashboard");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const logout = useCallback(async () => {
//         setIsLoading(true);
//         try {
//             await authApi.logout();
//             setUser(null);
//             navigate("/login");
//         } finally {
//             setIsLoading(false);
//         }
//     }, [navigate]);

//     const forceLogout = useCallback(
//         async (message = "Your session has expired. Please log in again.") => {
//             toast.error(message);
//             await logout();
//         },
//         [logout]
//     );

//     const normalizePermission = (code: string): string => {
//         return code.trim().toLowerCase().replace(/_?s$/, "");
//     };

//     const hasPermission = (codename: string): boolean => {
//         if (!user) return false;

//         const target = normalizePermission(codename);

//         return user.permissions?.some((perm) => normalizePermission(perm) === target) ?? false;
//     };

//     const value: AuthContextType = {
//         user,
//         login,
//         logout,
//         register,
//         forceLogout,
//         hasPermission,
//         isAuthenticated: !!user,
//         isLoading,
//     };

//     useEffect(() => {
//         if (value.isAuthenticated) {
//             setAuthContext(value);
//         }
//     }, [value]);

//     if (isLoading) {
//         return <div>Loading...</div>;
//     }

//     return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

import React, { createContext, useCallback, useContext, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthContextType, LoginCredentials, RegisterData, User } from "../types/auth.types";
import { authApi } from "@services/authApi";
import { toast } from "react-toastify";

// Định nghĩa lại AuthContext với các kiểu dữ liệu đã được xác định
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

    // Sử dụng state riêng để lưu trữ danh sách quyền
    const [userPermissions, setUserPermissions] = useState<string[]>([]);

    // Hàm này sẽ lấy tất cả quyền của người dùng và lưu vào state
    const processPermissions = useCallback((userData: User) => {
        // Giả sử API của bạn trả về permissions trong một trường tên là 'permissions'
        // Nếu API trả về permissions từ nhiều nguồn (user, roles, groups), bạn cần tổng hợp chúng tại đây
        const allPermissions: string[] = [...(userData.permissions || [])];
        setUserPermissions(allPermissions);
    }, []);

    const checkAuth = async () => {
        setIsLoading(true);
        try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
            processPermissions(currentUser);
        } catch (error) {
            setUser(null);
            setUserPermissions([]);
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
            // Sau khi đăng nhập thành công, xử lý và lưu các quyền
            processPermissions(response.user);
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.message || "Login failed. Please try again.");
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterData) => {
        setIsLoading(true);
        try {
            const response = await authApi.register(data);
            setUser(response.user);
            // Sau khi đăng ký thành công, xử lý và lưu các quyền
            processPermissions(response.user);
            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await authApi.logout();
            setUser(null);
            setUserPermissions([]);
            navigate("/login");
        } catch {
            // Không làm gì nếu logout thất bại
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

    // Bỏ hàm normalizePermission để tránh lỗi với các quyền hợp lệ có đuôi 's'
    const hasPermission = useCallback(
        (codename: string): boolean => {
            if (!user) return false;
            // Kiểm tra xem user có phải superuser không
            if (user.is_superuser) return true;
            // Kiểm tra quyền từ danh sách userPermissions đã được lưu
            return userPermissions.includes(codename);
        },
        [user, userPermissions]
    );

    const value: AuthContextType = useMemo(
        () => ({
            user,
            login,
            logout,
            register,
            forceLogout,
            hasPermission,
            isAuthenticated: !!user,
            isLoading,
        }),
        [user, login, logout, register, forceLogout, hasPermission, isLoading]
    );

    // Xóa useEffect này nếu không cần thiết. Việc lưu context toàn cục có thể gây ra các vấn đề
    // Nếu bạn cần lưu token, hãy lưu nó vào localStorage hoặc cookies
    // useEffect(() => {
    //     if (value.isAuthenticated) {
    //         setAuthContext(value);
    //     }
    // }, [value]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
