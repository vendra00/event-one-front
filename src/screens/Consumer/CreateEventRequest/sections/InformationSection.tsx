// ------------------------------------------------------------
// File: src/components/forms/CreateEventRequest/sections/InformationSection.tsx
// ------------------------------------------------------------
import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";

export type InformationSectionProps = {
    styles: any;
    title: string;
    guests: string;
    startsAtText: string;
    endsAtText: string;
    budget: string;
    dateError: string | null;
    onChangeTitle: (v: string) => void;
    onChangeGuests: (v: string) => void;
    onPickStart: () => void;
    onPickEnd: () => void;
    onChangeBudget: (v: string) => void;
};

const InformationSection = ({ styles, title, guests, startsAtText, endsAtText, budget, dateError, onChangeTitle, onChangeGuests, onPickStart, onPickEnd, onChangeBudget, }: InformationSectionProps) => {
    return (
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
    );
};

export default InformationSection;
