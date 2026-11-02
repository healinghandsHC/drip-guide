import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { CATEGORIES, Category } from "@/data/drips";

interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "md";
}

export function CategoryBadge({ category, size = "md" }: CategoryBadgeProps) {
  const cat = CATEGORIES.find((c) => c.id === category);
  if (!cat) return null;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: cat.color + "20", borderColor: cat.color + "40" },
        size === "sm" && styles.sm,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: cat.color },
          size === "sm" && styles.labelSm,
        ]}
      >
        {cat.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  sm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  labelSm: {
    fontSize: 10,
  },
});
