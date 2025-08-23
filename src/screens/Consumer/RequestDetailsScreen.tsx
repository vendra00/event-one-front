import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, Alert, ScrollView, RefreshControl } from "react-native";
import { cancelEventRequest, fetchEventRequest } from "../../api/requests";
import type { EventRequestDto, EventRequestStatus } from "../../types/dtos";

function chipColor(s: EventRequestStatus) {
    switch (s) {
        case "OPEN": return "#2563EB";
        case "BOOKED": return "#059669";
        case "CANCELED": return "#6B7280";
        case "EXPIRED": return "#9CA3AF";
        default: return "#4B5563";
    }
}
const euro = (c?: number | null) =>
    c == null ? undefined : (c / 100).toLocaleString(undefined, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const fmt = (iso: string) =>
    new Date(iso).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export default function RequestDetailsScreen({ route, navigation }: any) {
    const id: number = route.params?.id;
    const [item, setItem] = useState<EventRequestDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await fetchEventRequest(id);
            setItem(d);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { void load(); }, [load]);

    const onCancel = () => {
        if (!item) return;
        Alert.alert("Cancel request", `Cancel “${item.title}”?`, [
            { text: "No" },
            {
                text: "Yes, cancel",
                style: "destructive",
                onPress: async () => {
                    const updated = await cancelEventRequest(item.id);
                    setItem(updated);
                    navigation.goBack();
                },
            },
        ]);
    };

    if (loading || !item) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#6B7280" }}>Loading…</Text>
            </View>
        );
    }

    const canCancel = item.status === "OPEN";

    // Build tags: cuisine names + service tags (CSV)
    const cuisineNames = (item.cuisines ?? []).map(c => c.name).filter(Boolean);
    const serviceTags = (item.services ?? "").split(",").map(s => s.trim()).filter(Boolean);
    const tags = [...cuisineNames, ...serviceTags];

    const city = item.location?.municipalityName ?? "-";
    const province = item.location?.provinceName ? `, ${item.location?.provinceName}` : "";
    const locality = item.location?.locality;
    const postal = item.location?.postalCode;

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={async () => {
                        setRefreshing(true);
                        try { await load(); } finally { setRefreshing(false); }
                    }}
                />
            }
        >
            <View style={{ backgroundColor: "white", borderRadius: 14, padding: 16, gap: 10, elevation: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontSize: 18, fontWeight: "700" }}>{item.title || "Event request"}</Text>
                    <View style={{ backgroundColor: chipColor(item.status), paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                        <Text style={{ color: "white", fontSize: 12, fontWeight: "700" }}>{item.status}</Text>
                    </View>
                </View>

                {/* Location (normalized) */}
                <Text style={{ color: "#374151" }}>
                    {city}{province}
                </Text>
                {(locality || postal) && (
                    <Text style={{ color: "#6B7280" }}>
                        {locality ? `${locality}` : ""}{locality && postal ? " · " : ""}{postal ? `CP ${postal}` : ""}
                    </Text>
                )}

                <Text style={{ color: "#374151" }}>
                    {fmt(item.startsAt)} – {fmt(item.endsAt)} • {item.guests} guests
                </Text>

                {tags.length > 0 && (
                    <Text style={{ color: "#6B7280" }}>
                        {tags.join(" · ")}
                    </Text>
                )}

                {!!item.budgetCents && (
                    <Text style={{ fontWeight: "700" }}>
                        Budget: {euro(item.budgetCents)}
                    </Text>
                )}

                {!!item.notes && (
                    <View style={{ marginTop: 6 }}>
                        <Text style={{ color: "#6B7280", marginBottom: 4 }}>Notes</Text>
                        <Text style={{ color: "#111827" }}>{item.notes}</Text>
                    </View>
                )}

                {(item.providerId || item.offeringId) && (
                    <View style={{ marginTop: 6 }}>
                        <Text style={{ color: "#6B7280", marginBottom: 4 }}>Targeted</Text>
                        <Text style={{ color: "#111827" }}>
                            {item.providerId ? `Provider #${item.providerId}` : "Any provider"}
                            {item.offeringId ? ` • Offering #${item.offeringId}` : ""}
                        </Text>
                    </View>
                )}
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={({ pressed }) => [
                        { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#f3f4f6", opacity: pressed ? 0.9 : 1 },
                    ]}
                >
                    <Text style={{ fontWeight: "600" }}>Back</Text>
                </Pressable>

                <Pressable
                    disabled={!canCancel}
                    onPress={onCancel}
                    style={({ pressed }) => [
                        { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 10, backgroundColor: canCancel ? "#ef4444" : "#e5e7eb", opacity: pressed ? 0.9 : 1 },
                    ]}
                >
                    <Text style={{ color: canCancel ? "white" : "#9CA3AF", fontWeight: "700" }}>
                        Cancel request
                    </Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}
