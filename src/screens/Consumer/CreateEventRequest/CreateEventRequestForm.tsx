import React, { memo, useMemo } from "react";
import {
    View, Text, TextInput, Pressable, ScrollView, ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./CreateEventRequestScreen.styles";
import { COLORS } from "../../../theme/colors";
import type { GeoOption } from "../../../api/geo";
import type { CuisineOption } from "../../../api/cuisines";
import { AccordionSection } from "./AccordionSection";

type Props = {
    // values
    err: string | null;
    title: string;
    communities: GeoOption[];
    provinces: GeoOption[];
    municipalities: GeoOption[];
    communityCode: string;
    provinceCode: string;
    municipalityCode: string;
    selectedProvinceName?: string;
    selectedMunicipalityName?: string;
    postalCode: string;
    locality: string;
    guests: string;

    // cuisines
    cuisineOptions: CuisineOption[];
    selectedCuisineCodes: string[];

    services: string;
    budget: string;
    notes: string;
    startsAtText: string;
    endsAtText: string;
    validPostal: boolean;
    dateError: string | null;
    submitting: boolean;
    valid: boolean;

    // loading flags
    loadingCommunities: boolean;
    loadingProvinces: boolean;
    loadingMunicipalities: boolean;
    loadingCuisines: boolean;

    // handlers
    onChangeTitle: (v: string) => void;
    onChangeCommunity: (code: string) => void;
    onChangeProvince: (code: string) => void;
    onOpenProvinceModal: () => void;
    onOpenCityModal: () => void;
    onChangePostal: (v: string) => void;
    onChangeLocality: (v: string) => void;
    onChangeGuests: (v: string) => void;
    onPickStart: () => void;
    onPickEnd: () => void;

    // cuisine handlers
    onToggleCuisine: (code: string) => void;
    onClearCuisines: () => void;

    onChangeServices: (v: string) => void;
    onChangeBudget: (v: string) => void;
    onChangeNotes: (v: string) => void;
    onSubmit: () => void;
};

const MAX_CUISINES = 20;

export const CreateEventRequestForm = memo((props: Props) => {
    const {
        err, title, communities,
        communityCode, selectedProvinceName, selectedMunicipalityName,
        postalCode, locality, guests,
        cuisineOptions = [], selectedCuisineCodes = [],
        services, budget, notes,
        startsAtText, endsAtText, validPostal, dateError, submitting, valid,
        loadingCommunities, loadingProvinces, loadingCuisines,
        onChangeTitle, onChangeCommunity,
        onOpenProvinceModal, onOpenCityModal,
        onChangePostal, onChangeLocality, onChangeGuests, onPickStart, onPickEnd,
        onToggleCuisine, onClearCuisines,
        onChangeServices, onChangeBudget, onChangeNotes, onSubmit,
    } = props;

    const selectedSet = useMemo(() => new Set(selectedCuisineCodes), [selectedCuisineCodes]);
    const reachedLimit = selectedSet.size >= MAX_CUISINES;

    // Selected first, then alphabetical by name
    const sortedCuisineOptions = useMemo(() => {
        return [...cuisineOptions].sort((a, b) => {
            const aSel = selectedSet.has(a.code) ? 0 : 1;
            const bSel = selectedSet.has(b.code) ? 0 : 1;
            if (aSel !== bSel) return aSel - bSel;
            return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        });
    }, [cuisineOptions, selectedSet]);

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
            <Text style={styles.header}>Create event request</Text>

            {!!err && (
                <View style={[styles.errorBox, { marginBottom: 12 }]}>
                    <Text style={styles.errorText}>{err}</Text>
                </View>
            )}

            {/* Information */}
            <AccordionSection title="Information">
                <View style={styles.card}>
                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        placeholder="e.g., Family birthday dinner"
                        value={title}
                        onChangeText={onChangeTitle}
                        style={styles.input}
                    />

                    <Text style={[styles.label, styles.mt8]}>Guests</Text>
                    <TextInput
                        placeholder="Number of guests"
                        keyboardType="number-pad"
                        value={guests}
                        onChangeText={onChangeGuests}
                        style={styles.input}
                    />

                    <Text style={[styles.label, styles.mt8]}>Date & time</Text>
                    <View style={styles.row}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Pick start date and time"
                            onPress={onPickStart}
                            style={({ pressed }) => [styles.dateBtn, pressed && { opacity: 0.95 }]}
                        >
                            <Text style={styles.dateBtnText}>Starts: {startsAtText}</Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Pick end date and time"
                            onPress={onPickEnd}
                            style={({ pressed }) => [styles.dateBtn, pressed && { opacity: 0.95 }]}
                        >
                            <Text style={styles.dateBtnText}>Ends: {endsAtText}</Text>
                        </Pressable>
                    </View>
                    {dateError && <Text style={styles.errorInline}>{dateError}</Text>}

                    <Text style={[styles.label, styles.mt8]}>Budget (€)</Text>
                    <TextInput
                        value={budget}
                        onChangeText={onChangeBudget}
                        placeholder="e.g., 400"
                        keyboardType="decimal-pad"
                        style={styles.input}
                    />
                </View>
            </AccordionSection>

            {/* Services */}
            <AccordionSection title="Services">
                <View style={styles.card}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={[styles.label, { marginTop: 0 }]}>
                            Cuisines ({selectedSet.size}/{MAX_CUISINES})
                        </Text>
                        <Pressable
                            onPress={onClearCuisines}
                            accessibilityRole="button"
                            accessibilityLabel="Clear selected cuisines"
                            disabled={selectedSet.size === 0}
                        >
                            <Text style={{ color: selectedSet.size ? COLORS.primary : COLORS.subtext, fontWeight: "700" }}>
                                Clear
                            </Text>
                        </Pressable>
                    </View>

                    {loadingCuisines ? (
                        <View style={[styles.input, styles.center]}><ActivityIndicator /></View>
                    ) : sortedCuisineOptions.length === 0 ? (
                        <View style={[styles.input, styles.center]}>
                            <Text style={{ color: COLORS.subtext }}>No cuisines available</Text>
                        </View>
                    ) : (
                        <View style={styles.chipRow}>
                            {sortedCuisineOptions.map(opt => {
                                const selected = selectedSet.has(opt.code);
                                const disabled = !selected && reachedLimit; // can't add more
                                return (
                                    <Pressable
                                        key={opt.code}
                                        onPress={() => !disabled && onToggleCuisine(opt.code)}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected, disabled }}
                                        accessibilityLabel={`Cuisine: ${opt.name}${selected ? ", selected" : ""}`}
                                        style={[
                                            styles.chip,
                                            selected && styles.chipSelected,
                                            disabled && { opacity: 0.5 },
                                        ]}
                                    >
                                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                                            {opt.name}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}

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
            </AccordionSection>

            {/* Address */}
            <AccordionSection title="Address">
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
            </AccordionSection>

            {/* Submit */}
            <Pressable
                onPress={onSubmit}
                disabled={!valid || submitting}
                style={({ pressed }) => [
                    styles.primaryBtn,
                    (!valid || submitting) && { opacity: 0.6 },
                    pressed && { opacity: 0.9 },
                ]}
            >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Create request</Text>}
            </Pressable>
        </ScrollView>
    );
});
