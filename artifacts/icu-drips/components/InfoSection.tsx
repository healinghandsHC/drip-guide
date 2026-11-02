import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";

interface InfoSectionProps {
  title: string;
  items: string[];
  icon?: React.ReactNode;
  accent?: string;
  defaultOpen?: boolean;
}

export function InfoSection({
  title,
  items,
  icon,
  accent,
  defaultOpen = false,
}: InfoSectionProps) {
  const colors = useColors();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderLeftColor: accent || colors.primary,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => setOpen((o) => !o)}
        style={styles.header}
        activeOpacity={0.7}
      >
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        <Feather
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.mutedForeground}
        />
      </TouchableOpacity>
      {open && (
        <View style={styles.body}>
          {items.map((item, i) => (
            <View key={i} style={styles.item}>
              <View
                style={[styles.dot, { backgroundColor: accent || colors.primary }]}
              />
              <Text style={[styles.text, { color: colors.foreground }]}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
    marginBottom: 10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 8,
  },
  icon: {
    marginRight: 2,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
  },
  item: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
});
