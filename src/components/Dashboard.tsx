import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';
import { ALL_CHAPTERS, ALL_FLASHCARDS } from '../data/contentDatabase';
import { MasteryStatus } from '../data/types';
import {
  computeChapterMastery,
  LearningStateSnapshot,
  mergeLearningSnapshots,
  validateImportedSnapshot,
} from '../storage/db';
import { isCardDue } from '../storage/srs';

interface DashboardProps {
  learningState: LearningStateSnapshot;
  lastChapter: number;
  onOpenChapter: (chapterNum: number) => void;
  onNavigate: (view: 'terminal' | 'revision' | 'audit') => void;
  onImportState: (snapshot: LearningStateSnapshot) => void;
}

const STATUS_META: Record<
  MasteryStatus,
  { label: string; dotClass: string; borderClass: string; textClass: string }
> = {
  not_started: {
    label: 'Not started',
    dotClass: 'bg-slate-300 dark:bg-slate-600',
    borderClass: 'border-slate-200 dark:border-slate-800',
    textClass: 'text-slate-500 dark:text-slate-400',
  },
  in_progress: {
    label: 'In progress',
    dotClass: 'bg-sky-500',
    borderClass: 'border-sky-300 dark:border-sky-800',
    textClass: 'text-sky-700 dark:text-sky-400',
  },
  completed: {
    label: 'Completed',
    dotClass: 'bg-emerald-500',
    borderClass: 'border-emerald-300 dark:border-emerald-800',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
  needs_revision: {
    label: 'Needs revision',
    dotClass: 'bg-amber-500',
    borderClass: 'border-amber-300 dark:border-amber-800',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
};

export const Dashboard: React.FC<DashboardProps> = ({
  learningState,
  lastChapter,
  onOpenChapter,
  onNavigate,
  onImportState,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupMsg, setBackupMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [pendingImport, setPendingImport] = useState<LearningStateSnapshot | null>(null);

  const chapterStatuses = ALL_CHAPTERS.map((ch) => {
    const rec = learningState.chapterProgress[ch.number];
    const unresolvedErrors = learningState.incorrectAnswers.filter(
      (e) => e.chapterNumber === ch.number && !e.resolved
    ).length;
    const mastery = computeChapterMastery(rec, ch.sections.length, unresolvedErrors);
    return { chapter: ch, record: rec, mastery, unresolvedErrors };
  });

  const completedCount = chapterStatuses.filter((c) => c.mastery === 'completed').length;
  const inProgressCount = chapterStatuses.filter((c) => c.mastery === 'in_progress').length;
  const needsRevisionList = chapterStatuses.filter((c) => c.mastery === 'needs_revision');
  const bookmarkedList = chapterStatuses.filter((c) => c.record?.isBookmarked);

  const totalSections = ALL_CHAPTERS.reduce((acc, c) => acc + c.sections.length, 0);
  const studiedSections = ALL_CHAPTERS.reduce(
    (acc, c) => acc + (learningState.chapterProgress[c.number]?.completedSectionIds.length ?? 0),
    0
  );

  const dueFlashcardsCount = ALL_FLASHCARDS.filter((fc) =>
    isCardDue(learningState.flashcards[fc.id])
  ).length;

  const avgScore =
    learningState.assessmentAttempts.length > 0
      ? Math.round(
          learningState.assessmentAttempts.reduce((sum, a) => sum + a.scorePercent, 0) /
            learningState.assessmentAttempts.length
        )
      : null;

  const currentChapterObj =
    ALL_CHAPTERS.find((c) => c.number === lastChapter) || ALL_CHAPTERS[0];

  const handleExport = () => {
    const payload = JSON.stringify(
      { ...learningState, exportedAt: new Date().toISOString() },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `how-linux-works-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMsg({ kind: 'ok', text: 'Exported personal notes, mastery, and SRS history as JSON.' });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const validated = validateImportedSnapshot(parsed);
        if (!validated) {
          setPendingImport(null);
          setBackupMsg({
            kind: 'err',
            text: 'Invalid backup schema. Please choose a valid JSON file exported from this Learning Lab.',
          });
          return;
        }
        setPendingImport(validated);
        setBackupMsg(null);
      } catch {
        setPendingImport(null);
        setBackupMsg({ kind: 'err', text: 'Could not parse JSON file.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const applyPendingImport = (mode: 'merge' | 'replace') => {
    if (!pendingImport) return;
    const nextSnapshot =
      mode === 'merge' ? mergeLearningSnapshots(learningState, pendingImport) : pendingImport;
    onImportState(nextSnapshot);
    setPendingImport(null);
    setBackupMsg({
      kind: 'ok',
      text:
        mode === 'merge'
          ? 'Merged backup with your existing progress, notes, and flashcards.'
          : 'Replaced local progress with the imported backup snapshot.',
    });
  };

  const parts = [
    'Part I: Foundations',
    'Part II: Core System Internals',
    'Part III: Automation, Services & Tooling',
  ] as const;

  return (
    <div className="space-y-8">
      {/* Compact Hero / Current Study Position */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-mono text-sky-700 dark:text-sky-400">
              HOW LINUX WORKS, 3RD EDITION · BRIAN WARD · 17 CHAPTERS · 41 ORIGINAL FIGURES
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Personal Linux Internals Learning Lab
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Study chapter-by-chapter in the book’s exact sequence, manipulate interactive kernel and network visualizers, practice commands inside the simulated terminal, and retain concepts with spaced repetition.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 lg:min-w-[300px] space-y-3">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Current Learning Position
            </div>
            <div>
              <div className="text-xs font-mono text-sky-700 dark:text-sky-400">
                Chapter {currentChapterObj.number} · {currentChapterObj.sectionRange}
              </div>
              <div className="font-semibold text-base text-slate-900 dark:text-slate-100 mt-0.5">
                {currentChapterObj.title}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChapter(currentChapterObj.number)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition-colors cursor-pointer"
            >
              Continue Chapter {currentChapterObj.number}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4 Meaningful KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Chapters Mastered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {completedCount}/17
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({inProgressCount} in progress)
            </span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${(completedCount / 17) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Sections Studied</span>
            <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {studiedSections}/{totalSections}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              ({Math.round((studiedSections / totalSections) * 100)}%)
            </span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all"
              style={{ width: `${(studiedSections / totalSections) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Assessment Average</span>
            <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {avgScore !== null ? `${avgScore}%` : '—'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {learningState.assessmentAttempts.length} attempt{learningState.assessmentAttempts.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Mastery requires ≥ 75% quiz score + all sections studied.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('revision')}
          className="text-left p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-sky-400 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Flashcards Due Today</span>
            <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {dueFlashcardsCount}
            </span>
            <span className="text-xs text-sky-700 dark:text-sky-400 font-medium">
              Open Revision →
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {needsRevisionList.length} chapter{needsRevisionList.length === 1 ? '' : 's'} flagged for revision.
          </p>
        </button>
      </section>

      {/* Complete 17-Chapter Curriculum Matrix */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              17-Chapter Book Curriculum
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Following the exact structure of How Linux Works (3rd Edition)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            {(['not_started', 'in_progress', 'completed', 'needs_revision'] as MasteryStatus[]).map(
              (st) => (
                <span key={st} className="inline-flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${STATUS_META[st].dotClass}`} />
                  {STATUS_META[st].label}
                </span>
              )
            )}
          </div>
        </div>

        <div className="space-y-6">
          {parts.map((partName) => {
            const items = chapterStatuses.filter((c) => c.chapter.part === partName);
            return (
              <div key={partName} className="space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {partName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {items.map(({ chapter, record, mastery }) => {
                    const meta = STATUS_META[mastery];
                    const doneSec = record?.completedSectionIds.length ?? 0;
                    return (
                      <button
                        key={chapter.id}
                        type="button"
                        onClick={() => onOpenChapter(chapter.number)}
                        className={`text-left p-4 rounded-xl border bg-white dark:bg-slate-900/70 hover:border-sky-500 transition-colors flex flex-col justify-between gap-3 cursor-pointer ${meta.borderClass}`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-mono font-semibold text-slate-500 dark:text-slate-400">
                              CH {String(chapter.number).padStart(2, '0')}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 font-medium ${meta.textClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
                              {meta.label}
                            </span>
                          </div>
                          <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                            {chapter.title}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {chapter.subtitle}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                          <span>
                            {doneSec}/{chapter.sections.length} sections
                          </span>
                          <span>
                            {record?.bestAssessmentScore !== null && record?.bestAssessmentScore !== undefined
                              ? `Quiz ${record.bestAssessmentScore}%`
                              : `~${chapter.estimatedMinutes}m`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Revision Alerts, Bookmarks & Local Portability */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Topics Needing Revision
          </div>
          {needsRevisionList.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No chapters currently flagged for revision. Flag tough chapters or complete quizzes to surface weak spots here.
            </p>
          ) : (
            <div className="space-y-2">
              {needsRevisionList.map(({ chapter, unresolvedErrors }) => (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => onOpenChapter(chapter.number)}
                  className="w-full text-left px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 text-xs hover:border-amber-400 cursor-pointer"
                >
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Ch {chapter.number}: {chapter.title}
                  </div>
                  <div className="text-amber-700 dark:text-amber-400 mt-0.5">
                    {unresolvedErrors > 0
                      ? `${unresolvedErrors} missed question(s) to review`
                      : 'Flagged as difficult / below 70% score'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Bookmark className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Saved Bookmarks
          </div>
          {bookmarkedList.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bookmark chapters you want to revisit quickly while studying.
            </p>
          ) : (
            <div className="space-y-2">
              {bookmarkedList.map(({ chapter }) => (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => onOpenChapter(chapter.number)}
                  className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs hover:border-sky-400 cursor-pointer"
                >
                  <span className="font-mono text-sky-700 dark:text-sky-400 mr-2">Ch {chapter.number}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{chapter.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Local Backup &amp; Portability
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All mastery records, personal notes, bookmarks, and spaced-repetition intervals are stored locally in IndexedDB. Export or restore anytime.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
          {pendingImport && (
            <div
              role="region"
              aria-label="Import backup confirmation"
              className="p-3 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 space-y-2 text-xs"
            >
              <div className="font-semibold text-amber-900 dark:text-amber-200">
                Confirm Backup Restore
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Found{' '}
                <strong>{Object.keys(pendingImport.chapterProgress).length}</strong> chapter record(s),{' '}
                <strong>{Object.keys(pendingImport.notes).length}</strong> note(s),{' '}
                <strong>{Object.keys(pendingImport.flashcards).length}</strong> flashcard state(s), and{' '}
                <strong>{pendingImport.assessmentAttempts.length}</strong> quiz attempt(s). Choose whether to merge safely or replace existing data:
              </p>
              <div className="flex flex-wrap gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => applyPendingImport('merge')}
                  className="px-2.5 py-1 rounded bg-sky-600 text-white font-semibold hover:bg-sky-700 cursor-pointer"
                >
                  Merge with Existing
                </button>
                <button
                  type="button"
                  onClick={() => applyPendingImport('replace')}
                  className="px-2.5 py-1 rounded bg-amber-600 text-white font-semibold hover:bg-amber-700 cursor-pointer"
                >
                  Replace All Data
                </button>
                <button
                  type="button"
                  onClick={() => setPendingImport(null)}
                  className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {backupMsg && (
            <div
              aria-live="polite"
              className={`text-xs ${
                backupMsg.kind === 'ok'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {backupMsg.text}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
