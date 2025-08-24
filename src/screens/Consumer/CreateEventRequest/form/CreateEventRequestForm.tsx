// ------------------------------------------------------------
// File: src/components/forms/CreateEventRequest/CreateEventRequestForm.tsx
// ------------------------------------------------------------
import React, { memo } from "react";
import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { styles } from "../CreateEventRequestScreen.styles";
import { AccordionSection } from "../AccordionSection";
import type { GeoOption } from "../../../../api/geo";
import type { CuisineOption } from "../../../../api/cuisines";
import InformationSection from "../sections/InformationSection";
import ServicesSection from "../sections/ServicesSection";
import AddressSection from "../sections/AddressSection";

export type CreateEventRequestFormProps = {
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

const CreateEventRequestForm = memo((props: CreateEventRequestFormProps) => {
    const {
        err,
        // information
        title, guests, startsAtText, endsAtText, budget, dateError,
        onChangeTitle, onChangeGuests, onPickStart, onPickEnd, onChangeBudget,

        // services/cuisines
        cuisineOptions, selectedCuisineCodes, loadingCuisines,
        services, notes, onToggleCuisine, onClearCuisines, onChangeServices, onChangeNotes,

        // address
        communities, communityCode, selectedProvinceName, selectedMunicipalityName,
        postalCode, locality, validPostal, loadingCommunities, loadingProvinces,
        onChangeCommunity, onOpenProvinceModal, onOpenCityModal, onChangePostal, onChangeLocality,

        // submit
        submitting, valid, onSubmit,
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
                <InformationSection
                    styles={styles}
                    title={title}
                    guests={guests}
                    startsAtText={startsAtText}
                    endsAtText={endsAtText}
                    budget={budget}
                    dateError={dateError}
                    onChangeTitle={onChangeTitle}
                    onChangeGuests={onChangeGuests}
                    onPickStart={onPickStart}
                    onPickEnd={onPickEnd}
                    onChangeBudget={onChangeBudget}
                />
            </AccordionSection>

            {/* Services */}
            <AccordionSection title="Services">
                <ServicesSection
                    styles={styles}
                    cuisineOptions={cuisineOptions}
                    selectedCuisineCodes={selectedCuisineCodes}
                    loadingCuisines={loadingCuisines}
                    onToggleCuisine={onToggleCuisine}
                    onClearCuisines={onClearCuisines}
                    services={services}
                    notes={notes}
                    onChangeServices={onChangeServices}
                    onChangeNotes={onChangeNotes}
                />
            </AccordionSection>

            {/* Address */}
            <AccordionSection title="Address">
                <AddressSection
                    styles={styles}
                    communities={communities}
                    communityCode={communityCode}
                    loadingCommunities={loadingCommunities}
                    loadingProvinces={loadingProvinces}
                    selectedProvinceName={selectedProvinceName}
                    selectedMunicipalityName={selectedMunicipalityName}
                    postalCode={postalCode}
                    locality={locality}
                    validPostal={validPostal}
                    onChangeCommunity={onChangeCommunity}
                    onOpenProvinceModal={onOpenProvinceModal}
                    onOpenCityModal={onOpenCityModal}
                    onChangePostal={onChangePostal}
                    onChangeLocality={onChangeLocality}
                />
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

export default CreateEventRequestForm;