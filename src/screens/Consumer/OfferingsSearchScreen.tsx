import React, { useEffect, useState, useMemo } from "react";
import { View, TextInput, Button, FlatList, Text, Pressable, ActivityIndicator } from "react-native";
import { api } from "../../api/client";
import { OfferingDto, Page } from "../../types/dtos";
import { getCuisines, type CuisineOption } from "../../api/cuisines";

export default function OfferingsSearchScreen() {
    const [city, setCity] = useState("Madrid");
    const [guests, setGuests] = useState("8");
    const [data, setData] = useState<Page<OfferingDto> | null>(null);
    const [loading, setLoading] = useState(false);

    // cuisines
    const [cuisineOptions, setCuisineOptions] = useState<CuisineOption[]>([]);
    const [selectedCuisineCodes, setSelectedCuisineCodes] = useState<string[]>(["italian"]);
    const [loadingCuisines, setLoadingCuisines] = useState(false);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoadingCuisines(true);
                const list = await getCuisines();
                if (!alive) return;
                setCuisineOptions(list);
            } finally {
                if (alive) setLoadingCuisines(false);
            }
        })();
        return () => { alive = false; };
    }, []);

    const toggleCuisine = (code: string) => {
        setSelectedCuisineCodes(prev => prev.includes(code)
            ? prev.filter(c => c !== code)
            : [...prev, code]);
    };
    const clearCuisines = () => setSelectedCuisineCodes([]);

    const sortedCuisineOptions = useMemo(() => {
        const sel = new Set(selectedCuisineCodes);
        return [...cuisineOptions].sort((a, b) => {
            const aSel = sel.has(a.code) ? 0 : 1;
            const bSel = sel.has(b.code) ? 0 : 1;
            if (aSel !== bSel) return aSel - bSel;
            return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        });
    }, [cuisineOptions, selectedCuisineCodes]);

    const search = async () => {
        setLoading(true);
        try {
            const res = await api.get<Page<OfferingDto>>("/api/search/offerings", {
                params: {
                    city: city.trim() || undefined,
                    guests: Number(guests) || undefined,
                    // send list of cuisine codes (backend should accept ?cuisineCodes=it&cuisineCodes=tapas)
                    cuisineCodes: selectedCuisineCodes.length ? selectedCuisineCodes : undefined,
                    page: 0,
                    size: 20,
                },
            });
            setData(res.data);
        } finally { setLoading(false); }
    };

    return (
        <View style={{ padding: 16, gap: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: "600" }}>Find offerings</Text>

            <TextInput
                placeholder="City"
                value={city}
                onChangeText={setCity}
                style={{ borderWidth: 1, padding: 8, borderRadius: 8 }}
            />

            {/* Cuisine multi-select */}
            <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <Text style={{ color: "#6B7280", fontSize: 12 }}>Cuisines</Text>
                    <Pressable onPress={clearCuisines} disabled={selectedCuisineCodes.length === 0}>
                        <Text style={{ color: selectedCuisineCodes.length ? "#2563EB" : "#9CA3AF", fontWeight: "700" }}>Clear</Text>
                    </Pressable>
                </View>
                {loadingCuisines ? (
                    <View style={{ paddingVertical: 12, alignItems: "center" }}>
                        <ActivityIndicator />
                    </View>
                ) : (
                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                        {sortedCuisineOptions.map(opt => {
                            const selected = selectedCuisineCodes.includes(opt.code);
                            return (
                                <Pressable
                                    key={opt.code}
                                    onPress={() => toggleCuisine(opt.code)}
                                    style={[
                                        {
                                            paddingVertical: 6,
                                            paddingHorizontal: 10,
                                            borderRadius: 16,
                                            borderWidth: 1,
                                            borderColor: "#E5E7EB",
                                            backgroundColor: "#fff",
                                            marginRight: 8,
                                            marginBottom: 8,
                                        },
                                        selected && { borderColor: "#2563EB", backgroundColor: "#EEF2FF" },
                                    ]}
                                >
                                    <Text style={[{ color: "#111827", fontSize: 13 }, selected && { color: "#2563EB", fontWeight: "700" }]}>
                                        {opt.name}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                )}
            </View>

            <TextInput
                placeholder="Guests"
                value={guests}
                onChangeText={setGuests}
                keyboardType="numeric"
                style={{ borderWidth: 1, padding: 8, borderRadius: 8 }}
            />

            <Button title={loading ? "Searching..." : "Search"} onPress={search} />

            <FlatList
                data={data?.content ?? []}
                keyExtractor={(x) => String(x.id)}
                renderItem={({ item }) => {
                    const cuisineNames = (item.cuisines ?? []).map(c => c.name).filter(Boolean);
                    return (
                        <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 10 }}>
                            <Text style={{ fontWeight: "600" }}>{item.title}</Text>
                            {!!item.description && <Text style={{ color: "#374151", marginTop: 4 }}>{item.description}</Text>}
                            <Text style={{ color: "#374151", marginTop: 4 }}>{item.city} / {item.region}</Text>
                            <Text style={{ color: "#111827", marginTop: 4 }}>
                                {item.currency} {(item.basePriceCents / 100).toFixed(2)} · {item.minGuests}-{item.maxGuests} guests
                            </Text>
                            {cuisineNames.length > 0 && (
                                <Text style={{ color: "#6B7280", marginTop: 4 }}>
                                    {cuisineNames.join(" · ")}
                                </Text>
                            )}
                        </View>
                    );
                }}
            />
        </View>
    );
}
