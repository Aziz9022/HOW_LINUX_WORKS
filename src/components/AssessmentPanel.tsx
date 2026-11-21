import React, { useState } from 'react';
import { CheckCircle2, XCircle, Lightbulb, RotateCcw, Award } from 'lucide-react';
import { AssessmentQuestion, QuestionType } from '../data/types';

interface AssessmentPanelProps {
  chapterNumber: number;
  questions: AssessmentQuestion[];
  bestScore: number | null;
  onCompleteAttempt: (result: {
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
}

const TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'Multiple Choice',
  true_false: 'True / False',
  fill_blank: 'Fill in the Blank',
  command_write: 'Command Writing',
  output_interpret: 'Output Interpretation',
  debug: 'Debugging',
  scenario: 'Practical Scenario',
  short_answer: 'Conceptual Short Answer',
};

function normalizeText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function evaluateQuestion(q: AssessmentQuestion, answer: string | number | undefined): boolean {
  if (answer === undefined || answer === '') return false;

  if (q.options && typeof q.correctOptionIndex === 'number') {
    return Number(answer) === q.correctOptionIndex;
  }

  const text = normalizeText(String(answer));

  if (q.type === 'short_answer' && q.rubricKeywords && q.rubricKeywords.length > 0) {
    const matched = q.rubricKeywords.filter((kw) => text.includes(kw.toLowerCase()));
    return matched.length >= Math.ceil(q.rubricKeywords.length * 0.6);
  }

  if (q.acceptedAnswers && q.acceptedAnswers.length > 0) {
    return q.acceptedAnswers.some((acc) => normalizeText(acc) === text);
  }

  return false;
}

function getCorrectSummary(q: AssessmentQuestion): string {
  if (q.options && typeof q.correctOptionIndex === 'number') {
    return q.options[q.correctOptionIndex];
  }
  if (q.acceptedAnswers && q.acceptedAnswers.length > 0) {
    return q.acceptedAnswers[0];
  }
  return q.explanation;
}

export const AssessmentPanel: React.FC<AssessmentPanelProps> = ({
  questions,
  bestScore,
  onCompleteAttempt,
}) => {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});

  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    return a !== undefined && String(a).trim() !== '';
  }).length;

  const handleSubmit = () => {
    let correctCount = 0;
    const incorrectItems: Array<{
      questionId: string;
      prompt: string;
      userAnswer: string;
      correctSummary: string;
      explanation: string;
    }> = [];

    for (const q of questions) {
      const a = answers[q.id];
      const ok = evaluateQuestion(q, a);
      if (ok) {
        correctCount += 1;
      } else {
        const readableUserAns =
          q.options && typeof a === 'number'
            ? q.options[a]
            : a !== undefined && String(a).trim() !== ''
              ? String(a)
              : '(No answer)';
        incorrectItems.push({
          questionId: q.id,
          prompt: q.prompt,
          userAnswer: readableUserAns,
          correctSummary: getCorrectSummary(q),
          explanation: q.explanation,
        });
      }
    }

    const scorePercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    setSubmitted(true);
    onCompleteAttempt({
      scorePercent,
      correctCount,
      totalCount: questions.length,
      incorrectItems,
    });
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setOpenHints({});
  };

  const correctTotal = submitted
    ? questions.filter((q) => evaluateQuestion(q, answers[q.id])).length
    : 0;
  const currentScore =
    submitted && questions.length > 0 ? Math.round((correctTotal / questions.length) * 100) : 0;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900">
        <div>
          <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Chapter Assessment ({questions.length} Questions)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Score 75% or higher alongside completing all sections to reach full chapter mastery.
          </p>
        </div>
        {bestScore !== null && (
          <div className="text-xs font-mono text-slate-700 dark:text-slate-300 tabular-nums">
            Best Score: <strong className={bestScore >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{bestScore}%</strong>
          </div>
        )}
      </div>

      <div className="p-5 space-y-6">
        {questions.map((q, idx) => {
          const userVal = answers[q.id];
          const isCorrect = submitted ? evaluateQuestion(q, userVal) : null;

          return (
            <div
              key={q.id}
              className={`p-4 sm:p-5 rounded-xl border space-y-3 ${
                submitted
                  ? isCorrect
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/15'
                    : 'border-rose-300 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/15'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/30'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono text-slate-500 dark:text-slate-400">
                  Q{idx + 1} · {TYPE_LABELS[q.type]} · Section {q.sectionRef}
                </span>
                <button
                  type="button"
                  onClick={() => setOpenHints((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                  className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  {openHints[q.id] ? 'Hide Hint' : 'Hint'}
                </button>
              </div>

              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                {q.prompt}
              </p>

              {q.codeBlock && (
                <pre className="p-3 rounded-lg bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto">
                  {q.codeBlock}
                </pre>
              )}

              {openHints[q.id] && (
                <div className="px-3 py-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 text-xs text-sky-900 dark:text-sky-200">
                  <strong>Hint:</strong> {q.hint}
                </div>
              )}

              {/* Option-based input */}
              {q.options ? (
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const selected = userVal === optIdx;
                    const isRightOpt = q.correctOptionIndex === optIdx;
                    let optClass =
                      'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-400';
                    if (submitted) {
                      if (isRightOpt) {
                        optClass =
                          'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-medium';
                      } else if (selected && !isRightOpt) {
                        optClass =
                          'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100';
                      }
                    } else if (selected) {
                      optClass =
                        'border-sky-600 bg-sky-50 dark:bg-sky-950/50 text-sky-950 dark:text-sky-100 font-medium';
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={submitted}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-sm transition-colors flex items-start gap-2.5 ${optClass} ${
                          submitted ? 'cursor-default' : 'cursor-pointer'
                        }`}
                      >
                        <span className="font-mono text-xs mt-0.5 opacity-70">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              ) : q.type === 'short_answer' ? (
                <textarea
                  rows={3}
                  disabled={submitted}
                  value={String(userVal ?? '')}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  aria-label={`Answer for question ${idx + 1}`}
                  placeholder="Write a concise conceptual explanation covering the core mechanisms..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              ) : (
                <input
                  type="text"
                  disabled={submitted}
                  value={String(userVal ?? '')}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  aria-label={`Answer for question ${idx + 1}`}
                  placeholder={
                    q.type === 'command_write'
                      ? 'Type the exact Linux command...'
                      : 'Type your answer...'
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 font-mono text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              )}

              {submitted && (
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-700 dark:text-emerald-400">Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span className="text-rose-700 dark:text-rose-400">
                          Not quite — Expected: <code className="font-mono">{getCorrectSummary(q)}</code>
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Submit / Result Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          {!submitted ? (
            <>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Answered {answeredCount} of {questions.length} questions
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={answeredCount === 0}
                className="px-5 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-40 transition-colors cursor-pointer"
              >
                Check Assessment Answers
              </button>
            </>
          ) : (
            <div
              role="status"
              aria-live="polite"
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  Result: {correctTotal}/{questions.length} ({currentScore}%) —{' '}
                  <span
                    className={
                      currentScore >= 75
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }
                  >
                    {currentScore >= 75 ? 'PASSED MASTERY THRESHOLD' : 'NEEDS REVISION (<75%)'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {currentScore >= 75
                    ? 'Strong conceptual grasp. Review any missed explanations or advance to the next chapter.'
                    : 'Any missed items have been added to your Revision Center incorrect-answer log.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry Assessment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
