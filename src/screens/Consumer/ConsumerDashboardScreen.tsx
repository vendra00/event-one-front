import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView /*, Image */ } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../auth/AuthContext";

const COLORS = {
    bg: "#F6F7FB",
    card: "#FFFFFF",
    border: "#E5E7EB",
    text: "#111827",
    subtext: "#6B7280",
    primary: "#2563EB",
};

export default function ConsumerDashboardScreen({ navigation }: any) {
    const { me, signOut } = useAuth();

    return (
        <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
            {/* Top bar */}
            <View style={styles.topbar}>
                <View>
                    <Text style={styles.hello}>Hello,</Text>
                    <Text style={styles.email}>{me?.email}</Text>
                </View>
                <Pressable onPress={signOut} style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.9 }]}>
                    <Text style={styles.signOutText}>Sign out</Text>
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={{
                    paddingVertical: 8,
                    paddingBottom: 80, // space for logo/footer
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Card: Find offerings */}
                <Pressable
                    onPress={() => navigation.navigate("ConsumerSearch")}
                    style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}
                >
                    <Text style={styles.cardTitle}>Find offerings</Text>
                    <Text style={styles.cardSubtitle}>
                        Browse chefs and catering companies by city, cuisine and guest count.
                    </Text>
                </Pressable>

                {/* Card: Create event request */}
                <Pressable
                    onPress={() => navigation.navigate("ConsumerCreateRequest")}
                    style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}
                >
                    <Text style={styles.cardTitle}>Create event request</Text>
                    <Text style={styles.cardSubtitle}>
                        Describe your event and let providers propose offers.
                    </Text>
                </Pressable>

                {/* Card: My requests */}
                <Pressable
                    onPress={() => navigation.navigate("ConsumerMyRequests")}
                    style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                >
                    <Text style={styles.cardTitle}>My requests</Text>
                    <Text style={styles.cardHint}>View & manage</Text>
                </Pressable>

                {/* Disabled / future item */}
                <View style={[styles.card, styles.cardDisabled]}>
                    <Text style={styles.cardTitle}>My bookings</Text>
                    <Text style={styles.cardSubtitle}>View confirmed bookings and details.</Text>
                    <View style={styles.disabledPill}>
                        <Text style={styles.disabledPillText}>Coming soon</Text>
                    </View>
                </View>

                {/* Logo placeholder (appears after content) */}
                <View style={styles.logoContainer}>
                    {/* Replace with your real logo when ready:
          <Image source={require("../../assets/logo.png")} style={styles.logoImage} resizeMode="contain" />
          */}
                    <Text style={styles.logoText}>App Logo</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.bg,
        paddingHorizontal: 20,
    },
    topbar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    hello: { color: COLORS.subtext, fontSize: 12 },
    email: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
    signOut: {
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: "#fff",
    },
    signOutText: { color: COLORS.subtext, fontWeight: "600" },

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
        marginBottom: 14,
    },
    cardTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text, marginBottom: 4 },
    cardSubtitle: { color: COLORS.subtext, marginBottom: 12 },
    cardHint: { color: COLORS.subtext, fontSize: 12, fontWeight: "600" },
    cardPressed: { opacity: 0.95 },

    primaryPill: {
        alignSelf: "flex-start",
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    primaryPillText: { color: "#fff", fontWeight: "700" },

    cardDisabled: { opacity: 0.55 },
    disabledPill: {
        alignSelf: "flex-start",
        backgroundColor: "#EEF2FF",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    disabledPillText: { color: COLORS.subtext, fontWeight: "600" },

    logoContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
        paddingVertical: 12,
    },
    // logoImage: { width: 140, height: 40 },
    logoText: { color: COLORS.subtext, fontWeight: "600" },
});
