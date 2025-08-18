import React, { useEffect, useMemo, useState } from "react";
import {
    View, Text, TextInput, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView,
    Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator, Alert
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import { createEventRequest } from "../../api/requests";
import {
    getCommunities,
    getProvinces,
    getMunicipalities,
    resolvePostal,
    GeoOption
} from "../../api/geo";

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

    // --- GEO options from backend ---
    const [communities, setCommunities] = useState<GeoOption[]>([]);
    const [provinces, setProvinces] = useState<GeoOption[]>([]);
    const [municipalities, setMunicipalities] = useState<GeoOption[]>([]);

    // Selected codes
    const [communityCode, setCommunityCode] = useState<string>("");
    const [provinceCode, setProvinceCode] = useState<string>("");
    const [municipalityCode, setMunicipalityCode] = useState<string>("");

    // Optional search for municipalities (typeahead)
    const [municipalitySearch, setMunicipalitySearch] = useState<string>("");

    // When auto-resolving from postal, we may need to defer selecting municipality
    const [pendingMunicipalityCode, setPendingMunicipalityCode] = useState<string | null>(null);

    const [postalCode, setPostalCode] = useState<string>("");
    const [locality, setLocality] = useState<string>("");

    const [guests, setGuests] = useState<string>("8");
    const [cuisines, setCuisines] = useState("italian,pasta");
    const [services, setServices] = useState("waiters");
    const [budget, setBudget] = useState<string>("100"); // € (text)
    const [notes, setNotes] = useState("Family birthday dinner");

    const [startsAt, setStartsAt] = useState<Date>(() => {
        const d = new Date(); d.setHours(19, 0, 0, 0); return d;
    });
    const [endsAt, setEndsAt] = useState<Date>(() => {
        const d = new Date(); d.setHours(23, 0, 0, 0); return d;
    });

    const [pick, setPick] = useState<null | "start" | "end">(null);
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [loadingCommunities, setLoadingCommunities] = useState(false);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

    // Load communities at mount
    useEffect(() => {
        (async () => {
            try {
                setLoadingCommunities(true);
                const data = await getCommunities();
                setCommunities(data);
                // Default to Madrid if present (nice dev UX)
                const md = data.find(c => c.code === "ES-MD") ?? data[0];
                if (md) setCommunityCode(md.code);
            } catch (e: any) {
                console.warn("getCommunities failed:", e?.response?.status, e?.message);
                setErr(e?.response?.data?.message ?? e?.message ?? "Failed to load regions");
            } finally {
                setLoadingCommunities(false);
            }
        })();
    }, []);

    // Load provinces when community changes
    useEffect(() => {
        if (!communityCode) return;
        (async () => {
            try {
                setLoadingProvinces(true);
                const data = await getProvinces(communityCode);
                setProvinces(data);
                setProvinceCode(data[0]?.code ?? "");
            } catch (e: any) {
                console.warn("getProvinces failed:", e?.message);
                setErr("Failed to load provinces");
            } finally {
                setLoadingProvinces(false);
            }
        })();
    }, [communityCode]);

    // Load municipalities when province OR search changes (debounced)
    useEffect(() => {
        if (!provinceCode) {
            setMunicipalities([]);
            setMunicipalityCode("");
            return;
        }
        const h = setTimeout(async () => {
            try {
                setLoadingMunicipalities(true);
                const data = await getMunicipalities(provinceCode, municipalitySearch || undefined);
                setMunicipalities(data);

                if (pendingMunicipalityCode && data.some(m => m.code === pendingMunicipalityCode)) {
                    setMunicipalityCode(pendingMunicipalityCode);
                    setPendingMunicipalityCode(null);
                } else if (!municipalityCode && data[0]) {
                    setMunicipalityCode(data[0].code);
                }
            } catch (e: any) {
                console.warn("getMunicipalities failed:", e?.message);
                setErr("Failed to load cities");
            } finally {
                setLoadingMunicipalities(false);
            }
        }, 300); // debounce
        return () => clearTimeout(h);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provinceCode, municipalitySearch]);

    const selectedProvince = useMemo(
        () => provinces.find(p => p.code === provinceCode),
        [provinces, provinceCode]
    );

    const validPostal = useMemo(() => {
        const p = postalCode.trim();
        return p.length === 0 || /^\d{5}$/.test(p);
    }, [postalCode]);

    const valid = useMemo(() => {
        if (!title.trim()) return false;
        // Require province (and implicitly community). Municipality optional.
        if (!selectedProvince?.code) return false;
        if (!validPostal) return false;
        const g = Number(guests);
        if (!Number.isFinite(g) || g < 1) return false;
        if (startsAt >= endsAt) return false;
        return true;
    }, [title, selectedProvince?.code, validPostal, guests, startsAt, endsAt]);

    const fmt = (d: Date) =>
        d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

    const dateError = startsAt >= endsAt ? "End must be after start time" : null;
    const addHours = (d: Date, h: number) => new Date(d.getTime() + h * 60 * 60 * 1000);

    const onConfirmDate = (d: Date) => {
        if (pick === "start") {
            setStartsAt(d);
            if (d >= endsAt) setEndsAt(addHours(d, 2));
        } else if (pick === "end") {
            setEndsAt(d);
        }
        setPick(null);
    };

    // Postal code → auto-select location hierarchy
    const onPostalChange = async (txt: string) => {
        setPostalCode(txt);
        if (/^\d{5}$/.test(txt)) {
            try {
                const r = await resolvePostal(txt);
                if (r.communityCode && r.communityCode !== communityCode) setCommunityCode(r.communityCode);
                if (r.provinceCode && r.provinceCode !== provinceCode) setProvinceCode(r.provinceCode);
                if (r.municipalityCode) {
                    setPendingMunicipalityCode(r.municipalityCode);
                    // if already present in list, set immediately
                    if (municipalities.some(m => m.code === r.municipalityCode)) {
                        setMunicipalityCode(r.municipalityCode);
                        setPendingMunicipalityCode(null);
                    }
                }
            } catch (e: any) {
                console.warn("resolvePostal failed:", e?.message);
                // keep user-entered postal; no hard error
            }
        } else {
            setPendingMunicipalityCode(null);
        }
    };

    const parseBudgetToCents = (txt: string): number | undefined => {
        const norm = txt.replace(",", ".").trim();
        if (!norm) return undefined;
        const n = Number(norm);
        return Number.isFinite(n) ? Math.round(n * 100) : undefined;
    };

    const submit = async () => {
        if (!valid || submitting) return;
        setErr(null); setSubmitting(true);
        try {
            const payload: any = {
                title: title.trim(),
                startsAt: startsAt.toISOString(),
                endsAt: endsAt.toISOString(),
                guests: Number(guests),
                geo: {
                    communityCode: communityCode || undefined,
                    provinceCode: provinceCode || undefined,
                    municipalityCode: municipalityCode || undefined,
                    locality: locality.trim() || undefined,
                    postalCode: postalCode.trim() || undefined,
                },
                cuisines: cuisines.trim() || undefined,
                services: services.trim() || undefined,
                currency: "EUR",
                budgetCents: parseBudgetToCents(budget),
                notes: notes.trim() || undefined,
            };

            await createEventRequest(payload);
            Alert.alert(
                "Request created",
                "Your event request was created successfully.",
                [
                    { text: "View details", onPress: () => navigation.replace("ConsumerDashboard") },
                    { text: "OK", style: "cancel" },
                ]
            );
        } catch (e: any) {
            console.warn("createEventRequest failed:", e?.response?.status, e?.message);
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

                            {/* GEO friendly dropdowns (Spain-only) */}
                            <Text style={[styles.label, { marginTop: 8 }]}>Región (Comunidad Autónoma)</Text>
                            <View style={styles.pickerWrap}>
                                {loadingCommunities ? (
                                    <View style={styles.pickerLoading}><ActivityIndicator /></View>
                                ) : (
                                    <Picker
                                        selectedValue={communityCode}
                                        onValueChange={(v: string) => setCommunityCode(v)}
                                    >
                                        {communities.map(c => (
                                            <Picker.Item key={c.code} label={c.name} value={c.code} />
                                        ))}
                                    </Picker>
                                )}
                            </View>

                            <Text style={styles.label}>Provincia</Text>
                            <View style={styles.pickerWrap}>
                                {loadingProvinces ? (
                                    <View style={styles.pickerLoading}><ActivityIndicator /></View>
                                ) : (
                                    <Picker
                                        selectedValue={provinceCode}
                                        onValueChange={(v: string) => setProvinceCode(v)}
                                    >
                                        {provinces.map(p => (
                                            <Picker.Item key={p.code} label={p.name} value={p.code} />
                                        ))}
                                    </Picker>
                                )}
                            </View>

                            <Text style={styles.label}>Ciudad (Municipio)</Text>
                            {/* Optional search (debounced) */}
                            <TextInput
                                placeholder="Search city (optional)"
                                value={municipalitySearch}
                                onChangeText={setMunicipalitySearch}
                                style={styles.input}
                            />
                            <View style={styles.pickerWrap}>
                                {loadingMunicipalities ? (
                                    <View style={styles.pickerLoading}><ActivityIndicator /></View>
                                ) : (
                                    <Picker
                                        selectedValue={municipalityCode}
                                        onValueChange={(v: string) => setMunicipalityCode(v)}
                                    >
                                        {municipalities.map(m => (
                                            <Picker.Item key={m.code} label={m.name} value={m.code} />
                                        ))}
                                    </Picker>
                                )}
                            </View>

                            <Text style={styles.label}>Código Postal (opcional)</Text>
                            <TextInput
                                placeholder="e.g., 28001"
                                value={postalCode}
                                onChangeText={onPostalChange}
                                style={[styles.input, !validPostal && { borderColor: COLORS.dangerText }]}
                                keyboardType="number-pad"
                                maxLength={5}
                            />
                            {!validPostal && <Text style={styles.errorInline}>Postal code must be 5 digits</Text>}

                            <Text style={styles.label}>Localidad / Barrio (opcional)</Text>
                            <TextInput
                                placeholder="e.g., Centro, Gòtic"
                                value={locality}
                                onChangeText={setLocality}
                                style={styles.input}
                            />

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

                            <Text style={[styles.label, { marginTop: 8 }]}>Notes (optional)</Text>
                            <TextInput
                                placeholder="Any extra details"
                                value={notes}
                                onChangeText={setNotes}
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
    pickerWrap: {
        borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
        backgroundColor: "#fff", marginBottom: 8,
    },
    pickerLoading: { paddingVertical: 12, alignItems: "center" },
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
