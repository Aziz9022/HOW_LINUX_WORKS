import { CHAPTERS_1_TO_4 } from './chapters1to4';
import { CHAPTERS_5_TO_8 } from './chapters5to8';
import { CHAPTERS_9_TO_12 } from './chapters9to12';
import { CHAPTERS_13_TO_17 } from './chapters13to17';
import { BOOK_FIGURES } from './figures';
import { SOURCE_ANOMALIES } from './sourceAudit';
import { ChapterModule, ContentDatabase, FlashcardItem } from './types';

export const ALL_CHAPTERS: ChapterModule[] = [
  ...CHAPTERS_1_TO_4,
  ...CHAPTERS_5_TO_8,
  ...CHAPTERS_9_TO_12,
  ...CHAPTERS_13_TO_17,
];

export const ALL_FLASHCARDS: FlashcardItem[] = ALL_CHAPTERS.flatMap(
  (ch) => ch.flashcards
);

export const CONTENT_DATABASE: ContentDatabase = {
  meta: {
    bookTitle: 'How Linux Works: What Every Superuser Should Know',
    edition: '3rd Edition',
    author: 'Brian Ward',
    publisher: 'No Starch Press',
    year: 2021,
    generatedAt: '2026-11-21',
    totalChapters: ALL_CHAPTERS.length,
    totalFigures: BOOK_FIGURES.length,
    auditStatus: 'VALIDATED',
  },
  figures: BOOK_FIGURES,
  anomalies: SOURCE_ANOMALIES,
  chapters: ALL_CHAPTERS,
};

export function getChapterByNumber(num: number): ChapterModule | undefined {
  return ALL_CHAPTERS.find((c) => c.number === num);
}
