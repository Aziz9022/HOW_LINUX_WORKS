import React, { useState } from 'react';
import { FileCheck2, AlertTriangle, Image, Terminal } from 'lucide-react';
import { CONTENT_DATABASE } from '../data/contentDatabase';
import { FigureCard } from './FigureCard';

interface SourceAuditViewProps {
  onOpenChapter: (chapterNum: number) => void;
}

export const SourceAuditView: React.FC<SourceAuditViewProps> = ({ onOpenChapter }) => {
  const [figChapterFilter, setFigChapterFilter] = useState<number>(0);

  const visibleFigures = CONTENT_DATABASE.figures.filter(
    (f) => figChapterFilter === 0 || f.chapterNumber === figChapterFilter
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-2">
        <div className="text-xs font-mono text-sky-700 dark:text-sky-400">
          STAGE 1 SOURCE AUDIT · VERIFIED AGAINST SUPPLIED HTML, CSS &amp; 41 PNG FIGURES
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Source Manifest, Figure Catalog &amp; Limitations
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Authority: <strong>{CONTENT_DATABASE.meta.bookTitle}</strong> ({CONTENT_DATABASE.meta.edition}) by{' '}
          {CONTENT_DATABASE.meta.author} ({CONTENT_DATABASE.meta.publisher}, {CONTENT_DATABASE.meta.year}). Root project files{' '}
          <code className="font-mono text-xs">SOURCE_MANIFEST.md</code>,{' '}
          <code className="font-mono text-xs">CURRICULUM.md</code>, and{' '}
          <code className="font-mono text-xs">CONTENT_DATABASE.json</code> mirror this audit.
        </p>
      </header>

      {/* Processing Ledger */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            17-Chapter Source Audit Ledger
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400">
                <th className="px-4 py-2.5 font-semibold">Ch</th>
                <th className="px-4 py-2.5 font-semibold">Exact Book Title</th>
                <th className="px-4 py-2.5 font-semibold">Sections</th>
                <th className="px-4 py-2.5 font-semibold">Figures</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
              {CONTENT_DATABASE.chapters.map((ch) => {
                const figCount = CONTENT_DATABASE.figures.filter(
                  (f) => f.chapterNumber === ch.number
                ).length;
                return (
                  <tr
                    key={ch.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-mono font-semibold text-slate-500">{ch.number}</td>
                    <td className="px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() => onOpenChapter(ch.number)}
                        className="font-semibold text-sky-700 dark:text-sky-400 hover:underline text-left cursor-pointer"
                      >
                        {ch.title}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-400">
                      {ch.sectionRange}
                    </td>
                    <td className="px-4 py-2.5 font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      {figCount}
                    </td>
                    <td className="px-4 py-2.5 font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                      {ch.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Verified Limitations & Anomalies */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Verified Source Limitations, Missing Non-Instructional Assets &amp; Errata
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CONTENT_DATABASE.anomalies.map((anom) => (
            <div
              key={anom.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                  {anom.category}
                </span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {anom.location}
                </span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{anom.description}</p>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
                <strong className="text-slate-700 dark:text-slate-300">Handled:</strong> {anom.resolution}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Complete 41-Figure Gallery */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Complete Original Book Illustrations ({visibleFigures.length}/41)
            </h2>
          </div>
          <select
            value={figChapterFilter}
            onChange={(e) => setFigChapterFilter(Number(e.target.value))}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value={0}>All Chapters (41 figures)</option>
            {Array.from(new Set(CONTENT_DATABASE.figures.map((f) => f.chapterNumber))).map((chNum) => (
              <option key={chNum} value={chNum}>
                Chapter {chNum}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleFigures.map((fig) => (
            <FigureCard key={fig.id} figure={fig} compact />
          ))}
        </div>
      </section>

      {/* Local Execution & GitHub Pages Instructions */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Terminal className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          Local Setup, Production Build &amp; GitHub Pages Deployment
        </div>
        <pre className="p-4 rounded-xl bg-[#0D1117] text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`# 1. Install dependencies locally (Node 20+)
npm install

# 2. Run locally in development (http://localhost:3000)
npm run dev

# 3. Build static production bundle (no backend or API keys required)
npm run build
npm run preview

# 4. Deploy static dist/ to GitHub Pages
# Set base: './' in vite.config.ts if deploying under a subpath (e.g. /repo-name/),
# then publish dist/ via GitHub Actions or gh-pages.`}
        </pre>
      </section>
    </div>
  );
};
