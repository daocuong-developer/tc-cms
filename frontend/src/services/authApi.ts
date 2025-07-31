import axios from "axios";
import Cookies from "js-cookie";
import type { AuthResponse, LoginCredentials, RegisterData, User } from "../types/auth.types";

const API_URL = "http://localhost:8000/api";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
    const token = Cookies.get("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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

    // fix: Ensure tokens are always cleared on logout
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

        const response = await api.post<{ access: string }>("/auth/token/refresh/", {
            refresh,
        });

        Cookies.set("access_token", response.data.access);
        return response.data;
    },
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { access } = await authApi.refreshToken();
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (err) {
                await authApi.logout();
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
