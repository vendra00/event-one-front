import React, { useState } from "react";
import {
    View, TextInput, Text, Pressable, StyleSheet,
    KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator
} from "react-native";
import { useAuth } from "../auth/AuthContext";
import type { UserRole } from "../types/dtos";

const ROLES: UserRole[] = ["CONSUMER", "PROVIDER"];

export default function RegisterScreen({ navigation }: any) {
    const { register } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [secure, setSecure] = useState(true);
    const [role, setRole] = useState<UserRole>("CONSUMER");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        if (loading) return;
        setErr(null);
        setLoading(true);
        try {
            await register(email.trim(), password, role); // AuthProvider auto-logs in afterwards
        } catch (e: any) {
            setErr(e?.response?.data?.message ?? "Register failed");
        } finally {
            setLoading(false);
        }
    };

    const valid = email.includes("@") && password.length >= 8;

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.screen}>
                    {/* Header / Branding */}
                    <View style={styles.header}>
                        <Text style={styles.brand}>EventOne</Text>
                        <Text style={styles.subtitle}>Create your account</Text>
                    </View>

                    {/* Card */}
                    <View style={styles.card}>
                        {!!err && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{err}</Text>
                            </View>
                        )}

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            placeholder="you@example.com"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                        />

                        <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
                        <View style={styles.passwordRow}>
                            <TextInput
                                placeholder="Min 8 characters"
                                secureTextEntry={secure}
                                value={password}
                                onChangeText={setPassword}
                                style={[
                                    styles.input,
                                    { flex: 1, marginBottom: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }
                                ]}
                            />
                            <Pressable
                                onPress={() => setSecure((s) => !s)}
                                style={({ pressed }) => [styles.toggle, pressed && { opacity: 0.85 }]}
                            >
                                <Text style={styles.toggleText}>{secure ? "Show" : "Hide"}</Text>
                            </Pressable>
                        </View>

                        <Text style={[styles.label, { marginTop: 16, marginBottom: 8 }]}>Choose your role</Text>
                        <View style={styles.roleRow}>
                            {ROLES.map((r) => {
                                const selected = role === r;
                                return (
                                    <Pressable
                                        key={r}
                                        onPress={() => setRole(r)}
                                        style={({ pressed }) => [
                                            styles.rolePill,
                                            selected && styles.rolePillSelected,
                                            pressed && { opacity: 0.9 },
                                        ]}
                                    >
                                        <Text style={[styles.roleText, selected && styles.roleTextSelected]}>{r}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <Pressable
                            onPress={submit}
                            disabled={!valid || loading}
                            style={({ pressed }) => [
                                styles.primaryBtn,
                                (!valid || loading) && { opacity: 0.6 },
                                pressed && { opacity: 0.9 },
                            ]}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Create account</Text>}
                        </Pressable>

                        <Text style={styles.smallText}>
                            Already have an account?{" "}
                            <Text onPress={() => navigation.navigate("Login")} style={styles.link}>Sign in</Text>
                        </Text>
                    </View>

                    <Text style={styles.footerNote}>By continuing you agree to our Terms & Privacy Policy.</Text>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const COLORS = {
    bg: "#F6F7FB",
    card: "#FFFFFF",
    border: "#E5E7EB",
    text: "#111827",
    subtext: "#6B7280",
    primary: "#2563EB",
    dangerBg: "#FEE2E2",
    dangerText: "#B91C1C",
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 20, paddingTop: 40 },
    header: { marginBottom: 16 },
    brand: { fontSize: 28, fontWeight: "800", color: COLORS.text, letterSpacing: 0.3 },
    subtitle: { color: COLORS.subtext, marginTop: 4 },

    card: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },

    label: { color: COLORS.subtext, fontSize: 12, marginBottom: 4 },
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#fff",
        marginBottom: 8,
    },
    passwordRow: { flexDirection: "row", alignItems: "center" },
    toggle: {
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderLeftWidth: 0,
        borderColor: COLORS.border,
        backgroundColor: "#F9FAFB",
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        justifyContent: "center",
    },
    toggleText: { color: COLORS.subtext, fontWeight: "600" },

    roleRow: { flexDirection: "row", marginBottom: 8 },
    rolePill: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: "#fff",
        marginRight: 12, // use margin for broader RN compatibility
    },
    rolePillSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
    roleText: { color: COLORS.text },
    roleTextSelected: { color: "#fff", fontWeight: "700" },

    primaryBtn: {
        marginTop: 14,
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

    smallText: { marginTop: 12, textAlign: "center", color: COLORS.subtext },
    link: { color: COLORS.primary, fontWeight: "600" },

    errorBox: {
        backgroundColor: COLORS.dangerBg,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#FCA5A5",
        marginBottom: 8,
    },
    errorText: { color: COLORS.dangerText },

    footerNote: { marginTop: 16, textAlign: "center", color: COLORS.subtext, fontSize: 12 },
});
