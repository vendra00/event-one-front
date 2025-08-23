// api/http.ts
import { Platform } from "react-native";
// adjust base for emulator vs simulator
export const API_BASE = Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

// get the access token from your auth store/secure storage
async function getToken(): Promise<string | null> {
    // e.g., from SecureStore/AsyncStorage/your auth context
    // return await SecureStore.getItemAsync("access_token");
    return null; // <-- replace
}

export async function httpGetAuth<T>(path: string): Promise<T> {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_BASE}${path}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${path}`);

    const json = (await res.json()) as T;   // ✅ await the async call
    return json;
}

