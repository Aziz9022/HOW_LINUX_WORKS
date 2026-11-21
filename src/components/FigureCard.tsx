import React, { useEffect, useState } from 'react';
import { Maximize2, X, ImageOff, Info } from 'lucide-react';
import { BookFigure } from '../data/types';

interface FigureCardProps {
  figure: BookFigure;
  compact?: boolean;
}

export const FigureCard: React.FC<FigureCardProps> = ({ figure, compact = false }) => {
  const [zoomed, setZoomed] = useState(false);
  const [errored, setErrored] = useState(false);

  const baseUrl = import.meta.env.BASE_URL || './';
  const resolvedSrc = `${baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`}${figure.url.replace(/^\/+/, '')}`;

  useEffect(() => {
    if (!zoomed) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomed]);

  return (
    <>
      <figure className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
        <div className="bg-white p-4 sm:p-5 flex items-center justify-center relative group border-b border-slate-200 dark:border-slate-800">
          {!errored ? (
            <>
              <img
                src={resolvedSrc}
                alt={`${figure.number}: ${figure.caption}`}
                loading="lazy"
                onError={() => setErrored(true)}
                onClick={() => setZoomed(true)}
                className={`${
                  compact ? 'max-h-52' : 'max-h-[420px]'
                } w-auto max-w-full object-contain cursor-zoom-in transition-transform duration-200`}
              />
              <button
                type="button"
                onClick={() => setZoomed(true)}
                aria-label={`Zoom ${figure.number}`}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="py-10 px-4 text-center text-slate-500 flex flex-col items-center gap-2">
              <ImageOff className="w-6 h-6 text-slate-400" />
              <div className="text-xs font-mono">
                Original source figure unavailable ({figure.sourceHtmlPath})
              </div>
            </div>
          )}
        </div>
        <figcaption className="px-4 py-3 text-xs space-y-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {figure.number} — {figure.caption}
            </span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              Source: {figure.sourceHtmlPath}
            </span>
          </div>
          {figure.note && (
            <div className="flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 pt-1">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{figure.note}</span>
            </div>
          )}
        </figcaption>
      </figure>

      {zoomed && !errored && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8"
          onClick={() => setZoomed(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${figure.number}: ${figure.caption}`}
        >
          <div
            className="max-w-5xl w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {figure.number}: {figure.caption}
              </div>
              <button
                type="button"
                onClick={() => setZoomed(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close figure preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white p-6 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={resolvedSrc}
                alt={`${figure.number}: ${figure.caption}`}
                className="max-w-full max-h-[68vh] object-contain"
              />
            </div>
            {figure.note && (
              <div className="px-5 py-2.5 bg-amber-50 dark:bg-amber-950/40 text-xs text-amber-800 dark:text-amber-300 border-t border-slate-200 dark:border-slate-800">
                {figure.note}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
