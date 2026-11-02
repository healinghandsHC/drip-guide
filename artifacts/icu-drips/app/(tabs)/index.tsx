import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryBadge } from "@/components/CategoryBadge";
import { CATEGORIES, Category, DRIPS } from "@/data/drips";
import { useColors } from "@/hooks/useColors";

export default function LearnScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const filtered = DRIPS.filter((d) => {
    const matchSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.genericName.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || d.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const topPad = isWeb ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop: topPad + 12,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          ICU Drip Reference
        </Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {DRIPS.length} drugs · learn & master
        </Text>

        {/* Search */}
        <View
          style={[
            styles.searchRow,
            { backgroundColor: colors.muted, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search drugs..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category filter */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null as Category | null, label: "All" }, ...CATEGORIES.map(c => ({ id: c.id as Category | null, label: c.label }))]}
          keyExtractor={(item) => item.id ?? "all"}
          contentContainerStyle={styles.categoryScroll}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item.id;
            const cat = CATEGORIES.find((c) => c.id === item.id);
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(isActive ? null : item.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive
                      ? (cat?.color || colors.primary)
                      : colors.muted,
                    borderColor: isActive
                      ? (cat?.color || colors.primary)
                      : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isActive ? "#fff" : colors.mutedForeground,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Drug list */}
      <FlatList
        data={filtered}
        keyExtractor={(d) => d.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: (isWeb ? 34 : insets.bottom) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const cat = CATEGORIES.find((c) => c.id === item.category);
          return (
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderLeftColor: cat?.color || colors.primary,
                },
              ]}
              onPress={() => router.push(`/drip/${item.id}`)}
              activeOpacity={0.75}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardTitles}>
                  <Text style={[styles.drugName, { color: colors.foreground }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.drugGeneric, { color: colors.mutedForeground }]}>
                    {item.genericName}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </View>
              <CategoryBadge category={item.category} size="sm" />
              <Text
                style={[styles.cardMechanism, { color: colors.mutedForeground }]}
                numberOfLines={2}
              >
                {item.mechanism}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No drugs found
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  categoryScroll: {
    gap: 6,
    paddingRight: 16,
    paddingBottom: 4,
  },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  list: {
    padding: 12,
    gap: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 14,
    gap: 6,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  cardTitles: { flex: 1 },
  drugName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  drugGeneric: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  cardMechanism: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginTop: 2,
  },
  empty: {
    alignItems: "center",
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
});
