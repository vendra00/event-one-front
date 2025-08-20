// src/theme/colors.ts
export const COLORS = {
    bg: "#F6F7FB",
    card: "#FFFFFF",
    border: "#E5E7EB",
    text: "#111827",
    subtext: "#6B7280",
    primary: "#2563EB",
    dangerBg: "#FEE2E2",
    dangerText: "#B91C1C",
} as const;

export type Colors = typeof COLORS;
