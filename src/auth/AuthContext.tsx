import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import * as SecureStore from "expo-secure-store";
import { AppUserDto, UserRole } from "../types/dtos";

type AuthState = {
    token: string | null;
    me: AppUserDto | null;
    loading: boolean;
    signIn(email: string, password: string): Promise<void>;
    signOut(): Promise<void>;
    register(email: string, password: string, role: UserRole): Promise<void>;
};

const Ctx = createContext<AuthState>(null as any);
export const useAuth = () => useContext(Ctx);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [me, setMe] = useState<AppUserDto | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = async (tok: string) => {
        await SecureStore.setItemAsync("token", tok);
        const res = await api.get<AppUserDto>("/api/users/me");
        setMe(res.data);
    };

    useEffect(() => {
        (async () => {
            const saved = await SecureStore.getItemAsync("token");
            if (saved) {
                setToken(saved);
                try { await fetchMe(saved); } catch {}
            }
            setLoading(false);
        })();
    }, []);

    const signIn = async (email: string, password: string) => {
        const res = await api.post<{ token: string }>("/api/auth/login", { email, password });
        const tok = res.data.token;
        setToken(tok);
        await fetchMe(tok);
    };

    const register = async (email: string, password: string, role: UserRole) => {
        await api.post("/api/auth/register", { email, password, role });
        await signIn(email, password);
    };

    const signOut = async () => {
        setToken(null);
        setMe(null);
        await SecureStore.deleteItemAsync("token");
    };

    const value = useMemo(() => ({ token, me, loading, signIn, signOut, register }), [token, me, loading]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
