import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Bookmark,
  StickyNote,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { ALL_CHAPTERS, ALL_FLASHCARDS } from '../data/contentDatabase';
import { LearningStateSnapshot } from '../storage/db';
import {
  createInitialCardState,
  formatNextInterval,
  isCardDue,
  ReviewRating,
} from '../storage/srs';

interface RevisionCenterProps {
  learningState: LearningStateSnapshot;
  onRateFlashcard: (cardId: string, rating: ReviewRating) => void;
  onResolveIncorrect: (errorId: string) => void;
  onOpenChapter: (chapterNum: number) => void;
}

export const RevisionCenter: React.FC<RevisionCenterProps> = ({
  learningState,
  onRateFlashcard,
  onResolveIncorrect,
  onOpenChapter,
}) => {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'errors' | 'notes' | 'bookmarks'>('flashcards');
  const [chapterFilter, setChapterFilter] = useState<number>(0); // 0 = all
  const [flipped, setFlipped] = useState(false);
  const [noteQuery, setNoteQuery] = useState('');

  const filteredCards = ALL_FLASHCARDS.filter(
    (c) => chapterFilter === 0 || c.chapterNumber === chapterFilter
  );
  const dueCards = filteredCards.filter((c) => isCardDue(learningState.flashcards[c.id]));
  const activeCard = dueCards[0] ?? null;
  const activeCardState = activeCard
    ? learningState.flashcards[activeCard.id] ?? createInitialCardState(activeCard.id)
    : null;

  const unresolvedErrors = learningState.incorrectAnswers.filter((e) => !e.resolved);
  const resolvedErrors = learningState.incorrectAnswers.filter((e) => e.resolved);

  const savedNotes = Object.values(learningState.notes)
    .filter((n) => n.content.trim().length > 0)
    .filter((n) =>
      noteQuery.trim()
        ? n.content.toLowerCase().includes(noteQuery.toLowerCase()) ||
          `chapter ${n.chapterNumber}`.includes(noteQuery.toLowerCase())
        : true
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const bookmarkedChapters = ALL_CHAPTERS.filter(
    (ch) => learningState.chapterProgress[ch.number]?.isBookmarked
  );
  const difficultChapters = ALL_CHAPTERS.filter(
    (ch) => learningState.chapterProgress[ch.number]?.isDifficult
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Personal Revision &amp; Spaced Repetition Center
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Reinforce long-term Linux internals retention with SM-2 flashcards, error reviews, bookmarks, and notes.
          </p>
        </div>

        <div className="flex flex-wrap items-center rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-white dark:bg-slate-900">
          {(
            [
              { id: 'flashcards', label: `Flashcards (${dueCards.length} due)` },
              { id: 'errors', label: `Missed Answers (${unresolvedErrors.length})` },
              { id: 'notes', label: `Notes (${savedNotes.length})` },
              { id: 'bookmarks', label: `Bookmarks & Flags` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === t.id
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SPACED-REPETITION FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <label className="font-medium text-slate-600 dark:text-slate-400">Filter by chapter:</label>
              <select
                value={chapterFilter}
                onChange={(e) => {
                  setChapterFilter(Number(e.target.value));
                  setFlipped(false);
                }}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value={0}>All 17 Chapters ({ALL_FLASHCARDS.length} cards)</option>
                {ALL_CHAPTERS.map((ch) => (
                  <option key={ch.id} value={ch.number}>
                    Ch {ch.number}: {ch.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              {dueCards.length} due · {filteredCards.length - dueCards.length} scheduled for later
            </div>
          </div>

          {activeCard && activeCardState ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
              <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>
                  Chapter {activeCard.chapterNumber} · Section {activeCard.sectionRef}
                </span>
                <span>Reviews completed: {activeCardState.repetitions}</span>
              </div>

              <div className="p-8 sm:p-10 min-h-[260px] flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                    Question
                  </div>
                  <p className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                    {activeCard.front}
                  </p>
                </div>

                {flipped ? (
                  <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-5">
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Answer
                      </div>
                      <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                        {activeCard.back}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        How well did you recall this concept?
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(
                          [
                            { r: 'again', label: 'Again', cls: 'border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40' },
                            { r: 'hard', label: 'Hard', cls: 'border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40' },
                            { r: 'good', label: 'Good', cls: 'border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/40' },
                            { r: 'easy', label: 'Easy', cls: 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40' },
                          ] as const
                        ).map((btn) => (
                          <button
                            key={btn.r}
                            type="button"
                            onClick={() => {
                              onRateFlashcard(activeCard.id, btn.r);
                              setFlipped(false);
                            }}
                            className={`px-3 py-2.5 rounded-xl border font-semibold text-xs flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${btn.cls}`}
                          >
                            <span>{btn.label}</span>
                            <span className="font-mono text-[11px] opacity-80">
                              {formatNextInterval(btn.r, activeCardState)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setFlipped(true)}
                      className="px-5 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition-colors cursor-pointer"
                    >
                      Reveal Answer
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                All due flashcards reviewed!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Your spaced-repetition queue for this filter is caught up. Cards will reappear automatically when their next SM-2 review interval arrives.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCORRECT ANSWERS HISTORY */}
      {activeTab === 'errors' && (
        <div className="space-y-4">
          {unresolvedErrors.length === 0 ? (
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 text-center space-y-2">
              <RotateCcw className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                Zero unresolved mistakes
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Whenever you miss a chapter assessment question, it appears here with its explanation so you can review and resolve it.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {unresolvedErrors.map((err) => (
                <div
                  key={err.id}
                  className="p-5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900/70 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" />
                      Chapter {err.chapterNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenChapter(err.chapterNumber)}
                        className="text-sky-700 dark:text-sky-400 hover:underline font-medium cursor-pointer"
                      >
                        Review Chapter
                      </button>
                      <button
                        type="button"
                        onClick={() => onResolveIncorrect(err.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 cursor-pointer"
                      >
                        Mark Understood
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{err.prompt}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300">
                      Your answer: {err.userAnswer}
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300">
                      Expected: {err.correctSummary}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {err.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}

          {resolvedErrors.length > 0 && (
            <div className="text-xs text-slate-500 dark:text-slate-400 pt-2">
              {resolvedErrors.length} previously missed item{resolvedErrors.length === 1 ? '' : 's'} resolved.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PERSONAL NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={noteQuery}
              onChange={(e) => setNoteQuery(e.target.value)}
              placeholder="Search your chapter notes..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          {savedNotes.length === 0 ? (
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 text-center space-y-2">
              <StickyNote className="w-6 h-6 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">No notes yet</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Open any chapter and click “Notes” in the chapter header to write personal study notes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedNotes.map((note) => {
                const ch = ALL_CHAPTERS.find((c) => c.number === note.chapterNumber);
                return (
                  <div
                    key={note.id}
                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => onOpenChapter(note.chapterNumber)}
                        className="text-sm font-bold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        Ch {note.chapterNumber}: {ch?.title}
                      </button>
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BOOKMARKS & DIFFICULT TOPICS */}
      {activeTab === 'bookmarks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Bookmarked Chapters ({bookmarkedChapters.length})
            </h3>
            {bookmarkedChapters.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">No bookmarks saved yet.</p>
            ) : (
              <div className="space-y-2">
                {bookmarkedChapters.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => onOpenChapter(ch.number)}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-sky-400 text-xs cursor-pointer"
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      Ch {ch.number}: {ch.title}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">{ch.subtitle}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Difficult Topics Queue ({difficultChapters.length})
            </h3>
            {difficultChapters.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">No chapters flagged as difficult.</p>
            ) : (
              <div className="space-y-2">
                {difficultChapters.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => onOpenChapter(ch.number)}
                    className="w-full text-left p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 hover:border-amber-400 text-xs cursor-pointer"
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      Ch {ch.number}: {ch.title}
                    </div>
                    <div className="text-amber-700 dark:text-amber-400 mt-0.5">
                      Flagged for deeper review
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
