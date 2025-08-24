// ------------------------------------------------------------
// File: src/components/forms/CreateEventRequest/sections/CuisinesSection.tsx
// (search-to-reveal implementation)
// ------------------------------------------------------------
import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { COLORS } from "../../../../theme/colors";
import type { CuisineOption } from "../../../../api/cuisines";

export type CuisinesSectionProps = {
    styles: any;
    cuisineOptions: CuisineOption[];
    selectedCuisineCodes: string[];
    loadingCuisines: boolean;
    onToggleCuisine: (code: string) => void;
    onClearCuisines: () => void;
    max?: number; // default 20
};

const CuisinesSection = ({ styles, cuisineOptions = [], selectedCuisineCodes = [], loadingCuisines, onToggleCuisine, onClearCuisines, max = 20, }: CuisinesSectionProps) => {
    const selectedSet = useMemo(() => new Set(selectedCuisineCodes), [selectedCuisineCodes]);
    const reachedLimit = selectedSet.size >= max;

    const sortedCuisineOptions = useMemo(() => {
        return [...cuisineOptions].sort((a, b) => {
            const aSel = selectedSet.has(a.code) ? 0 : 1;
            const bSel = selectedSet.has(b.code) ? 0 : 1;
            if (aSel !== bSel) return aSel - bSel;
            return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        });
    }, [cuisineOptions, selectedSet]);

    // search-to-reveal
    const [q, setQ] = useState("");
    const norm = (s: string) => s.toLocaleLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    const filtered = useMemo(() => {
        const n = norm(q.trim());
        if (!n) return [];
        return sortedCuisineOptions.filter(o => norm(o.name).includes(n));
    }, [q, sortedCuisineOptions]);

    const selectedOnly = useMemo(() => {
        if (selectedSet.size === 0) return [];
        const codes = new Set(selectedSet);
        return sortedCuisineOptions.filter(o => codes.has(o.code));
    }, [selectedSet, sortedCuisineOptions]);

    const showingSearch = q.trim().length > 0;

    return (
        <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={[styles.label, { marginTop: 0 }]}>Cuisines ({selectedSet.size}/{max})</Text>
                <Pressable
                    onPress={onClearCuisines}
                    accessibilityRole="button"
                    accessibilityLabel="Clear selected cuisines"
                    disabled={selectedSet.size === 0}
                >
                    <Text style={{ color: selectedSet.size ? COLORS.primary : COLORS.subtext, fontWeight: "700" }}>Clear</Text>
                </Pressable>
            </View>

            {/* search input */}
            <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search cuisines (e.g., pasta)"
                style={[styles.input, { marginTop: 8 } ]}
                autoCapitalize="none"
                autoCorrect={false}
            />

            {loadingCuisines ? (
                <View style={[styles.input, styles.center]}><ActivityIndicator /></View>
            ) : cuisineOptions.length === 0 ? (
                <View style={[styles.input, styles.center]}>
                    <Text style={{ color: COLORS.subtext }}>No cuisines available</Text>
                </View>
            ) : showingSearch ? (
                filtered.length === 0 ? (
                    <View style={[styles.input, styles.center]}>
                        <Text style={{ color: COLORS.subtext }}>No matches</Text>
                    </View>
                ) : (
                    <View style={styles.chipRow}>
                        {filtered.map(opt => {
                            const selected = selectedSet.has(opt.code);
                            const disabled = !selected && reachedLimit;
                            return (
                                <Pressable
                                    key={opt.code}
                                    onPress={() => !disabled && onToggleCuisine(opt.code)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected, disabled }}
                                    accessibilityLabel={`Cuisine: ${opt.name}${selected ? ", selected" : ""}`}
                                    style={[styles.chip, selected && styles.chipSelected, disabled && { opacity: 0.5 }]}
                                >
                                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{opt.name}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                )
            ) : selectedOnly.length === 0 ? (
                <View style={[styles.input, styles.center]}>
                    <Text style={{ color: COLORS.subtext }}>No cuisines selected</Text>
                </View>
            ) : (
                <View style={styles.chipRow}>
                    {selectedOnly.map(opt => (
                        <Pressable
                            key={opt.code}
                            onPress={() => onToggleCuisine(opt.code)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: true }}
                            accessibilityLabel={`Cuisine: ${opt.name}, selected`}
                            style={[styles.chip, styles.chipSelected]}
                        >
                            <Text style={[styles.chipText, styles.chipTextSelected]}>{opt.name}</Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
};

export default CuisinesSection;
