// ------------------------------------------------------------
// File: src/components/forms/CreateEventRequest/sections/ServicesSection.tsx
// ------------------------------------------------------------
import React from "react";
import { View, Text, TextInput } from "react-native";
import type { CuisineOption } from "../../../../api/cuisines";
import CuisinesSection from "./CuisinesSection";

export type ServicesSectionProps = {
    styles: any;
    cuisineOptions: CuisineOption[];
    selectedCuisineCodes: string[];
    loadingCuisines: boolean;
    onToggleCuisine: (code: string) => void;
    onClearCuisines: () => void;
    services: string;
    notes: string;
    onChangeServices: (v: string) => void;
    onChangeNotes: (v: string) => void;
};

const ServicesSection = ({ styles, cuisineOptions, selectedCuisineCodes, loadingCuisines, onToggleCuisine, onClearCuisines, services, notes, onChangeServices, onChangeNotes, }: ServicesSectionProps) => {
    return (
        <View style={styles.card}>
            <CuisinesSection
                styles={styles}
                cuisineOptions={cuisineOptions}
                selectedCuisineCodes={selectedCuisineCodes}
                loadingCuisines={loadingCuisines}
                onToggleCuisine={onToggleCuisine}
                onClearCuisines={onClearCuisines}
            />

            <Text style={[styles.label, styles.mt8]}>Services (tags)</Text>
            <TextInput
                value={services}
                onChangeText={onChangeServices}
                placeholder="e.g., waiters,bar"
                style={styles.input}
                autoCapitalize="none"
            />

            <Text style={[styles.label, { marginTop: 8 }]}>Notes (optional)</Text>
            <TextInput
                value={notes}
                onChangeText={onChangeNotes}
                placeholder="Any extra details"
                style={[styles.input, styles.textarea]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                autoCapitalize="sentences"
            />
        </View>
    );
};

export default ServicesSection;
