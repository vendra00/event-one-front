import React, { memo } from "react";
import {
    View, Text, TextInput, Pressable, ScrollView, ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./CreateEventRequestScreen.styles";
import { COLORS } from "../../../theme/colors";
import type { GeoOption } from "../../../api/geo";
import { AccordionSection } from "./AccordionSection";

type Props = {
    // values
    err: string | null;
    title: string;
    communities: GeoOption[];
    provinces: GeoOption[]; // still received, though selection happens in modal
    municipalities: GeoOption[];
    communityCode: string;
    provinceCode: string;
    municipalityCode: string;
    selectedProvinceName?: string;          // NEW
    selectedMunicipalityName?: string;
    postalCode: string;
    locality: string;
    guests: string;
    cuisines: string;
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
    loadingProvinces: boolean;              // used to show spinner on Provincia field
    loadingMunicipalities: boolean;

    // handlers
    onChangeTitle: (v: string) => void;
    onChangeCommunity: (code: string) => void;
    onChangeProvince: (code: string) => void; // still in props for compatibility (set by modal)
    onOpenProvinceModal: () => void;           // NEW
    onOpenCityModal: () => void;
    onChangePostal: (v: string) => void;
    onChangeLocality: (v: string) => void;
    onChangeGuests: (v: string) => void;
    onPickStart: () => void;
    onPickEnd: () => void;
    onChangeCuisines: (v: string) => void;
    onChangeServices: (v: string) => void;
    onChangeBudget: (v: string) => void;
    onChangeNotes: (v: string) => void;
    onSubmit: () => void;
};

export const CreateEventRequestForm = memo((props: Props) => {
    const {
        err, title, communities, provinces, // provinces kept (not used directly in UI now)
        communityCode, selectedProvinceName, selectedMunicipalityName,
        postalCode, locality, guests, cuisines, services, budget, notes,
        startsAtText, endsAtText, validPostal, dateError, submitting, valid,
        loadingCommunities, loadingProvinces,
        onChangeTitle, onChangeCommunity, onChangeProvince, // eslint wants it present since in Props
        onOpenProvinceModal, onOpenCityModal,
        onChangePostal, onChangeLocality, onChangeGuests, onPickStart, onPickEnd,
        onChangeCuisines, onChangeServices, onChangeBudget, onChangeNotes, onSubmit,
    } = props;

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
                            onPress={onPickStart}
                            style={({ pressed }) => [styles.dateBtn, pressed && { opacity: 0.95 }]}>
                            <Text style={styles.dateBtnText}>Starts: {startsAtText}</Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole="button"
                            onPress={onPickEnd}
                            style={({ pressed }) => [styles.dateBtn, pressed && { opacity: 0.95 }]}>
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
                    <Text style={[styles.label, { marginTop: 0 }]}>Cuisines (tags)</Text>
                    <TextInput
                        value={cuisines}
                        onChangeText={onChangeCuisines}
                        placeholder="e.g., italian,pasta"
                        style={styles.input}
                    />

                    <Text style={styles.label}>Services (tags)</Text>
                    <TextInput
                        value={services}
                        onChangeText={onChangeServices}
                        placeholder="e.g., waiters,bar"
                        style={styles.input}
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
                                {communities.map(c => <Picker.Item key={c.code} label={c.name} value={c.code} />)}
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
                    <Pressable accessibilityRole="button" onPress={onOpenCityModal} style={styles.input}>
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
