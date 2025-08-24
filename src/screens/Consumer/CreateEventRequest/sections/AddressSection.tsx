// ------------------------------------------------------------
// File: src/components/forms/CreateEventRequest/sections/AddressSection.tsx
// ------------------------------------------------------------
import React from "react";
import { View, Text, ActivityIndicator, Pressable, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { COLORS } from "../../../../theme/colors";
import type { GeoOption } from "../../../../api/geo";

export type AddressSectionProps = {
    styles: any;
    communities: GeoOption[];
    communityCode: string;
    loadingCommunities: boolean;
    loadingProvinces: boolean;
    selectedProvinceName?: string;
    selectedMunicipalityName?: string;
    postalCode: string;
    locality: string;
    validPostal: boolean;
    onChangeCommunity: (code: string) => void;
    onOpenProvinceModal: () => void;
    onOpenCityModal: () => void;
    onChangePostal: (v: string) => void;
    onChangeLocality: (v: string) => void;
};

const AddressSection = ({ styles, communities, communityCode, loadingCommunities, loadingProvinces, selectedProvinceName, selectedMunicipalityName, postalCode, locality, validPostal, onChangeCommunity, onOpenProvinceModal, onOpenCityModal, onChangePostal, onChangeLocality, }: AddressSectionProps) => {
    return (
        <View style={styles.card}>
            {/* Región (Comunidad Autónoma) */}
            <Text style={[styles.label, { marginTop: 0 }]}>Región (Comunidad Autónoma)</Text>
            <View style={styles.pickerWrap}>
                {loadingCommunities ? (
                    <View style={styles.pickerLoading}><ActivityIndicator /></View>
                ) : (
                    <Picker selectedValue={communityCode} onValueChange={onChangeCommunity}>
                        {communities.map(c => (
                            <Picker.Item key={c.code} label={c.name} value={c.code} />
                        ))}
                    </Picker>
                )}
            </View>

            {/* Provincia (modal) */}
            <Text style={styles.label}>Provincia</Text>
            {loadingProvinces ? (
                <View style={[styles.input, { justifyContent: "center", alignItems: "center" }]}>
                    <ActivityIndicator />
                </View>
            ) : (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Choose province"
                    onPress={onOpenProvinceModal}
                    style={styles.input}
                >
                    <Text style={{ color: selectedProvinceName ? COLORS.text : COLORS.subtext }}>
                        {selectedProvinceName ?? "Select province"}
                    </Text>
                </Pressable>
            )}

            {/* Ciudad */}
            <Text style={styles.label}>Ciudad (Municipio)</Text>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choose city"
                onPress={onOpenCityModal}
                style={styles.input}
            >
                <Text style={{ color: selectedMunicipalityName ? COLORS.text : COLORS.subtext }}>
                    {selectedMunicipalityName ?? "Select city"}
                </Text>
            </Pressable>

            {/* Código Postal */}
            <Text style={styles.label}>Código Postal (opcional)</Text>
            <TextInput
                placeholder="e.g., 28001"
                value={postalCode}
                onChangeText={onChangePostal}
                style={[styles.input, !validPostal && { borderColor: COLORS.dangerText }]}
                keyboardType="number-pad"
                maxLength={5}
                autoComplete="postal-code"
                textContentType="postalCode"
            />
            {!validPostal && <Text style={styles.errorInline}>Postal code must be 5 digits</Text>}

            {/* Localidad */}
            <Text style={styles.label}>Localidad / Barrio (opcional)</Text>
            <TextInput
                placeholder="e.g., Centro, Gòtic"
                value={locality}
                onChangeText={onChangeLocality}
                style={styles.input}
            />
        </View>
    );
};

export default AddressSection;