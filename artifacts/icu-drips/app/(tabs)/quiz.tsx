import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CATEGORIES, DRIPS, QUIZ_QUESTIONS } from "@/data/drips";
import { useQuiz } from "@/context/QuizContext";
import { useColors } from "@/hooks/useColors";

type QuizState = "idle" | "answering" | "revealed" | "done";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizScreen() {
  const colors = useColors();
  const { recordAnswer, stats } = useQuiz();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [questions, setQuestions] = useState(QUIZ_QUESTIONS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const startQuiz = useCallback(() => {
    setQuestions(shuffle(QUIZ_QUESTIONS));
    setCurrentIdx(0);
    setSelectedOption(null);
    setSessionCorrect(0);
    setSessionTotal(0);
    setQuizState("answering");
  }, []);

  const currentQ = questions[currentIdx];
  const drip = useMemo(
    () => (currentQ ? DRIPS.find((d) => d.id === currentQ.dripId) : null),
    [currentQ]
  );
  const cat = useMemo(
    () => (drip ? CATEGORIES.find((c) => c.id === drip.category) : null),
    [drip]
  );

  const handleSelect = useCallback(
    (idx: number) => {
      if (quizState !== "answering") return;
      setSelectedOption(idx);
      setQuizState("revealed");
      const isCorrect = idx === currentQ.correctIndex;
      if (isCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      recordAnswer(currentQ.id, isCorrect);
      setSessionCorrect((c) => c + (isCorrect ? 1 : 0));
      setSessionTotal((t) => t + 1);
    },
    [quizState, currentQ, recordAnswer]
  );

  const handleNext = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      if (currentIdx + 1 >= questions.length) {
        setQuizState("done");
      } else {
        setCurrentIdx((i) => i + 1);
        setSelectedOption(null);
        setQuizState("answering");
      }
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [currentIdx, questions.length, fadeAnim]);

  const overallPct =
    stats.totalAttempted > 0
      ? Math.round((stats.totalCorrect / stats.totalAttempted) * 100)
      : 0;

  if (quizState === "idle") {
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
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Quiz Mode
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            {QUIZ_QUESTIONS.length} questions · test your knowledge
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.idleContent,
            { paddingBottom: (isWeb ? 34 : insets.bottom) + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Score overview */}
          <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.scoreTitle, { color: colors.mutedForeground }]}>
              Overall Accuracy
            </Text>
            <Text style={[styles.scorePct, { color: colors.primary }]}>
              {overallPct}%
            </Text>
            <Text style={[styles.scoreDetail, { color: colors.mutedForeground }]}>
              {stats.totalCorrect} correct / {stats.totalAttempted} attempted
            </Text>

            <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${overallPct}%` as any,
                    backgroundColor:
                      overallPct >= 80
                        ? "#22c55e"
                        : overallPct >= 60
                        ? "#f59e0b"
                        : colors.destructive,
                  },
                ]}
              />
            </View>
          </View>

          {/* Category breakdown */}
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
                  styles.catRow,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderLeftColor: cat.color,
                  },
                ]}
              >
                <Text style={[styles.catLabel, { color: colors.foreground }]}>
                  {cat.label}
                </Text>
                <View style={styles.catRight}>
                  <Text style={[styles.catPct, { color: cat.color }]}>
                    {attempted > 0 ? `${pct}%` : "—"}
                  </Text>
                  <Text style={[styles.catDetail, { color: colors.mutedForeground }]}>
                    {attempted > 0 ? `${correct}/${attempted}` : "Not attempted"}
                  </Text>
                </View>
              </View>
            );
          })}

          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
            onPress={startQuiz}
            activeOpacity={0.85}
          >
            <Feather name="play" size={18} color="#fff" />
            <Text style={styles.startBtnText}>Start Quiz</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (quizState === "done") {
    const pct = Math.round((sessionCorrect / sessionTotal) * 100);
    const grade =
      pct >= 90 ? "Excellent!" : pct >= 75 ? "Good Work!" : pct >= 60 ? "Keep Practicing" : "Review Needed";
    const gradeColor =
      pct >= 90 ? "#22c55e" : pct >= 75 ? colors.primary : pct >= 60 ? "#f59e0b" : colors.destructive;
    return (
      <View
        style={[styles.root, styles.doneRoot, { backgroundColor: colors.background }]}
      >
        <View
          style={[
            styles.doneCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.doneGrade, { color: gradeColor }]}>{grade}</Text>
          <Text style={[styles.doneScore, { color: gradeColor }]}>{pct}%</Text>
          <Text style={[styles.doneDetail, { color: colors.mutedForeground }]}>
            {sessionCorrect} / {sessionTotal} correct
          </Text>

          <View style={[styles.progressBar, { backgroundColor: colors.muted, marginVertical: 16 }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${pct}%` as any, backgroundColor: gradeColor },
              ]}
            />
          </View>

          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
            onPress={startQuiz}
          >
            <Feather name="refresh-cw" size={16} color="#fff" />
            <Text style={styles.startBtnText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.startBtn,
              { backgroundColor: colors.secondary, marginTop: 10 },
            ]}
            onPress={() => setQuizState("idle")}
          >
            <Text style={[styles.startBtnText, { color: colors.secondaryForeground }]}>
              View Stats
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // answering / revealed
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Quiz header */}
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
        <View style={styles.quizMeta}>
          <TouchableOpacity
            onPress={() => setQuizState("idle")}
            style={[styles.exitBtn, { borderColor: colors.border }]}
          >
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          <Text style={[styles.quizProgress, { color: colors.mutedForeground }]}>
            {currentIdx + 1} / {questions.length}
          </Text>
          <Text style={[styles.quizScore, { color: colors.primary }]}>
            {sessionCorrect} ✓
          </Text>
        </View>
        <View style={[styles.quizProgressBar, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentIdx) / questions.length) * 100}%` as any,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.quizContent,
          { paddingBottom: (isWeb ? 34 : insets.bottom) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Drug tag */}
          {drip && cat ? (
            <TouchableOpacity
              style={[styles.drugTag, { backgroundColor: cat.color + "20" }]}
              onPress={() => router.push(`/drip/${drip.id}`)}
            >
              <View style={[styles.tagDot, { backgroundColor: cat.color }]} />
              <Text style={[styles.tagText, { color: cat.color }]}>
                {drip.name} — {cat.label}
              </Text>
              <Feather name="external-link" size={12} color={cat.color} />
            </TouchableOpacity>
          ) : null}

          {/* Question */}
          <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.questionText, { color: colors.foreground }]}>
              {currentQ.question}
            </Text>
          </View>

          {/* Options */}
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedOption === i;
            const isCorrect = i === currentQ.correctIndex;
            const isRevealed = quizState === "revealed";

            let bg = colors.card;
            let border = colors.border;
            let textColor = colors.foreground;

            if (isRevealed) {
              if (isCorrect) {
                bg = "#22c55e20";
                border = "#22c55e";
                textColor = "#166534";
              } else if (isSelected && !isCorrect) {
                bg = colors.destructive + "20";
                border = colors.destructive;
                textColor = colors.destructive;
              }
            } else if (isSelected) {
              bg = colors.primary + "20";
              border = colors.primary;
            }

            return (
              <TouchableOpacity
                key={i}
                style={[styles.option, { backgroundColor: bg, borderColor: border }]}
                onPress={() => handleSelect(i)}
                disabled={isRevealed}
                activeOpacity={0.8}
              >
                <View style={[styles.optionLetter, { backgroundColor: border + "30", borderColor: border }]}>
                  <Text style={[styles.optionLetterText, { color: border }]}>
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                {isRevealed && isCorrect ? (
                  <Feather name="check-circle" size={18} color="#22c55e" />
                ) : isRevealed && isSelected && !isCorrect ? (
                  <Feather name="x-circle" size={18} color={colors.destructive} />
                ) : null}
              </TouchableOpacity>
            );
          })}

          {/* Explanation */}
          {quizState === "revealed" ? (
            <View
              style={[
                styles.explanation,
                {
                  backgroundColor:
                    selectedOption === currentQ.correctIndex
                      ? "#22c55e10"
                      : colors.destructive + "10",
                  borderColor:
                    selectedOption === currentQ.correctIndex
                      ? "#22c55e"
                      : colors.destructive,
                },
              ]}
            >
              <Feather
                name="info"
                size={15}
                color={
                  selectedOption === currentQ.correctIndex
                    ? "#22c55e"
                    : colors.destructive
                }
              />
              <Text style={[styles.explanationText, { color: colors.foreground }]}>
                {currentQ.explanation}
              </Text>
            </View>
          ) : null}

          {/* Next button */}
          {quizState === "revealed" ? (
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: colors.primary }]}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>
                {currentIdx + 1 >= questions.length ? "See Results" : "Next Question"}
              </Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
          ) : null}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingBottom: 10,
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
  idleContent: {
    padding: 16,
    gap: 10,
  },
  scoreCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    marginBottom: 4,
  },
  scoreTitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  scorePct: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    lineHeight: 68,
    letterSpacing: -1,
  },
  scoreDetail: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  progressBar: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  quizProgressBar: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  catRow: {
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  catLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  catRight: { alignItems: "flex-end" },
  catPct: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  catDetail: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  startBtn: {
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
  },
  startBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  // Quiz
  quizMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exitBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  quizProgress: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  quizScore: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  quizContent: {
    padding: 16,
    gap: 10,
  },
  drugTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  questionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    marginBottom: 6,
  },
  questionText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  option: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionLetterText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 20,
  },
  explanation: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  explanationText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  nextBtn: {
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  // Done screen
  doneRoot: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  doneCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
  },
  doneGrade: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  doneScore: {
    fontSize: 72,
    fontFamily: "Inter_700Bold",
    lineHeight: 84,
    letterSpacing: -2,
  },
  doneDetail: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
});
