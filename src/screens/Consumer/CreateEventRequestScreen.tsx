import React, { useMemo, useState } from "react";
import {
    View, Text, TextInput, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView,
    Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator, Alert
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { createEventRequest } from "../../api/requests";

const COLORS = {
    bg: "#F6F7FB",
    card: "#FFFFFF",
    border: "#E5E7EB",
    text: "#111827",
    subtext: "#6B7280",
    primary: "#2563EB",
    dangerBg: "#FEE2E2",
    dangerText: "#B91C1C",
};

export default function CreateEventRequestScreen({ navigation }: any) {
    const [title, setTitle] = useState("");
    const [city, setCity] = useState("");
    const [region, setRegion] = useState("");
    const [guests, setGuests] = useState<string>("8");
    const [cuisines, setCuisines] = useState("italian,pasta");
    const [services, setServices] = useState("waiters");
    const [budget, setBudget] = useState<string>("100"); // € as text; we’ll convert to cents
    const [note, setNote] = useState("Family birthday dinner");


    const [startsAt, setStartsAt] = useState<Date>(() => {
        const d = new Date(); d.setHours(19, 0, 0, 0); return d;
    });
    const [endsAt, setEndsAt] = useState<Date>(() => {
        const d = new Date(); d.setHours(23, 0, 0, 0); return d;
    });

    const [pick, setPick] = useState<null | "start" | "end">(null);
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const valid = useMemo(() => {
        if (!city.trim()) return false;
        const g = Number(guests);
        if (!Number.isFinite(g) || g < 1) return false;
        if (startsAt >= endsAt) return false;
        return true;
    }, [city, guests, startsAt, endsAt]);

    const fmt = (d: Date) =>
        d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

    const dateError = startsAt >= endsAt ? "End must be after start time" : null;
    const addHours = (d: Date, h: number) => new Date(d.getTime() + h * 60 * 60 * 1000);

    const onConfirmDate = (d: Date) => {
        if (pick === "start") {
            setStartsAt(d);
            // if new start is >= end, bump end by 2h automatically
            if (d >= endsAt) setEndsAt(addHours(d, 2));
        } else if (pick === "end") {
            setEndsAt(d);
        }
        setPick(null);
    };

    const submit = async () => {
        if (!valid || submitting) return;
        setErr(null); setSubmitting(true);
        try {
            const payload = {
                title: title.trim() || undefined,
                city: city.trim(),
                region: region.trim() || undefined,
                guests: Number(guests),
                cuisines: cuisines.trim() || undefined,
                services: services.trim() || undefined,
                startsAt: startsAt.toISOString(),
                endsAt: endsAt.toISOString(),
                note: note.trim() || undefined,
                currency: "EUR",
                budgetCents: budget.trim() ? Math.round(Number(budget) * 100) : undefined,
            };
            const created = await createEventRequest(payload);
            Alert.alert("Request created", "Your event request was created successfully.", [
                { text: "View details", onPress: () => navigation.replace("ConsumerDashboard") },
                { text: "OK", style: "cancel" },
            ]);
        } catch (e: any) {
            setErr(e?.response?.data?.message ?? "Failed to create request");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.screen}>
                    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                        <Text style={styles.header}>Create event request</Text>

                        <View style={styles.card}>
                            {!!err && (
                                <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>{err}</Text>
                                </View>
                            )}

                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                placeholder="e.g., Family birthday dinner"
                                value={title} onChangeText={setTitle} style={styles.input}
                            />

                            <Text style={[styles.label, { marginTop: 8 }]}>City</Text>
                            <TextInput placeholder="City" value={city} onChangeText={setCity} style={styles.input} />

                            <Text style={styles.label}>Region</Text>
                            <TextInput placeholder="Region (optional)" value={region} onChangeText={setRegion} style={styles.input} />

                            <Text style={[styles.label, { marginTop: 8 }]}>Guests</Text>
                            <TextInput
                                placeholder="Number of guests"
                                keyboardType="number-pad"
                                value={guests}
                                onChangeText={setGuests}
                                style={styles.input}
                            />

                            <Text style={[styles.label, { marginTop: 8 }]}>Date & time</Text>
                            <View style={{ flexDirection: "row" }}>
                                <Pressable onPress={() => setPick("start")} style={({ pressed }) => [styles.dateBtn, pressed && { opacity: 0.95 }]}>
                                    <Text style={styles.dateBtnText}>Starts: {fmt(startsAt)}</Text>
                                </Pressable>
                                <Pressable onPress={() => setPick("end")} style={({ pressed }) => [styles.dateBtn, pressed && { opacity: 0.95 }]}>
                                    <Text style={styles.dateBtnText}>Ends: {fmt(endsAt)}</Text>
                                </Pressable>
                            </View>
                            {dateError && <Text style={styles.errorInline}>{dateError}</Text>}

                            <Text style={[styles.label, { marginTop: 8 }]}>Cuisines (tags)</Text>
                            <TextInput placeholder="e.g., italian,pasta" value={cuisines} onChangeText={setCuisines} style={styles.input} />

                            <Text style={styles.label}>Services (tags)</Text>
                            <TextInput placeholder="e.g., waiters,bar" value={services} onChangeText={setServices} style={styles.input} />

                            <Text style={[styles.label, { marginTop: 8 }]}>Budget (€)</Text>
                            <TextInput
                                placeholder="e.g., 400"
                                keyboardType="decimal-pad"
                                value={budget}
                                onChangeText={setBudget}
                                style={styles.input}
                            />

                            <Pressable
                                onPress={submit}
                                disabled={!valid || submitting}
                                style={({ pressed }) => [
                                    styles.primaryBtn,
                                    (!valid || submitting) && { opacity: 0.6 },
                                    pressed && { opacity: 0.9 },
                                ]}
                            >
                                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Create request</Text>}
                            </Pressable>
                        </View>
                    </ScrollView>

                    <DateTimePickerModal
                        isVisible={!!pick}
                        mode="datetime"
                        minimumDate={pick === "end" ? startsAt : undefined}
                        onConfirm={onConfirmDate}
                        onCancel={() => setPick(null)}
                        date={pick === "start" ? startsAt : endsAt}
                    />
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 20, paddingTop: 24 },
    header: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 12 },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    label: { color: COLORS.subtext, fontSize: 12, marginBottom: 4 },
    input: {
        borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff", marginBottom: 8,
    },
    dateBtn: {
        flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 12, backgroundColor: "#fff", marginRight: 8,
    },
    dateBtnText: { color: COLORS.text, fontWeight: "600" },
    primaryBtn: {
        marginTop: 14, backgroundColor: COLORS.primary, paddingVertical: 12,
        borderRadius: 12, alignItems: "center",
    },
    primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    errorBox: {
        backgroundColor: COLORS.dangerBg,
        padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#FCA5A5", marginBottom: 8,
    },
    errorText: { color: COLORS.dangerText },
    errorInline: { color: "#B91C1C", marginTop: 4, marginBottom: 4, fontSize: 12 },
});
