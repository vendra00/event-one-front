import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import CreateEventRequestForm from "./form/CreateEventRequestForm";
import { CityPickerModal, ProvincePickerModal } from "@/screens/Consumer/CreateEventRequest/modals";
import { createEventRequest } from "@api/requests";
import { getCommunities, getProvinces, getMunicipalities, resolvePostal, GeoOption } from "@api/geo";
import { getCuisines, type CuisineOption } from "@api/cuisines";
import { styles } from "./CreateEventRequestScreen.styles";

export default function CreateEventRequestScreen({ navigation }: any) {
    const [title, setTitle] = useState("");

    // GEO
    const [communities, setCommunities] = useState<GeoOption[]>([]);
    const [provinces, setProvinces] = useState<GeoOption[]>([]);
    const [municipalities, setMunicipalities] = useState<GeoOption[]>([]);
    const [communityCode, setCommunityCode] = useState<string>("");
    const [provinceCode, setProvinceCode] = useState<string>("");
    const [municipalityCode, setMunicipalityCode] = useState<string>("");

    const [provinceModalOpen, setProvinceModalOpen] = useState(false);
    const [provinceSearch, setProvinceSearch] = useState("");
    const [cityModalOpen, setCityModalOpen] = useState(false);
    const [municipalitySearch, setMunicipalitySearch] = useState<string>("");

    const [pendingMunicipalityCode, setPendingMunicipalityCode] = useState<string | null>(null);

    const [postalCode, setPostalCode] = useState<string>("");
    const [locality, setLocality] = useState<string>("");

    const [guests, setGuests] = useState<string>("8");

    // NEW cuisines
    const [cuisineOptions, setCuisineOptions] = useState<CuisineOption[]>([]);
    const [selectedCuisineCodes, setSelectedCuisineCodes] = useState<string[]>(["italian", "pasta"]);
    const [loadingCuisines, setLoadingCuisines] = useState(false);

    const [services, setServices] = useState("waiters");
    const [budget, setBudget] = useState<string>("100");
    const [notes, setNotes] = useState("Family birthday dinner");

    const [startsAt, setStartsAt] = useState<Date>(() => { const d = new Date(); d.setHours(19, 0, 0, 0); return d; });
    const [endsAt, setEndsAt] = useState<Date>(() => { const d = new Date(); d.setHours(23, 0, 0, 0); return d; });

    const [pick, setPick] = useState<null | "start" | "end">(null);
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [loadingCommunities, setLoadingCommunities] = useState(false);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

    // Load cuisines at mount
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoadingCuisines(true);
                const data = await getCuisines();
                if (!alive) return;
                setCuisineOptions(data);
            } catch (e: any) {
                if (!alive) return;
                console.warn("getCuisines failed:", e?.message);
                setErr("Failed to load cuisines");
            } finally {
                if (alive) setLoadingCuisines(false);
            }
        })();
        return () => { alive = false; };
    }, []);

    // Load communities at mount
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoadingCommunities(true);
                const data = await getCommunities();
                if (!alive) return;
                setCommunities(data);
                const md = data.find(c => c.code === "ES-MD") ?? data[0];
                if (md) setCommunityCode(md.code);
            } catch (e: any) {
                if (!alive) return;
                setErr(e?.response?.data?.message ?? e?.message ?? "Failed to load regions");
            } finally {
                if (alive) setLoadingCommunities(false);
            }
        })();
        return () => { alive = false; };
    }, []);

    // Provinces
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

    // Municipalities (debounced)
    useEffect(() => {
        if (!provinceCode) {
            setMunicipalities([]); setMunicipalityCode(""); return;
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
        }, 300);
        return () => clearTimeout(h);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provinceCode, municipalitySearch]);

    const selectedProvince = useMemo(
        () => provinces.find(p => p.code === provinceCode),
        [provinces, provinceCode]
    );
    const selectedProvinceName = selectedProvince?.name;

    const validPostal = useMemo(() => {
        const p = postalCode.trim();
        return p.length === 0 || /^\d{5}$/.test(p);
    }, [postalCode]);

    const valid = useMemo(() => {
        if (!title.trim()) return false;
        if (!selectedProvince?.code) return false;
        if (!validPostal) return false;
        const g = Number(guests);
        if (!Number.isFinite(g) || g < 1) return false;
        return startsAt < endsAt;
    }, [title, selectedProvince?.code, validPostal, guests, startsAt, endsAt]);

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

    const onPostalChange = async (txt: string) => {
        setPostalCode(txt);
        if (/^\d{5}$/.test(txt)) {
            try {
                const r = await resolvePostal(txt);
                if (r.communityCode && r.communityCode !== communityCode) setCommunityCode(r.communityCode);
                if (r.provinceCode && r.provinceCode !== provinceCode) setProvinceCode(r.provinceCode);
                if (r.municipalityCode) {
                    setPendingMunicipalityCode(r.municipalityCode);
                    if (municipalities.some(m => m.code === r.municipalityCode)) {
                        setMunicipalityCode(r.municipalityCode);
                        setPendingMunicipalityCode(null);
                    }
                }
            } catch (e: any) {
                console.warn("resolvePostal failed:", e?.message);
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

    const selectedMunicipalityName =
        useMemo(() => municipalities.find(m => m.code === municipalityCode)?.name, [municipalities, municipalityCode]);

    const startsAtText =
        useMemo(() => startsAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }), [startsAt]);
    const endsAtText =
        useMemo(() => endsAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }), [endsAt]);

    const dateError = startsAt >= endsAt ? "End must be after start time" : null;

    const openProvinceModal = useCallback(() => setProvinceModalOpen(true), []);
    const closeProvinceModal = useCallback(() => { setProvinceModalOpen(false); }, []);
    const openCityModal = useCallback(() => setCityModalOpen(true), []);
    const closeCityModal = useCallback(() => setCityModalOpen(false), []);
    const onPickStart = useCallback(() => setPick("start"), []);
    const onPickEnd = useCallback(() => setPick("end"), []);

    const toggleCuisine = (code: string) => {
        setSelectedCuisineCodes(prev => prev.includes(code)
            ? prev.filter(c => c !== code)
            : [...prev, code]);
    };
    const clearCuisines = () => setSelectedCuisineCodes([]);

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
                cuisineCodes: selectedCuisineCodes.length ? selectedCuisineCodes : undefined, // <-- NEW
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
                    <CreateEventRequestForm
                        err={err}
                        title={title}
                        communities={communities}
                        provinces={provinces}
                        municipalities={municipalities}
                        communityCode={communityCode}
                        provinceCode={provinceCode}
                        municipalityCode={municipalityCode}
                        selectedMunicipalityName={selectedMunicipalityName}
                        selectedProvinceName={selectedProvinceName}
                        onOpenProvinceModal={openProvinceModal}
                        postalCode={postalCode}
                        locality={locality}
                        guests={guests}

                        cuisineOptions={cuisineOptions}
                        selectedCuisineCodes={selectedCuisineCodes}

                        services={services}
                        budget={budget}
                        notes={notes}
                        startsAtText={startsAtText}
                        endsAtText={endsAtText}
                        validPostal={validPostal}
                        dateError={dateError}
                        submitting={submitting}
                        valid={valid}
                        loadingCommunities={loadingCommunities}
                        loadingProvinces={loadingProvinces}
                        loadingMunicipalities={loadingMunicipalities}
                        loadingCuisines={loadingCuisines}
                        onChangeTitle={setTitle}
                        onChangeCommunity={setCommunityCode}
                        onChangeProvince={setProvinceCode}
                        onOpenCityModal={openCityModal}
                        onChangePostal={onPostalChange}
                        onChangeLocality={setLocality}
                        onChangeGuests={setGuests}
                        onPickStart={onPickStart}
                        onPickEnd={onPickEnd}

                        onToggleCuisine={toggleCuisine}
                        onClearCuisines={clearCuisines}

                        onChangeServices={setServices}
                        onChangeBudget={setBudget}
                        onChangeNotes={setNotes}
                        onSubmit={submit}
                    />

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

            <ProvincePickerModal
                visible={provinceModalOpen}
                onRequestClose={closeProvinceModal}
                provinces={provinces}
                provinceCode={provinceCode}
                onSelect={setProvinceCode}
                loading={loadingProvinces}
                search={provinceSearch}
                onChangeSearch={setProvinceSearch}
            />

            <CityPickerModal
                visible={cityModalOpen}
                onRequestClose={closeCityModal}
                municipalities={municipalities}
                municipalityCode={municipalityCode}
                search={municipalitySearch}
                onChangeSearch={setMunicipalitySearch}
                onSelect={setMunicipalityCode}
                loading={loadingMunicipalities}
            />
        </KeyboardAvoidingView>
    );
}
