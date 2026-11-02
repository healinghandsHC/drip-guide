import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryBadge } from "@/components/CategoryBadge";
import { InfoSection } from "@/components/InfoSection";
import { CATEGORIES, DRIPS, QUIZ_QUESTIONS } from "@/data/drips";
import { useQuiz } from "@/context/QuizContext";
import { useColors } from "@/hooks/useColors";

export default function DripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const { stats } = useQuiz();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const drip = DRIPS.find((d) => d.id === id);
  const cat = drip ? CATEGORIES.find((c) => c.id === drip.category) : null;
  const topPad = isWeb ? 67 : insets.top;

  if (!drip) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <Text style={{ color: colors.foreground, textAlign: "center", marginTop: 40 }}>
          Drug not found
        </Text>
      </View>
    );
  }

  const dripStats = stats.byDrip[drip.id];
  const questions = QUIZ_QUESTIONS.filter((q) => q.dripId === drip.id);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Custom header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: cat?.color || colors.border,
            paddingTop: topPad + 8,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { borderColor: colors.border }]}
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.foreground }]}>
            {drip.name}
          </Text>
          <Text style={[styles.headerGeneric, { color: colors.mutedForeground }]}>
            {drip.genericName}
          </Text>
        </View>
        {dripStats ? (
          <View
            style={[
              styles.miniStat,
              {
                backgroundColor:
                  dripStats.correct / dripStats.attempted >= 0.8
                    ? "#22c55e20"
                    : "#f59e0b20",
                borderColor:
                  dripStats.correct / dripStats.attempted >= 0.8
                    ? "#22c55e"
                    : "#f59e0b",
              },
            ]}
          >
            <Text
              style={[
                styles.miniStatText,
                {
                  color:
                    dripStats.correct / dripStats.attempted >= 0.8
                      ? "#22c55e"
                      : "#f59e0b",
                },
              ]}
            >
              {Math.round((dripStats.correct / dripStats.attempted) * 100)}%
            </Text>
          </View>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (isWeb ? 34 : insets.bottom) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Category + mechanism */}
        <CategoryBadge category={drip.category} />

        <View
          style={[
            styles.mechanismCard,
            {
              backgroundColor: (cat?.color || colors.primary) + "10",
              borderColor: (cat?.color || colors.primary) + "30",
              borderLeftColor: cat?.color || colors.primary,
            },
          ]}
        >
          <Text style={[styles.mechanismLabel, { color: cat?.color || colors.primary }]}>
            MECHANISM
          </Text>
          <Text style={[styles.mechanismText, { color: colors.foreground }]}>
            {drip.mechanism}
          </Text>
        </View>

        {/* Key dosing info */}
        <View style={[styles.dosingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.dosingRow}>
            <Feather name="droplet" size={14} color={colors.primary} />
            <Text style={[styles.dosingLabel, { color: colors.mutedForeground }]}>
              Concentration
            </Text>
            <Text style={[styles.dosingValue, { color: colors.foreground }]}>
              {drip.standardConcentration}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.dosingRow}>
            <Feather name="activity" size={14} color={colors.primary} />
            <Text style={[styles.dosingLabel, { color: colors.mutedForeground }]}>
              Dosing Range
            </Text>
            <Text style={[styles.dosingValue, { color: colors.foreground }]}>
              {drip.dosingRange}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.dosingRow}>
            <Feather name="trending-up" size={14} color={colors.primary} />
            <Text style={[styles.dosingLabel, { color: colors.mutedForeground }]}>
              Titration
            </Text>
            <Text style={[styles.dosingValue, { color: colors.foreground }]}>
              {drip.titration}
            </Text>
          </View>
        </View>

        {/* Compatibility info */}
        <View style={[styles.compatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.compatRow}>
            <View style={[styles.compatIcon, { backgroundColor: "#22c55e20" }]}>
              <Feather name="check" size={12} color="#22c55e" />
            </View>
            <View style={styles.compatText}>
              <Text style={[styles.compatLabel, { color: "#22c55e" }]}>Compatible</Text>
              <Text style={[styles.compatVal, { color: colors.foreground }]}>{drip.compatibilities}</Text>
            </View>
          </View>
          {drip.incompatibilities ? (
            <View style={styles.compatRow}>
              <View style={[styles.compatIcon, { backgroundColor: colors.destructive + "20" }]}>
                <Feather name="x" size={12} color={colors.destructive} />
              </View>
              <View style={styles.compatText}>
                <Text style={[styles.compatLabel, { color: colors.destructive }]}>Incompatible</Text>
                <Text style={[styles.compatVal, { color: colors.foreground }]}>{drip.incompatibilities}</Text>
              </View>
            </View>
          ) : null}
          {drip.antidote ? (
            <View style={styles.compatRow}>
              <View style={[styles.compatIcon, { backgroundColor: "#f59e0b20" }]}>
                <Feather name="shield" size={12} color="#f59e0b" />
              </View>
              <View style={styles.compatText}>
                <Text style={[styles.compatLabel, { color: "#f59e0b" }]}>Antidote</Text>
                <Text style={[styles.compatVal, { color: colors.foreground }]}>{drip.antidote}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Mnemonic tip */}
        {drip.mnemonicTip ? (
          <View
            style={[
              styles.mnemonicCard,
              {
                backgroundColor: colors.primary + "10",
                borderColor: colors.primary + "30",
              },
            ]}
          >
            <Feather name="zap" size={15} color={colors.primary} />
            <Text style={[styles.mnemonicText, { color: colors.foreground }]}>
              {drip.mnemonicTip}
            </Text>
          </View>
        ) : null}

        {/* Collapsible sections */}
        <InfoSection
          title="Indications"
          items={drip.indications}
          accent="#22c55e"
          defaultOpen={true}
        />
        <InfoSection
          title="Nursing Considerations"
          items={drip.nursingConsiderations}
          accent={colors.primary}
          defaultOpen={true}
        />
        <InfoSection
          title="Monitoring Parameters"
          items={drip.monitoringParams}
          accent="#f59e0b"
        />
        <InfoSection
          title="Side Effects"
          items={drip.sideEffects}
          accent={colors.destructive}
        />
        <InfoSection
          title="Contraindications"
          items={drip.contraindications}
          accent="#7c3aed"
        />

        {/* Related quiz questions */}
        {questions.length > 0 ? (
          <View style={{ marginTop: 4 }}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              PRACTICE QUESTIONS ({questions.length})
            </Text>
            {questions.map((q) => (
              <View
                key={q.id}
                style={[
                  styles.questionPreview,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.questionText, { color: colors.foreground }]}>
                  {q.question}
                </Text>
                <TouchableOpacity
                  style={[styles.quizLink, { borderColor: colors.primary }]}
                  onPress={() => router.push("/(tabs)/quiz")}
                >
                  <Text style={[styles.quizLinkText, { color: colors.primary }]}>
                    Practice in Quiz
                  </Text>
                  <Feather name="arrow-right" size={12} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    borderBottomWidth: 2,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerInfo: { flex: 1 },
  headerName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  headerGeneric: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  miniStat: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  miniStatText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  content: {
    padding: 16,
    gap: 10,
  },
  mechanismCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 14,
  },
  mechanismLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 6,
  },
  mechanismText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  dosingCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  dosingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    flexWrap: "wrap",
  },
  dosingLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    minWidth: 90,
    marginTop: 1,
  },
  dosingValue: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 12,
  },
  compatCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  compatRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  compatIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  compatText: { flex: 1 },
  compatLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  compatVal: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
  mnemonicCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  mnemonicText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    lineHeight: 20,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  questionPreview: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  questionText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    lineHeight: 19,
  },
  quizLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  quizLinkText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
