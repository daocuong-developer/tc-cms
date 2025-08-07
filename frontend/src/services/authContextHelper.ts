import type { AuthContextType } from "../types/auth.types";

let authContext: AuthContextType | null = null;

export const setAuthContext = (ctx: AuthContextType) => {
    authContext = ctx;
};

export const getAuthContext = (): AuthContextType | null => {
    return authContext;
};
