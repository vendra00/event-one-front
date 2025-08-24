import React, { memo, useMemo } from "react";
import { Modal, View, Text, Pressable, FlatList, ActivityIndicator, TextInput } from "react-native";
import type { GeoOption } from "@api/geo";
import { styles } from "../CreateEventRequestScreen.styles";
import { COLORS } from "@theme/colors";

export type ProvincePickerModalProps = {
    visible: boolean;
    onRequestClose: () => void;
    provinces: GeoOption[];
    provinceCode: string;
    onSelect: (code: string) => void;
    loading?: boolean;
    search: string;
    onChangeSearch: (v: string) => void;
};

function ProvincePickerModalInner({
                                      visible, onRequestClose, provinces, provinceCode, onSelect, loading,
                                      search, onChangeSearch,
                                  }: ProvincePickerModalProps) {
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return provinces;
        return provinces.filter(p =>
            p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
        );
    }, [provinces, search]);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onRequestClose}>
            <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Selecciona provincia</Text>
                        <Pressable onPress={onRequestClose} hitSlop={8}>
                            <Text style={styles.modalClose}>Cerrar</Text>
                        </Pressable>
                    </View>

                    <TextInput
                        value={search}
                        onChangeText={onChangeSearch}
                        placeholder="Buscar provincia..."
                        style={[styles.input, { marginBottom: 10 }]}
                        autoCapitalize="none"
                        autoCorrect={false}
                        clearButtonMode="while-editing"
                    />

                    {loading ? (
                        <View style={[styles.center, { paddingVertical: 24 }]}><ActivityIndicator /></View>
                    ) : (
                        <FlatList
                            data={filtered}
                            keyExtractor={(i) => i.code}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => { onSelect(item.code); onRequestClose(); }}
                                    style={({ pressed }) => [styles.modalRow, pressed && { opacity: 0.9 }]}
                                >
                                    <Text
                                        style={[
                                            styles.modalRowText,
                                            item.code === provinceCode && { color: COLORS.primary, fontWeight: "600" },
                                        ]}
                                    >
                                        {item.name}
                                    </Text>
                                </Pressable>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
                            contentContainerStyle={{ paddingBottom: 8 }}
                            ListEmptyComponent={
                                <View style={[styles.center, { paddingVertical: 16 }]}>
                                    <Text style={{ color: COLORS.subtext }}>No results</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const ProvincePickerModal = memo(ProvincePickerModalInner);
export default ProvincePickerModal;
