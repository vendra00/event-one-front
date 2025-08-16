import React, { useEffect, useState } from "react";
import { View, Button, FlatList, Text } from "react-native";
import { api } from "../../api/client";
import { EventRequestDto, Page } from "../../types/dtos";

export default function RequestsScreen() {
    const [includeNearby, setIncludeNearby] = useState(true);
    const [data, setData] = useState<Page<EventRequestDto> | null>(null);

    const load = async () => {
        const res = await api.get<Page<EventRequestDto>>("/api/providers/me/requests", {
            params: { includeUntargetedOpenNearby: includeNearby, page: 0, size: 20 },
        });
        setData(res.data);
    };

    useEffect(() => { load(); }, [includeNearby]);

    return (
        <View style={{ padding: 16, gap: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: "600" }}>Requests</Text>
            <Button title={`Include nearby open: ${includeNearby ? "Yes" : "No"}`}
                    onPress={() => setIncludeNearby(v => !v)} />
            <FlatList
                data={data?.content ?? []}
                keyExtractor={(x) => String(x.id)}
                renderItem={({ item }) => (
                    <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10 }}>
                        <Text style={{ fontWeight: "600" }}>{item.title}</Text>
                        <Text>{item.city} / {item.region}</Text>
                        <Text>{new Date(item.startsAt).toLocaleString()} → {new Date(item.endsAt).toLocaleString()}</Text>
                        <Text>{item.guests} guests · {item.status}</Text>
                    </View>
                )}
            />
        </View>
    );
}
