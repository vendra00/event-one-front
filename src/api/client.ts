import axios, { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Platform } from "react-native";

const extra =
    (Constants.expoConfig as any)?.extra ??
    (Constants as any).manifest?.extra ??
    (Constants as any).manifest2?.extra;

const fallback = Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";
const baseURL = extra?.apiBaseUrl ?? fallback;

export const api = axios.create({ baseURL });

// Request interceptor: don't attach token on /api/auth/*
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const url = config.url ?? "";
    const fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`;
    if (fullUrl.includes("/api/auth/")) return config;

    const token = await SecureStore.getItemAsync("token");
    if (token) {
        // Normalize to AxiosHeaders and set Authorization
        const headers = AxiosHeaders.from(config.headers);
        headers.set("Authorization", `Bearer ${token}`);
        config.headers = headers;
    }
    return config;
});

// Optional: clear bad token on 401 (except auth routes)
api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const status = err?.response?.status;
        const url = err?.config?.url ?? "";
        if (status === 401 && !url.includes("/api/auth/")) {
            await SecureStore.deleteItemAsync("token");
        }
        return Promise.reject(err);
    }
);
