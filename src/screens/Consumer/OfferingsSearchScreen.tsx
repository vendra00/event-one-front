import React, { useState } from "react";
import { View, TextInput, Button, FlatList, Text } from "react-native";
import { api } from "../../api/client";
import { OfferingDto, Page } from "../../types/dtos";

export default function OfferingsSearchScreen() {
    const [city, setCity] = useState("Madrid");
    const [cuisine, setCuisine] = useState("italian");
    const [guests, setGuests] = useState("8");
    const [data, setData] = useState<Page<OfferingDto> | null>(null);
    const [loading, setLoading] = useState(false);

    const search = async () => {
        setLoading(true);
        try {
            const res = await api.get<Page<OfferingDto>>("/api/search/offerings", {
                params: { city, cuisine, guests: Number(guests) || undefined, page: 0, size: 20 },
            });
            setData(res.data);
        } finally { setLoading(false); }
    };

    return (
        <View style={{ padding: 16, gap: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: "600" }}>Find offerings</Text>
            <TextInput placeholder="City" value={city} onChangeText={setCity} style={{ borderWidth:1, padding:8, borderRadius:8 }} />
            <TextInput placeholder="Cuisine" value={cuisine} onChangeText={setCuisine} style={{ borderWidth:1, padding:8, borderRadius:8 }} />
            <TextInput placeholder="Guests" value={guests} onChangeText={setGuests} keyboardType="numeric"
                       style={{ borderWidth:1, padding:8, borderRadius:8 }} />
            <Button title={loading ? "Searching..." : "Search"} onPress={search} />
            <FlatList
                data={data?.content ?? []}
                keyExtractor={(x) => String(x.id)}
                renderItem={({ item }) => (
                    <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10 }}>
                        <Text style={{ fontWeight: "600" }}>{item.title}</Text>
                        <Text>{item.description}</Text>
                        <Text>{item.city} / {item.region}</Text>
                        <Text>{item.currency} {(item.basePriceCents/100).toFixed(2)} · {item.minGuests}-{item.maxGuests} guests</Text>
                    </View>
                )}
            />
        </View>
    );
}
