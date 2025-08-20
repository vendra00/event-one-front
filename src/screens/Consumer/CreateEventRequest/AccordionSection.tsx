import React, { useState, PropsWithChildren, memo } from "react";
import { View, Text, Pressable, LayoutAnimation, Platform, UIManager } from "react-native";
import { styles } from "./CreateEventRequestScreen.styles";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
    title: string;
    subtitleRight?: React.ReactNode;
    defaultOpen?: boolean;
};

export const AccordionSection = memo(({ title, subtitleRight, defaultOpen = false, children }: PropsWithChildren<Props>) => {
    const [open, setOpen] = useState<boolean>(defaultOpen);
    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpen(v => !v);
    };

    return (
        <View style={styles.accordionSection}>
            <Pressable onPress={toggle} style={({ pressed }) => [styles.accordionHeader, pressed && { opacity: 0.9 }]}>
                <Text style={styles.accordionTitle}>{title}</Text>
                <View style={styles.accordionHeaderRight}>
                    {subtitleRight}
                    <Text style={styles.accordionChevron}>{open ? "▾" : "▸"}</Text>
                </View>
            </Pressable>
            {open && <View style={styles.accordionBody}>{children}</View>}
        </View>
    );
});
