import React, { useEffect, useState } from "react";
import { View, Button, FlatList, Text } from "react-native";
import { api } from "../../api/client";
import { EventRequestDto, Page } from "../../types/dtos";

function fmt(dIso: string) {
    const d = new Date(dIso);
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function RequestsScreen() {
    const [includeNearby, setIncludeNearby] = useState(true);
    const [data, setData] = useState<Page<EventRequestDto> | null>(null);

    const load = async () => {
        const res = await api.get<Page<EventRequestDto>>("/api/providers/me/requests", {
            params: { includeUntargetedOpenNearby: includeNearby, page: 0, size: 20 },
        });
        setData(res.data);
    };

    useEffect(() => { void load(); }, [includeNearby]);

    return (
        <View style={{ padding: 16, gap: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: "600" }}>Requests</Text>
            <Button
                title={`Include nearby open: ${includeNearby ? "Yes" : "No"}`}
                onPress={() => setIncludeNearby(v => !v)}
            />
            <FlatList
                data={data?.content ?? []}
                keyExtractor={(x) => String(x.id)}
                renderItem={({ item }) => {
                    const city = item.location?.municipalityName ?? "-";
                    const province = item.location?.provinceName ? ` / ${item.location?.provinceName}` : "";
                    const cuisineNames = (item.cuisines ?? []).map(c => c.name).filter(Boolean);
                    const serviceTags = (item.services ?? "")
                        .split(",")
                        .map(s => s.trim())
                        .filter(Boolean);
                    const tags = [...cuisineNames, ...serviceTags];

                    return (
                        <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10 }}>
                            <Text style={{ fontWeight: "600" }}>{item.title}</Text>
                            <Text>{city}{province}</Text>
                            <Text>
                                {fmt(item.startsAt)} → {fmt(item.endsAt)}
                            </Text>
                            <Text>{item.guests} guests · {item.status}</Text>
                            {tags.length > 0 && (
                                <Text style={{ color: "#6B7280", marginTop: 4 }}>
                                    {tags.join(" · ")}
                                </Text>
                            )}
                        </View>
                    );
                }}
            />
        </View>
    );
}
