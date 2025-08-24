import React, { memo } from "react";
import {
    Modal, View, Text, TouchableWithoutFeedback, Keyboard, TextInput,
    ActivityIndicator, FlatList, TouchableOpacity,
} from "react-native";
import { styles } from "../CreateEventRequestScreen.styles";
import { COLORS } from "@theme/colors";
import type { GeoOption } from "@api/geo";

export type CityPickerModalProps = {
    visible: boolean;
    onRequestClose: () => void;
    municipalities: GeoOption[];
    municipalityCode: string;
    search: string;
    onChangeSearch: (v: string) => void;
    onSelect: (code: string) => void;
    loading: boolean;
};

function CityPickerModalInner({
                                  visible, onRequestClose, municipalities,
                                  municipalityCode, search, onChangeSearch, onSelect, loading,
                              }: CityPickerModalProps) {
    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onRequestClose} transparent>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Select city</Text>

                        <TextInput
                            placeholder="Search city"
                            value={search}
                            onChangeText={onChangeSearch}
                            style={styles.input}
                            autoFocus
                        />

                        <View style={[styles.pickerWrap, { maxHeight: 300, paddingVertical: 8 }]}>
                            {loading ? (
                                <View style={styles.pickerLoading}><ActivityIndicator /></View>
                            ) : (
                                <FlatList
                                    data={municipalities}
                                    keyExtractor={(item) => item.code}
                                    keyboardShouldPersistTaps="handled"
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => { onSelect(item.code); onRequestClose(); }}
                                            style={styles.cityItem}
                                        >
                                            <Text style={{ color: COLORS.text }}>{item.name}</Text>
                                            {item.code === municipalityCode && (
                                                <Text style={{ color: COLORS.primary, fontWeight: "700" }}>✓</Text>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                        <Text style={{ textAlign: "center", color: COLORS.subtext, paddingVertical: 8 }}>
                                            {search ? "No matches" : "No cities"}
                                        </Text>
                                    }
                                />
                            )}
                        </View>

                        <TouchableOpacity onPress={onRequestClose} style={styles.modalCloseBtn}>
                            <Text style={styles.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const CityPickerModal = memo(CityPickerModalInner);
export default CityPickerModal;
