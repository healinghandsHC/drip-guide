import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface DripsHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: { label: string; onPress: () => void };
  leftAction?: { label: string; onPress: () => void };
}

export function DripsHeader({
  title,
  subtitle,
  rightAction,
  leftAction,
}: DripsHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const topPadding = isWeb ? 67 : insets.top;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          paddingTop: topPadding + 12,
        },
      ]}
    >
      <View style={styles.row}>
        {leftAction ? (
          <TouchableOpacity onPress={leftAction.onPress} style={styles.action}>
            <Text style={[styles.actionText, { color: colors.primary }]}>
              {leftAction.label}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.action} />
        )}
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightAction ? (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.action}>
            <Text style={[styles.actionText, { color: colors.primary }]}>
              {rightAction.label}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.action} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  action: {
    minWidth: 60,
  },
  actionText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
});
