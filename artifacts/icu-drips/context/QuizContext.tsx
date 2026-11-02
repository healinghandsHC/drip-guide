import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { QUIZ_QUESTIONS } from "@/data/drips";

interface QuizResult {
  questionId: string;
  correct: boolean;
  timestamp: number;
}

interface QuizStats {
  totalAttempted: number;
  totalCorrect: number;
  byDrip: Record<string, { attempted: number; correct: number }>;
}

interface QuizContextType {
  results: QuizResult[];
  stats: QuizStats;
  recordAnswer: (questionId: string, correct: boolean) => void;
  resetStats: () => void;
}

const STORAGE_KEY = "@icu_drips_quiz_results";

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setResults(JSON.parse(stored));
        } catch {
          /* ignore */
        }
      }
    });
  }, []);

  const computeStats = useCallback((res: QuizResult[]): QuizStats => {
    const byDrip: Record<string, { attempted: number; correct: number }> = {};
    res.forEach((r) => {
      const q = QUIZ_QUESTIONS.find((q) => q.id === r.questionId);
      if (!q) return;
      if (!byDrip[q.dripId]) byDrip[q.dripId] = { attempted: 0, correct: 0 };
      byDrip[q.dripId].attempted++;
      if (r.correct) byDrip[q.dripId].correct++;
    });
    return {
      totalAttempted: res.length,
      totalCorrect: res.filter((r) => r.correct).length,
      byDrip,
    };
  }, []);

  const recordAnswer = useCallback(
    (questionId: string, correct: boolean) => {
      const newResult: QuizResult = {
        questionId,
        correct,
        timestamp: Date.now(),
      };
      setResults((prev) => {
        const updated = [...prev, newResult];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const resetStats = useCallback(() => {
    setResults([]);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const stats = computeStats(results);

  return (
    <QuizContext.Provider value={{ results, stats, recordAnswer, resetStats }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used within QuizProvider");
  return ctx;
}
