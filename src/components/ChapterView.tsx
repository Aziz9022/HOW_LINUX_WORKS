import React, { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  AlertCircle,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  StickyNote,
  BookOpen,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { ChapterModule, MasteryStatus } from '../data/types';
import { FIGURE_MAP } from '../data/figures';
import { ALL_CHAPTERS } from '../data/contentDatabase';
import { ChapterProgressRecord } from '../storage/db';
import { FigureCard } from './FigureCard';
import { VisualizerRouter } from './visualizers/VisualizerRouter';
import { TerminalLab } from './TerminalLab';
import { AssessmentPanel } from './AssessmentPanel';
import { FontSizeScale } from '../storage/preferences';

interface ChapterViewProps {
  chapter: ChapterModule;
  progress: ChapterProgressRecord;
  mastery: MasteryStatus;
  noteContent: string;
  fontSize: FontSizeScale;
  onToggleSection: (sectionId: string) => void;
  onCompleteLabTask: (taskId: string) => void;
  onToggleBookmark: () => void;
  onToggleDifficult: () => void;
  onSaveNote: (text: string) => void;
  onCompleteAssessment: (result: {
    scorePercent: number;
    correctCount: number;
    totalCount: number;
    incorrectItems: Array<{
      questionId: string;
      prompt: string;
      userAnswer: string;
      correctSummary: string;
      explanation: string;
    }>;
  }) => void;
  onSelectChapter: (chapterNum: number) => void;
}

export const ChapterView: React.FC<ChapterViewProps> = ({
  chapter,
  progress,
  mastery,
  noteContent,
  fontSize,
  onToggleSection,
  onCompleteLabTask,
  onToggleBookmark,
  onToggleDifficult,
  onSaveNote,
  onCompleteAssessment,
  onSelectChapter,
}) => {
  const [revealedQuickChecks, setRevealedQuickChecks] = useState<Record<string, boolean>>({});
  const [notesOpen, setNotesOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  const bodySizeClass =
    fontSize === 'lg' ? 'text-base leading-7' : fontSize === 'sm' ? 'text-[13px] leading-6' : 'text-sm leading-6';

  const masteryText: Record<MasteryStatus, { label: string; cls: string }> = {
    not_started: { label: 'Not started', cls: 'text-slate-500 dark:text-slate-400' },
    in_progress: { label: 'In progress', cls: 'text-sky-700 dark:text-sky-400' },
    completed: { label: 'Mastered / Completed', cls: 'text-emerald-700 dark:text-emerald-400' },
    needs_revision: { label: 'Needs revision', cls: 'text-amber-700 dark:text-amber-400' },
  };

  return (
    <article className="space-y-8 max-w-4xl mx-auto">
      {/* Chapter Header */}
      <header className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-7 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            CHAPTER {chapter.number} OF 17 · SECTIONS {chapter.sectionRange} · ~{chapter.estimatedMinutes} MIN ·{' '}
            <span className={`font-semibold ${masteryText[mastery].cls}`}>{masteryText[mastery].label}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onToggleBookmark}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                progress.isBookmarked
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {progress.isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              {progress.isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
            <button
              type="button"
              onClick={onToggleDifficult}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                progress.isDifficult
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {progress.isDifficult ? 'Flagged: Needs Revision' : 'Flag Difficult'}
            </button>
            <button
              type="button"
              onClick={() => setNotesOpen((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                notesOpen || noteContent.trim().length > 0
                  ? 'border-slate-400 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" />
              Notes {noteContent.trim().length > 0 ? '●' : ''}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {chapter.number}. {chapter.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{chapter.subtitle}</p>
        </div>

        <p className={`${bodySizeClass} text-slate-700 dark:text-slate-300`}>{chapter.overview}</p>

        {/* Prerequisites & Learning Objectives */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="md:col-span-8 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Learning Objectives
            </h2>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {chapter.learningObjectives.map((obj) => (
                <li key={obj} className="flex items-start gap-2">
                  <span className="text-sky-600 dark:text-sky-400 font-bold mt-0.5">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-4 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Prerequisites
            </h2>
            {chapter.prerequisites.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                None — ideal starting point for the book.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {chapter.prerequisites.map((preNum) => {
                  const preCh = ALL_CHAPTERS.find((c) => c.number === preNum);
                  return (
                    <button
                      key={preNum}
                      type="button"
                      onClick={() => onSelectChapter(preNum)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-sky-700 dark:text-sky-400 hover:border-sky-400 cursor-pointer text-left"
                    >
                      Ch {preNum}: {preCh?.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Personal Notes Drawer */}
        {notesOpen && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Personal Chapter Notes (auto-saved locally in IndexedDB)
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-mono">
                {noteContent.length} chars
              </span>
            </div>
            <textarea
              rows={4}
              value={noteContent}
              onChange={(e) => onSaveNote(e.target.value)}
              placeholder={`Jot down mental models, tricky commands, or follow-up questions for Chapter ${chapter.number}...`}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>
        )}
      </header>

      {/* Concept-by-Concept Book-Grounded Sections */}
      <section className="space-y-6">
        {chapter.sections.map((sec) => {
          const isDone = progress.completedSectionIds.includes(sec.id);
          const figs = (sec.figureIds ?? [])
            .map((fid) => FIGURE_MAP[fid])
            .filter(Boolean);

          return (
            <div
              key={sec.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-mono text-sky-700 dark:text-sky-400">
                    SECTION {sec.number} · BOOK-GROUNDED EXPLANATION
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {sec.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleSection(sec.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    isDone
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  {isDone ? 'Section Studied' : 'Mark Studied'}
                </button>
              </div>

              <div className="p-6 space-y-5">
                {sec.subsections && sec.subsections.length > 0 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Book topics covered:</span>
                    {sec.subsections.map((sub) => (
                      <span key={sub}>{sub}</span>
                    ))}
                  </div>
                )}

                <p className={`${bodySizeClass} font-medium text-slate-900 dark:text-slate-100`}>
                  {sec.bookGroundedSummary}
                </p>

                <div className={`space-y-3 ${bodySizeClass} text-slate-700 dark:text-slate-300`}>
                  {sec.detailedExplanation.map((para, i) => (
                    <p key={i} className="whitespace-pre-line">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Book Reference Table */}
                {sec.table && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {sec.table.number}: {sec.table.title}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900">
                            {sec.table.headers.map((h) => (
                              <th key={h} className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                          {sec.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="bg-white dark:bg-slate-900/40">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`px-4 py-2.5 ${
                                    cIdx === 0
                                      ? 'font-mono font-semibold text-sky-700 dark:text-sky-400'
                                      : 'text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Original Book Illustrations */}
                {figs.length > 0 && (
                  <div className={`grid grid-cols-1 ${figs.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
                    {figs.map((fig) => (
                      <FigureCard key={fig.id} figure={fig} compact={figs.length > 1} />
                    ))}
                  </div>
                )}

                {/* Practical Command Examples */}
                {sec.codeExamples &&
                  sec.codeExamples.map((ex) => (
                    <div
                      key={ex.title}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                      <div className="px-4 py-2 bg-slate-100/80 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{ex.title}</span>
                        {ex.isSupplemental && (
                          <span className="font-mono text-[11px] text-amber-700 dark:text-amber-400">
                            [Supplemental]
                          </span>
                        )}
                      </div>
                      <pre className="p-4 bg-[#0D1117] text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed">
                        {`$ ${ex.command}${ex.output ? `\n\n${ex.output}` : ''}`}
                      </pre>
                      <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400">
                        {ex.explanation}
                      </div>
                    </div>
                  ))}

                {/* Clearly Labeled Supplemental Explanation (Hairline bordered, zero border-l-4) */}
                {sec.supplementalNote && (
                  <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/70 bg-amber-50/50 dark:bg-amber-950/20 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      [Supplemental Context — Beyond Original Book Text]
                    </div>
                    <p className="text-xs sm:text-sm text-amber-950/90 dark:text-amber-200/90 leading-relaxed">
                      {sec.supplementalNote}
                    </p>
                  </div>
                )}

                {sec.sourceNotes && sec.sourceNotes.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {sec.sourceNotes.map((sn) => (
                      <p key={sn}>{sn}</p>
                    ))}
                  </div>
                )}

                {/* Quick Knowledge Check Reveal */}
                {sec.quickCheck && (
                  <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                        <HelpCircle className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                        <span>Quick Check: {sec.quickCheck.prompt}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedQuickChecks((prev) => ({ ...prev, [sec.id]: !prev[sec.id] }))
                        }
                        className="shrink-0 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        {revealedQuickChecks[sec.id] ? 'Hide Answer' : 'Reveal Answer'}
                      </button>
                    </div>
                    {revealedQuickChecks[sec.id] && (
                      <p className="pl-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1 border-t border-sky-200/60 dark:border-sky-900/50">
                        {sec.quickCheck.answer}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Chapter-Specific Interactive Visual Sandbox (only for chapters where appropriate) */}
      {chapter.visualizerId && (
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Interactive Conceptual Lab
          </h2>
          <VisualizerRouter visualizerId={chapter.visualizerId} />
        </section>
      )}

      {/* Chapter-Scoped Simulated Linux Terminal Lab */}
      <section className="space-y-2">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Hands-On Terminal Practice
        </h2>
        <TerminalLab
          title={`Chapter ${chapter.number} Terminal Lab`}
          intro={chapter.terminalLab.intro}
          initialDir={chapter.terminalLab.initialDir}
          tasks={chapter.terminalLab.tasks}
          completedTaskIds={progress.completedLabTaskIds}
          onCompleteTask={onCompleteLabTask}
        />
      </section>

      {/* Multi-Format Chapter Assessment */}
      <section>
        <AssessmentPanel
          key={chapter.id}
          chapterNumber={chapter.number}
          questions={chapter.assessments}
          bestScore={progress.bestAssessmentScore}
          onCompleteAttempt={onCompleteAssessment}
        />
      </section>

      {/* Key Takeaways & Glossary */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Chapter {chapter.number} Key Takeaways
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            {chapter.keyTakeaways.map((tk) => (
              <li key={tk} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{tk}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-3">
          <button
            type="button"
            onClick={() => setGlossaryOpen((g) => !g)}
            className="w-full flex items-center justify-between text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            <span>Key Terminology ({chapter.glossary.length})</span>
            {glossaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <div className="space-y-2.5">
            {(glossaryOpen ? chapter.glossary : chapter.glossary.slice(0, 3)).map((g) => (
              <div key={g.term} className="text-xs space-y-0.5">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {g.term}{' '}
                  <span className="font-mono font-normal text-slate-400">({g.sectionRef})</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{g.definition}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Previous / Next Chapter Navigation */}
      <nav className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        {chapter.number > 1 ? (
          <button
            type="button"
            onClick={() => onSelectChapter(chapter.number - 1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:border-sky-400 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous: Ch {chapter.number - 1}
          </button>
        ) : (
          <div />
        )}
        {chapter.number < 17 ? (
          <button
            type="button"
            onClick={() => onSelectChapter(chapter.number + 1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white text-xs sm:text-sm font-semibold hover:bg-sky-700 cursor-pointer"
          >
            Next: Ch {chapter.number + 1}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            Final Chapter of How Linux Works (3rd Ed.)
          </div>
        )}
      </nav>
    </article>
  );
};
