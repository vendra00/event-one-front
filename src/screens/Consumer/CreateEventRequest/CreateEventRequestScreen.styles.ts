// screens/Consumer/CreateEventRequest/CreateEventRequestScreen.styles.ts
import { StyleSheet } from "react-native";
import { COLORS } from "../../../theme/colors";

export const styles = StyleSheet.create({
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
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#fff",
        marginBottom: 8,
    },

    pickerWrap: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        backgroundColor: "#fff",
        marginBottom: 8,
    },

    pickerLoading: { paddingVertical: 12, alignItems: "center" },

    dateBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#fff",
        marginRight: 8,
    },

    dateBtnText: { color: COLORS.text, fontWeight: "600" },
    textarea: { minHeight: 90 },
    row: { flexDirection: "row" },
    mt8: { marginTop: 8 },

    primaryBtn: {
        marginTop: 14,
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },

    primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

    errorBox: {
        backgroundColor: COLORS.dangerBg,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#FCA5A5",
        marginBottom: 8,
    },

    errorText: { color: COLORS.dangerText },
    errorInline: { color: "#B91C1C", marginTop: 4, marginBottom: 4, fontSize: 12 },

    // Modal
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.25)",
        justifyContent: "flex-end",
    },
    modalCard: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
    },
    modalTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 8 },

    // (kept for other modals that use a button)
    modalCloseBtn: {
        marginTop: 8,
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    modalCloseText: { color: "#fff", fontWeight: "700" },

    // City item (existing usage)
    cityItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    // Accordion styles
    accordionSection: { marginBottom: 12 },
    accordionHeader: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    accordionTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text },
    accordionHeaderRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    accordionChevron: { fontSize: 16, color: COLORS.subtext },
    accordionBody: {
        marginTop: 8,
        backgroundColor: COLORS.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
    },

    // ===== Added to support ProvincePickerModal =====
    center: { alignItems: "center", justifyContent: "center" },

    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    modalClose: {
        color: COLORS.primary,
        fontWeight: "700",
    },

    modalRow: {
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    modalRowText: {
        color: COLORS.text,
        fontSize: 14,
    },
    modalSeparator: {
        height: 1,
        backgroundColor: COLORS.border,
        marginLeft: 12,
    },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 4,
    },
    chip: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: "#fff",
        marginRight: 8,
        marginBottom: 8,
    },
    chipSelected: {
        backgroundColor: "#EEF2FF",
        borderColor: COLORS.primary,
    },
    chipText: {
        color: COLORS.text,
        fontSize: 13,
    },
    chipTextSelected: {
        color: COLORS.primary,
        fontWeight: "700",
    },
});

export type CreateEventRequestStyles = typeof styles;
