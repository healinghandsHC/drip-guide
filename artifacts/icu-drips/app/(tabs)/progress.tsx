import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatCard } from "@/components/StatCard";
import { CATEGORIES, DRIPS, QUIZ_QUESTIONS } from "@/data/drips";
import { useQuiz } from "@/context/QuizContext";
import { useColors } from "@/hooks/useColors";

export default function ProgressScreen() {
  const colors = useColors();
  const { stats, resetStats } = useQuiz();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const overallPct =
    stats.totalAttempted > 0
      ? Math.round((stats.totalCorrect / stats.totalAttempted) * 100)
      : 0;

  const handleReset = () => {
    Alert.alert(
      "Reset Progress",
      "This will clear all quiz history. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: resetStats },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
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
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              My Progress
            </Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              Track your mastery
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleReset}
            style={[styles.resetBtn, { borderColor: colors.border }]}
          >
            <Feather name="trash-2" size={16} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (isWeb ? 34 : insets.bottom) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top stats */}
        <View style={styles.statsRow}>
          <StatCard
            label="Accuracy"
            value={`${overallPct}%`}
            sub={`${stats.totalAttempted} answered`}
            accent={
              overallPct >= 80
                ? "#22c55e"
                : overallPct >= 60
                ? "#f59e0b"
                : colors.destructive
            }
          />
          <StatCard
            label="Correct"
            value={`${stats.totalCorrect}`}
            sub={`of ${stats.totalAttempted}`}
            accent={colors.primary}
          />
          <StatCard
            label="Questions"
            value={`${QUIZ_QUESTIONS.length}`}
            sub="total available"
            accent={colors.mutedForeground}
          />
        </View>

        {/* Category breakdown */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          BY CATEGORY
        </Text>
        {CATEGORIES.map((cat) => {
          const catDrips = DRIPS.filter((d) => d.category === cat.id);
          const dripIds = catDrips.map((d) => d.id);
          const attempted = dripIds.reduce(
            (acc, id) => acc + (stats.byDrip[id]?.attempted ?? 0),
            0
          );
          const correct = dripIds.reduce(
            (acc, id) => acc + (stats.byDrip[id]?.correct ?? 0),
            0
          );
          const pct = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

          return (
            <View
              key={cat.id}
              style={[
                styles.catCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.catHeader}>
                <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                <Text style={[styles.catName, { color: colors.foreground }]}>
                  {cat.label}
                </Text>
                <Text style={[styles.catPct, { color: cat.color }]}>
                  {attempted > 0 ? `${pct}%` : "—"}
                </Text>
              </View>
              <View style={[styles.catBar, { backgroundColor: colors.muted }]}>
                {attempted > 0 ? (
                  <View
                    style={[
                      styles.catBarFill,
                      {
                        width: `${pct}%` as any,
                        backgroundColor: cat.color,
                      },
                    ]}
                  />
                ) : null}
              </View>
              <Text style={[styles.catSub, { color: colors.mutedForeground }]}>
                {attempted > 0
                  ? `${correct} correct / ${attempted} attempted · ${catDrips.length} drugs`
                  : `${catDrips.length} drugs · not attempted yet`}
              </Text>
            </View>
          );
        })}

        {/* Individual drip breakdown */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          DRUG PERFORMANCE
        </Text>
        {DRIPS.map((drip) => {
          const s = stats.byDrip[drip.id];
          const cat = CATEGORIES.find((c) => c.id === drip.category);
          if (!s) {
            return (
              <View
                key={drip.id}
                style={[
                  styles.dripRow,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={[styles.dripDot, { backgroundColor: cat?.color || colors.muted }]} />
                <Text style={[styles.dripName, { color: colors.mutedForeground }]}>
                  {drip.name}
                </Text>
                <Text style={[styles.dripStatus, { color: colors.muted }]}>
                  Not attempted
                </Text>
              </View>
            );
          }
          const pct = Math.round((s.correct / s.attempted) * 100);
          return (
            <View
              key={drip.id}
              style={[
                styles.dripRow,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={[styles.dripDot, { backgroundColor: cat?.color || colors.primary }]} />
              <Text style={[styles.dripName, { color: colors.foreground }]}>
                {drip.name}
              </Text>
              <View style={styles.dripRight}>
                <Text
                  style={[
                    styles.dripPct,
                    {
                      color:
                        pct >= 80
                          ? "#22c55e"
                          : pct >= 60
                          ? "#f59e0b"
                          : colors.destructive,
                    },
                  ]}
                >
                  {pct}%
                </Text>
                <Text style={[styles.dripDetail, { color: colors.mutedForeground }]}>
                  {s.correct}/{s.attempted}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  },
  resetBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 16,
    gap: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 2,
  },
  catCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  catHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  catPct: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  catBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  catBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  catSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  dripRow: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dripDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  dripName: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  dripStatus: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  dripRight: { alignItems: "flex-end" },
  dripPct: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  dripDetail: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
