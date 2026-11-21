import React, { useEffect, useState, useCallback } from 'react';
import {
  Terminal,
  Sun,
  Moon,
  Menu,
  X,
  BookOpen,
  LayoutDashboard,
  RotateCcw,
  FileCheck2,
  Type,
} from 'lucide-react';
import { ALL_CHAPTERS, getChapterByNumber } from './data/contentDatabase';
import { MasteryStatus } from './data/types';
import {
  ChapterProgressRecord,
  computeChapterMastery,
  createEmptySnapshot,
  LearningStateSnapshot,
  loadLearningState,
  saveLearningState,
} from './storage/db';
import {
  AppView,
  FontSizeScale,
  loadPreferences,
  savePreferences,
  UserPreferences,
} from './storage/preferences';
import { createInitialCardState, ReviewRating, scheduleNextReview } from './storage/srs';
import { Dashboard } from './components/Dashboard';
import { ChapterView } from './components/ChapterView';
import { TerminalLab } from './components/TerminalLab';
import { RevisionCenter } from './components/RevisionCenter';
import { SourceAuditView } from './components/SourceAuditView';

function ensureChapterRecord(
  map: Record<number, ChapterProgressRecord>,
  chapterNumber: number
): ChapterProgressRecord {
  return (
    map[chapterNumber] ?? {
      chapterNumber,
      completedSectionIds: [],
      completedLabTaskIds: [],
      bestAssessmentScore: null,
      lastAssessmentScore: null,
      attemptsCount: 0,
      isBookmarked: false,
      isDifficult: false,
      lastVisitedAt: Date.now(),
    }
  );
}

const DOT_BY_MASTERY: Record<MasteryStatus, string> = {
  not_started: 'bg-slate-300 dark:bg-slate-600',
  in_progress: 'bg-sky-500',
  completed: 'bg-emerald-500',
  needs_revision: 'bg-amber-500',
};

export default function App() {
  const [prefs, setPrefs] = useState<UserPreferences>(() => loadPreferences());
  const [learningState, setLearningState] = useState<LearningStateSnapshot>(() =>
    createEmptySnapshot()
  );
  const [hydrated, setHydrated] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Hydrate IndexedDB learning state on mount
  useEffect(() => {
    let active = true;
    loadLearningState().then((snap) => {
      if (active) {
        setLearningState(snap);
        setHydrated(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Apply Tailwind v4 class-based dark theme
  useEffect(() => {
    const root = document.documentElement;
    if (prefs.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    savePreferences(prefs);
  }, [prefs]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileNavOpen]);

  // Persist learning state to IndexedDB on change
  const commitLearningState = useCallback(
    (updater: (prev: LearningStateSnapshot) => LearningStateSnapshot) => {
      setLearningState((prev) => {
        const next = updater(prev);
        void saveLearningState(next);
        return next;
      });
    },
    []
  );

  const openChapter = (chapterNum: number) => {
    setPrefs((p) => ({ ...p, lastView: 'chapter', lastChapter: chapterNum }));
    setMobileNavOpen(false);
    commitLearningState((prev) => {
      const rec = ensureChapterRecord(prev.chapterProgress, chapterNum);
      return {
        ...prev,
        chapterProgress: {
          ...prev.chapterProgress,
          [chapterNum]: { ...rec, lastVisitedAt: Date.now() },
        },
      };
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setView = (view: AppView) => {
    setPrefs((p) => ({ ...p, lastView: view }));
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setPrefs((p) => ({ ...p, theme: p.theme === 'dark' ? 'light' : 'dark' }));
  };

  const cycleFontSize = () => {
    const order: FontSizeScale[] = ['sm', 'md', 'lg'];
    setPrefs((p) => ({
      ...p,
      fontSize: order[(order.indexOf(p.fontSize) + 1) % order.length],
    }));
  };

  const getMasteryForChapter = (chapterNum: number): MasteryStatus => {
    const ch = getChapterByNumber(chapterNum);
    const rec = learningState.chapterProgress[chapterNum];
    const unresolved = learningState.incorrectAnswers.filter(
      (e) => e.chapterNumber === chapterNum && !e.resolved
    ).length;
    return computeChapterMastery(rec, ch?.sections.length ?? 0, unresolved);
  };

  const currentChapter = getChapterByNumber(prefs.lastChapter) ?? ALL_CHAPTERS[0];
  const currentProgress = ensureChapterRecord(
    learningState.chapterProgress,
    currentChapter.number
  );

  const navItems: Array<{ id: AppView; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'chapter', label: 'Chapters', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'terminal', label: 'Terminal Lab', icon: <Terminal className="w-4 h-4" /> },
    { id: 'revision', label: 'Revision', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'audit', label: 'Source Audit', icon: <FileCheck2 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#0B1120] dark:text-slate-100">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen((o) => !o)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => setView('dashboard')}
              className="flex items-center gap-2.5 text-left cursor-pointer"
            >
              <span className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-sky-600 text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
                #_
              </span>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                How Linux Works
              </span>
            </button>
          </div>

          {/* Zone 2: Single-Line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const active = prefs.lastView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Theme Toggle + Single Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={prefs.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={prefs.theme === 'dark' ? 'Light mode' : 'Dark mode'}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {prefs.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => openChapter(prefs.lastChapter)}
              className="px-3.5 py-2 rounded-lg bg-sky-600 text-white text-xs sm:text-sm font-semibold whitespace-nowrap hover:bg-sky-700 transition-colors cursor-pointer"
            >
              Resume Ch {prefs.lastChapter}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div
          className="lg:hidden fixed inset-0 top-16 z-30 bg-slate-950/50 backdrop-blur-xs"
          onClick={() => setMobileNavOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div
            className="w-80 max-w-[85vw] h-full bg-white dark:bg-[#0B1120] border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-4 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${
                    prefs.lastView === item.id
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
              <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                17 Book Chapters
              </div>
              {ALL_CHAPTERS.map((ch) => {
                const mastery = getMasteryForChapter(ch.number);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => openChapter(ch.number)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs cursor-pointer ${
                      prefs.lastView === 'chapter' && prefs.lastChapter === ch.number
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${DOT_BY_MASTERY[mastery]}`} />
                    <span className="font-mono text-slate-400 w-5">{ch.number}.</span>
                    <span className="truncate">{ch.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex">
        {/* Persistent Chapter Sidebar on Desktop when in Chapter Mode */}
        {prefs.lastView === 'chapter' && (
          <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 sticky top-16 h-[calc(100vh-4rem)]">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Book Chapters (1–17)
              </span>
              <button
                type="button"
                onClick={cycleFontSize}
                title="Cycle reading text size"
                className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300 hover:border-sky-400 cursor-pointer"
              >
                <Type className="w-3 h-3" />
                {prefs.fontSize.toUpperCase()}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2.5 space-y-0.5">
              {ALL_CHAPTERS.map((ch) => {
                const active = ch.number === currentChapter.number;
                const mastery = getMasteryForChapter(ch.number);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => openChapter(ch.number)}
                    className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      active
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-100 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 mt-1 ${DOT_BY_MASTERY[mastery]}`}
                      title={mastery.replace('_', ' ')}
                    />
                    <span className="font-mono text-slate-400 shrink-0 w-5">
                      {String(ch.number).padStart(2, '0')}
                    </span>
                    <span className="leading-snug">{ch.title}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Active View Content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {!hydrated ? (
            <div className="py-20 text-center text-sm text-slate-500 dark:text-slate-400">
              Loading your local study workspace…
            </div>
          ) : prefs.lastView === 'dashboard' ? (
            <Dashboard
              learningState={learningState}
              lastChapter={prefs.lastChapter}
              onOpenChapter={openChapter}
              onNavigate={(v) => setView(v)}
              onImportState={(snap) => {
                setLearningState(snap);
                void saveLearningState(snap);
              }}
            />
          ) : prefs.lastView === 'chapter' ? (
            <ChapterView
              chapter={currentChapter}
              progress={currentProgress}
              mastery={getMasteryForChapter(currentChapter.number)}
              noteContent={learningState.notes[currentChapter.number]?.content ?? ''}
              fontSize={prefs.fontSize}
              onSelectChapter={openChapter}
              onToggleSection={(sectionId) => {
                commitLearningState((prev) => {
                  const rec = ensureChapterRecord(prev.chapterProgress, currentChapter.number);
                  const exists = rec.completedSectionIds.includes(sectionId);
                  const updated = exists
                    ? rec.completedSectionIds.filter((id) => id !== sectionId)
                    : [...rec.completedSectionIds, sectionId];
                  return {
                    ...prev,
                    chapterProgress: {
                      ...prev.chapterProgress,
                      [currentChapter.number]: {
                        ...rec,
                        completedSectionIds: updated,
                        lastVisitedAt: Date.now(),
                      },
                    },
                  };
                });
              }}
              onCompleteLabTask={(taskId) => {
                commitLearningState((prev) => {
                  const rec = ensureChapterRecord(prev.chapterProgress, currentChapter.number);
                  if (rec.completedLabTaskIds.includes(taskId)) return prev;
                  return {
                    ...prev,
                    chapterProgress: {
                      ...prev.chapterProgress,
                      [currentChapter.number]: {
                        ...rec,
                        completedLabTaskIds: [...rec.completedLabTaskIds, taskId],
                        lastVisitedAt: Date.now(),
                      },
                    },
                  };
                });
              }}
              onToggleBookmark={() => {
                commitLearningState((prev) => {
                  const rec = ensureChapterRecord(prev.chapterProgress, currentChapter.number);
                  return {
                    ...prev,
                    chapterProgress: {
                      ...prev.chapterProgress,
                      [currentChapter.number]: {
                        ...rec,
                        isBookmarked: !rec.isBookmarked,
                      },
                    },
                  };
                });
              }}
              onToggleDifficult={() => {
                commitLearningState((prev) => {
                  const rec = ensureChapterRecord(prev.chapterProgress, currentChapter.number);
                  return {
                    ...prev,
                    chapterProgress: {
                      ...prev.chapterProgress,
                      [currentChapter.number]: {
                        ...rec,
                        isDifficult: !rec.isDifficult,
                      },
                    },
                  };
                });
              }}
              onSaveNote={(text) => {
                commitLearningState((prev) => ({
                  ...prev,
                  notes: {
                    ...prev.notes,
                    [currentChapter.number]: {
                      id: `ch-${currentChapter.number}`,
                      chapterNumber: currentChapter.number,
                      content: text,
                      updatedAt: Date.now(),
                    },
                  },
                }));
              }}
              onCompleteAssessment={(result) => {
                commitLearningState((prev) => {
                  const rec = ensureChapterRecord(prev.chapterProgress, currentChapter.number);
                  const best =
                    rec.bestAssessmentScore === null
                      ? result.scorePercent
                      : Math.max(rec.bestAssessmentScore, result.scorePercent);

                  // Deduplicate & update missed items by (chapterNumber, questionId); resolve ones answered right
                  const now = Date.now();
                  const missedIds = new Set(result.incorrectItems.map((i) => i.questionId));
                  const remainingErrors = prev.incorrectAnswers
                    .filter(
                      (existing) =>
                        !(
                          existing.chapterNumber === currentChapter.number &&
                          missedIds.has(existing.questionId)
                        )
                    )
                    .map((existing) =>
                      existing.chapterNumber === currentChapter.number &&
                      !missedIds.has(existing.questionId)
                        ? { ...existing, resolved: true }
                        : existing
                    );

                  const newErrors = result.incorrectItems.map((item) => ({
                    id: `${currentChapter.number}-${item.questionId}-${now}`,
                    chapterNumber: currentChapter.number,
                    questionId: item.questionId,
                    prompt: item.prompt,
                    userAnswer: item.userAnswer,
                    correctSummary: item.correctSummary,
                    explanation: item.explanation,
                    timestamp: now,
                    resolved: false,
                  }));

                  return {
                    ...prev,
                    chapterProgress: {
                      ...prev.chapterProgress,
                      [currentChapter.number]: {
                        ...rec,
                        bestAssessmentScore: best,
                        lastAssessmentScore: result.scorePercent,
                        attemptsCount: rec.attemptsCount + 1,
                        lastVisitedAt: Date.now(),
                      },
                    },
                    assessmentAttempts: [
                      {
                        id: `att-${Date.now()}`,
                        chapterNumber: currentChapter.number,
                        scorePercent: result.scorePercent,
                        correctCount: result.correctCount,
                        totalCount: result.totalCount,
                        timestamp: Date.now(),
                      },
                      ...prev.assessmentAttempts,
                    ],
                    incorrectAnswers: [...newErrors, ...remainingErrors],
                  };
                });
              }}
            />
          ) : prefs.lastView === 'terminal' ? (
            <div className="max-w-5xl mx-auto space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Standalone Simulated Linux Terminal Lab
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Practice commands from across all 17 chapters safely inside a virtual Linux filesystem with inodes, hard links, permissions, pipes, LVM, systemd, iptables, rsync, make, and Docker inspection.
                </p>
              </div>
              <TerminalLab
                title="Open Linux Sandbox"
                intro="Try commands like: ls -la, ls -li, ln notes.txt hard.txt, lsscsi, lvs, df -h, cat /proc/cmdline, systemctl status ssh.service, ip route, iptables -L -n, ss -ntulp, strace ls, rsync -anv project/ backup/, cd project && make, docker ps."
                initialDir="/home/juser"
                standalone
              />
            </div>
          ) : prefs.lastView === 'revision' ? (
            <RevisionCenter
              learningState={learningState}
              onRateFlashcard={(cardId: string, rating: ReviewRating) => {
                commitLearningState((prev) => {
                  const prevCard = prev.flashcards[cardId] ?? createInitialCardState(cardId);
                  return {
                    ...prev,
                    flashcards: {
                      ...prev.flashcards,
                      [cardId]: scheduleNextReview(prevCard, rating),
                    },
                  };
                });
              }}
              onResolveIncorrect={(errorId: string) => {
                commitLearningState((prev) => ({
                  ...prev,
                  incorrectAnswers: prev.incorrectAnswers.map((e) =>
                    e.id === errorId ? { ...e, resolved: true } : e
                  ),
                }));
              }}
              onOpenChapter={openChapter}
            />
          ) : (
            <SourceAuditView onOpenChapter={openChapter} />
          )}
        </main>
      </div>
    </div>
  );
}
