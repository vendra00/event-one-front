import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Fallbacks per platform so you can run on emulator or iOS sim easily
const fallback =
    Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

const baseURL =
    (Constants.expoConfig?.extra as any)?.apiBaseUrl ?? fallback;

export const api = axios.create({ baseURL });

api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
