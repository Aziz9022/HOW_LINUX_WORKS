import { MasteryStatus } from '../data/types';
import { FlashcardReviewState } from './srs';

export interface ChapterProgressRecord {
  chapterNumber: number;
  completedSectionIds: string[];
  completedLabTaskIds: string[];
  bestAssessmentScore: number | null; // 0-100
  lastAssessmentScore: number | null;
  attemptsCount: number;
  isBookmarked: boolean;
  isDifficult: boolean;
  lastVisitedAt: number;
}

export interface NoteRecord {
  id: string; // e.g. 'ch-1'
  chapterNumber: number;
  content: string;
  updatedAt: number;
}

export interface IncorrectAnswerRecord {
  id: string;
  chapterNumber: number;
  questionId: string;
  prompt: string;
  userAnswer: string;
  correctSummary: string;
  explanation: string;
  timestamp: number;
  resolved: boolean;
}

export interface AssessmentAttemptRecord {
  id: string;
  chapterNumber: number;
  scorePercent: number;
  correctCount: number;
  totalCount: number;
  timestamp: number;
}

export interface LearningStateSnapshot {
  schemaVersion: 1;
  exportedAt: string;
  chapterProgress: Record<number, ChapterProgressRecord>;
  notes: Record<number, NoteRecord>;
  flashcards: Record<string, FlashcardReviewState>;
  incorrectAnswers: IncorrectAnswerRecord[];
  assessmentAttempts: AssessmentAttemptRecord[];
}

export function createEmptySnapshot(): LearningStateSnapshot {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    chapterProgress: {},
    notes: {},
    flashcards: {},
    incorrectAnswers: [],
    assessmentAttempts: [],
  };
}

export function computeChapterMastery(
  record: ChapterProgressRecord | undefined,
  totalSections: number,
  unresolvedErrorsInChapter: number
): MasteryStatus {
  if (!record) return 'not_started';
  const hasAnyActivity =
    record.completedSectionIds.length > 0 ||
    record.completedLabTaskIds.length > 0 ||
    record.attemptsCount > 0;

  if (!hasAnyActivity) return 'not_started';

  if (
    record.isDifficult ||
    (record.lastAssessmentScore !== null && record.lastAssessmentScore < 70) ||
    unresolvedErrorsInChapter > 0
  ) {
    return 'needs_revision';
  }

  const allSectionsDone = totalSections > 0 && record.completedSectionIds.length >= totalSections;
  const passedAssessment = record.bestAssessmentScore !== null && record.bestAssessmentScore >= 75;

  if (allSectionsDone && passedAssessment) {
    return 'completed';
  }

  return 'in_progress';
}

const DB_NAME = 'hlw_personal_learning_lab_db';
const DB_VERSION = 1;
const STORE_NAME = 'state_store';
const STATE_KEY = 'learning_snapshot_v1';
const FALLBACK_LS_KEY = 'hlw_learning_snapshot_fallback_v1';

function openDatabase(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      resolve(null);
      return;
    }
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function loadLearningState(): Promise<LearningStateSnapshot> {
  const db = await openDatabase();
  if (db) {
    try {
      const value = await new Promise<LearningStateSnapshot | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(STATE_KEY);
        req.onsuccess = () => resolve(req.result as LearningStateSnapshot | undefined);
        req.onerror = () => reject(req.error);
      });
      db.close();
      if (value && value.schemaVersion === 1) {
        return value;
      }
    } catch {
      db.close();
    }
  }

  try {
    const raw = window.localStorage.getItem(FALLBACK_LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LearningStateSnapshot;
      if (parsed && parsed.schemaVersion === 1) return parsed;
    }
  } catch {
    // ignore
  }

  return createEmptySnapshot();
}

export async function saveLearningState(snapshot: LearningStateSnapshot): Promise<void> {
  const stamped: LearningStateSnapshot = {
    ...snapshot,
    exportedAt: new Date().toISOString(),
  };

  const db = await openDatabase();
  if (db) {
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(stamped, STATE_KEY);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      db.close();
      return;
    } catch {
      db.close();
    }
  }

  try {
    window.localStorage.setItem(FALLBACK_LS_KEY, JSON.stringify(stamped));
  } catch {
    // ignore quota error
  }
}

function isPlainRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function validateImportedSnapshot(raw: unknown): LearningStateSnapshot | null {
  if (!isPlainRecord(raw)) return null;
  if (raw.schemaVersion !== 1) return null;
  if (!isPlainRecord(raw.chapterProgress)) return null;
  if (!isPlainRecord(raw.notes)) return null;
  if (!isPlainRecord(raw.flashcards)) return null;
  if (!Array.isArray(raw.incorrectAnswers) || !Array.isArray(raw.assessmentAttempts)) {
    return null;
  }

  const chapterProgress: Record<number, ChapterProgressRecord> = {};
  for (const [k, v] of Object.entries(raw.chapterProgress)) {
    if (FORBIDDEN_KEYS.has(k)) return null;
    const chNum = Number(k);
    if (!Number.isInteger(chNum) || chNum < 1 || chNum > 17 || !isPlainRecord(v)) return null;
    if (!Array.isArray(v.completedSectionIds) || !Array.isArray(v.completedLabTaskIds)) return null;
    chapterProgress[chNum] = {
      chapterNumber: chNum,
      completedSectionIds: v.completedSectionIds.filter((s): s is string => typeof s === 'string'),
      completedLabTaskIds: v.completedLabTaskIds.filter((s): s is string => typeof s === 'string'),
      bestAssessmentScore: typeof v.bestAssessmentScore === 'number' ? v.bestAssessmentScore : null,
      lastAssessmentScore: typeof v.lastAssessmentScore === 'number' ? v.lastAssessmentScore : null,
      attemptsCount: typeof v.attemptsCount === 'number' ? Math.max(0, v.attemptsCount) : 0,
      isBookmarked: Boolean(v.isBookmarked),
      isDifficult: Boolean(v.isDifficult),
      lastVisitedAt: typeof v.lastVisitedAt === 'number' ? v.lastVisitedAt : Date.now(),
    };
  }

  const notes: Record<number, NoteRecord> = {};
  for (const [k, v] of Object.entries(raw.notes)) {
    if (FORBIDDEN_KEYS.has(k)) return null;
    const chNum = Number(k);
    if (!Number.isInteger(chNum) || chNum < 1 || chNum > 17 || !isPlainRecord(v)) return null;
    if (typeof v.content !== 'string') return null;
    notes[chNum] = {
      id: typeof v.id === 'string' ? v.id : `ch-${chNum}`,
      chapterNumber: chNum,
      content: v.content,
      updatedAt: typeof v.updatedAt === 'number' ? v.updatedAt : Date.now(),
    };
  }

  const flashcards: Record<string, FlashcardReviewState> = {};
  for (const [k, v] of Object.entries(raw.flashcards)) {
    if (FORBIDDEN_KEYS.has(k) || !isPlainRecord(v)) return null;
    if (typeof v.cardId !== 'string' || typeof v.dueAt !== 'number') return null;
    flashcards[k] = {
      cardId: v.cardId,
      intervalDays: typeof v.intervalDays === 'number' ? v.intervalDays : 0,
      easeFactor: typeof v.easeFactor === 'number' ? v.easeFactor : 2.5,
      repetitions: typeof v.repetitions === 'number' ? v.repetitions : 0,
      dueAt: v.dueAt,
      lastReviewedAt: typeof v.lastReviewedAt === 'number' ? v.lastReviewedAt : undefined,
    };
  }

  const incorrectAnswers: IncorrectAnswerRecord[] = [];
  for (const item of raw.incorrectAnswers) {
    if (!isPlainRecord(item) || typeof item.questionId !== 'string' || typeof item.chapterNumber !== 'number') {
      return null;
    }
    incorrectAnswers.push({
      id: typeof item.id === 'string' ? item.id : `err-${item.chapterNumber}-${item.questionId}`,
      chapterNumber: item.chapterNumber,
      questionId: item.questionId,
      prompt: typeof item.prompt === 'string' ? item.prompt : '',
      userAnswer: typeof item.userAnswer === 'string' ? item.userAnswer : '',
      correctSummary: typeof item.correctSummary === 'string' ? item.correctSummary : '',
      explanation: typeof item.explanation === 'string' ? item.explanation : '',
      timestamp: typeof item.timestamp === 'number' ? item.timestamp : Date.now(),
      resolved: Boolean(item.resolved),
    });
  }

  const assessmentAttempts: AssessmentAttemptRecord[] = [];
  for (const att of raw.assessmentAttempts) {
    if (!isPlainRecord(att) || typeof att.chapterNumber !== 'number' || typeof att.scorePercent !== 'number') {
      return null;
    }
    assessmentAttempts.push({
      id: typeof att.id === 'string' ? att.id : `att-${att.timestamp ?? Date.now()}`,
      chapterNumber: att.chapterNumber,
      scorePercent: att.scorePercent,
      correctCount: typeof att.correctCount === 'number' ? att.correctCount : 0,
      totalCount: typeof att.totalCount === 'number' ? att.totalCount : 0,
      timestamp: typeof att.timestamp === 'number' ? att.timestamp : Date.now(),
    });
  }

  return {
    schemaVersion: 1,
    exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : new Date().toISOString(),
    chapterProgress,
    notes,
    flashcards,
    incorrectAnswers,
    assessmentAttempts,
  };
}

export function mergeLearningSnapshots(
  current: LearningStateSnapshot,
  incoming: LearningStateSnapshot
): LearningStateSnapshot {
  const mergedProgress: Record<number, ChapterProgressRecord> = { ...current.chapterProgress };
  for (const [k, inc] of Object.entries(incoming.chapterProgress)) {
    const chNum = Number(k);
    const cur = mergedProgress[chNum];
    if (!cur) {
      mergedProgress[chNum] = inc;
    } else {
      mergedProgress[chNum] = {
        chapterNumber: chNum,
        completedSectionIds: Array.from(new Set([...cur.completedSectionIds, ...inc.completedSectionIds])),
        completedLabTaskIds: Array.from(new Set([...cur.completedLabTaskIds, ...inc.completedLabTaskIds])),
        bestAssessmentScore:
          cur.bestAssessmentScore === null
            ? inc.bestAssessmentScore
            : inc.bestAssessmentScore === null
              ? cur.bestAssessmentScore
              : Math.max(cur.bestAssessmentScore, inc.bestAssessmentScore),
        lastAssessmentScore:
          inc.lastVisitedAt >= cur.lastVisitedAt ? inc.lastAssessmentScore : cur.lastAssessmentScore,
        attemptsCount: Math.max(cur.attemptsCount, inc.attemptsCount),
        isBookmarked: cur.isBookmarked || inc.isBookmarked,
        isDifficult: cur.isDifficult || inc.isDifficult,
        lastVisitedAt: Math.max(cur.lastVisitedAt, inc.lastVisitedAt),
      };
    }
  }

  const mergedNotes: Record<number, NoteRecord> = { ...current.notes };
  for (const [k, inc] of Object.entries(incoming.notes)) {
    const chNum = Number(k);
    const cur = mergedNotes[chNum];
    if (!cur || inc.updatedAt >= cur.updatedAt) {
      mergedNotes[chNum] = inc;
    }
  }

  const mergedCards: Record<string, FlashcardReviewState> = { ...current.flashcards };
  for (const [k, inc] of Object.entries(incoming.flashcards)) {
    const cur = mergedCards[k];
    if (!cur || (inc.lastReviewedAt ?? 0) >= (cur.lastReviewedAt ?? 0)) {
      mergedCards[k] = inc;
    }
  }

  const seenErrKeys = new Set(current.incorrectAnswers.map((e) => `${e.chapterNumber}:${e.questionId}`));
  const mergedErrors = [
    ...current.incorrectAnswers,
    ...incoming.incorrectAnswers.filter((e) => !seenErrKeys.has(`${e.chapterNumber}:${e.questionId}`)),
  ];

  const seenAttIds = new Set(current.assessmentAttempts.map((a) => a.id));
  const mergedAttempts = [
    ...current.assessmentAttempts,
    ...incoming.assessmentAttempts.filter((a) => !seenAttIds.has(a.id)),
  ].sort((a, b) => b.timestamp - a.timestamp);

  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    chapterProgress: mergedProgress,
    notes: mergedNotes,
    flashcards: mergedCards,
    incorrectAnswers: mergedErrors,
    assessmentAttempts: mergedAttempts,
  };
}
