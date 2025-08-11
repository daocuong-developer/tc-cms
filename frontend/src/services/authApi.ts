import axios from "axios";
import Cookies from "js-cookie";
import type { AuthResponse, LoginCredentials, RegisterData, User } from "../types/auth.types";
import { getAuthContext } from "./authContextHelper";

const API_URL = import.meta.env.VITE_API_URL;
console.log("API_URL dùng:", API_URL);

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// === Refresh token queue ===
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// === Add JWT token to all requests ===
api.interceptors.request.use((config) => {
    const token = Cookies.get("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// === Auth API ===
export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/auth/login/", credentials);
        Cookies.set("access_token", response.data.access);
        Cookies.set("refresh_token", response.data.refresh);
        return response.data;
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/auth/register/", data);
        Cookies.set("access_token", response.data.access);
        Cookies.set("refresh_token", response.data.refresh);
        return response.data;
    },

    logout: async (): Promise<void> => {
        const refresh_token = Cookies.get("refresh_token");
        console.log("Refresh token gửi đi:", refresh_token);

        try {
            if (refresh_token) {
                await api.post("/auth/logout/", { refresh: refresh_token });
            }
        } catch (error) {
            console.error("Logout request failed:");
        } finally {
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
        }
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<User>("/auth/users/me/");
        return response.data;
    },

    refreshToken: async (): Promise<{ access: string }> => {
        const refresh = Cookies.get("refresh_token");
        if (!refresh) throw new Error("No refresh token");

        const response = await axios.post<{ access: string }>(
            `${API_URL}/auth/token/refresh/`,
            { refresh },
            { withCredentials: true }
        );

        Cookies.set("access_token", response.data.access);
        return response.data;
    },
};

// === Response Interceptor: handle token refresh ===
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject: (err: any) => {
                            reject(err);
                        },
                    });
                });
            }

            isRefreshing = true;

            try {
                const { access } = await authApi.refreshToken();
                processQueue(null, access);
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);

                const ctx = getAuthContext();
                if (ctx) {
                    await ctx.forceLogout("Your session has expired. Please log in again.");
                }

                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
