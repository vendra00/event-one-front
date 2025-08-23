import React, { useCallback, useEffect, useState } from "react";
import { View, FlatList, RefreshControl, Text, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { fetchMyEventRequests } from "../../api/requests";
import type { EventRequestDto, EventRequestStatus } from "../../types/dtos";

function euro(cents?: number | null) {
    if (cents == null) return undefined;
    return (cents / 100).toLocaleString(undefined, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
    });
}
function fmt(dIso: string) {
    const d = new Date(dIso);
    return d.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
function statusColor(s: EventRequestStatus): string {
    switch (s) {
        case "OPEN": return "#2563EB";
        case "BOOKED": return "#059669";
        case "CANCELED": return "#6B7280";
        case "EXPIRED": return "#9CA3AF";
        default: return "#4B5563";
    }
}

export default function MyRequestsScreen({ navigation }: any) {
    const [items, setItems] = useState<EventRequestDto[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (reset = false) => {
        if (reset) {
            setRefreshing(true);
            try {
                const p = await fetchMyEventRequests(0, 20);
                setItems(p.content);
                setPage(0);
                setTotalPages(p.totalPages);
            } finally {
                setRefreshing(false);
            }
        } else {
            if (loadingMore || refreshing || page + 1 >= totalPages) return;
            setLoadingMore(true);
            try {
                const p = await fetchMyEventRequests(page + 1, 20);
                setItems(prev => [...prev, ...p.content]);
                setPage(p.number);
                setTotalPages(p.totalPages);
            } finally {
                setLoadingMore(false);
            }
        }
    }, [page, totalPages, loadingMore, refreshing]);

    useEffect(() => { load(true); }, [load]);

    useFocusEffect(
        useCallback(() => {
            load(true);
            return () => {};
        }, [load])
    );

    const renderItem = ({ item }: { item: EventRequestDto }) => {
        // NEW: cuisines are an array of {code,name}
        const cuisineNames = (item.cuisines ?? []).map(c => c.name).filter(Boolean);
        // services still CSV
        const serviceTags = (item.services ?? "")
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);

        const tags = [...cuisineNames, ...serviceTags];

        // Optional: show municipality + province from normalized location
        const city = item.location?.municipalityName ?? "-";
        const region = item.location?.provinceName
            ? `, ${item.location?.provinceName}`
            : "";

        return (
            <View
                style={{
                    backgroundColor: "white",
                    borderRadius: 14,
                    padding: 14,
                    marginHorizontal: 16,
                    marginVertical: 8,
                    shadowColor: "#000",
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 1,
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 16, fontWeight: "600" }} numberOfLines={1}>{item.title}</Text>
                    <View style={{ backgroundColor: statusColor(item.status), paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                        <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>{item.status}</Text>
                    </View>
                </View>

                <Text style={{ marginTop: 6, color: "#374151" }}>
                    {city}{region}
                </Text>
                <Text style={{ marginTop: 2, color: "#374151" }}>
                    {fmt(item.startsAt)} – {fmt(item.endsAt)} • {item.guests} guests
                </Text>

                {tags.length > 0 && (
                    <Text style={{ marginTop: 4, color: "#6B7280" }}>
                        {tags.join(" · ")}
                    </Text>
                )}

                {!!item.budgetCents && (
                    <Text style={{ marginTop: 4, color: "#111827", fontWeight: "600" }}>
                        Budget: {euro(item.budgetCents)}
                    </Text>
                )}

                <View style={{ flexDirection: "row", marginTop: 12 }}>
                    <Pressable
                        onPress={() => navigation.navigate("RequestDetails", { id: item.id })}
                        style={({ pressed }) => [
                            {
                                flexGrow: 1,
                                alignItems: "center",
                                paddingVertical: 10,
                                borderRadius: 10,
                                backgroundColor: "#2563EB",
                                opacity: pressed ? 0.9 : 1,
                            },
                        ]}
                    >
                        <Text style={{ color: "white", fontWeight: "600" }}>Details</Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    return (
        <FlatList
            data={items}
            keyExtractor={(it) => String(it.id)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingVertical: 8 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
            onEndReachedThreshold={0.5}
            onEndReached={() => load(false)}
            ListEmptyComponent={
                <View style={{ padding: 24, alignItems: "center" }}>
                    <Text style={{ fontSize: 16, color: "#6B7280" }}>No requests yet</Text>
                    <Text style={{ color: "#9CA3AF", marginTop: 4 }}>Create your first event request from Dashboard</Text>
                </View>
            }
            ListFooterComponent={
                loadingMore ? (
                    <View style={{ paddingVertical: 12, alignItems: "center" }}>
                        <Text style={{ color: "#6B7280" }}>Loading…</Text>
                    </View>
                ) : null
            }
        />
    );
}
