export interface FlashcardReviewState {
  cardId: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  dueAt: number; // epoch ms
  lastReviewedAt?: number;
}

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

const DAY_MS = 24 * 60 * 60 * 1000;

export function createInitialCardState(cardId: string): FlashcardReviewState {
  return {
    cardId,
    intervalDays: 0,
    easeFactor: 2.5,
    repetitions: 0,
    dueAt: 0,
  };
}

/**
 * SM-2 inspired spaced-repetition scheduler for long-term retention.
 */
export function scheduleNextReview(
  prev: FlashcardReviewState,
  rating: ReviewRating,
  now = Date.now()
): FlashcardReviewState {
  let { intervalDays, easeFactor, repetitions } = prev;

  if (rating === 'again') {
    repetitions = 0;
    intervalDays = 0;
    easeFactor = Number(Math.max(1.3, easeFactor - 0.2).toFixed(2));
    return {
      cardId: prev.cardId,
      intervalDays: 0,
      easeFactor,
      repetitions,
      lastReviewedAt: now,
      dueAt: now + 10 * 60 * 1000, // review again in 10 minutes
    };
  }

  if (rating === 'hard') {
    repetitions = Math.max(1, repetitions);
    intervalDays = intervalDays === 0 ? 1 : Math.max(1, Math.round(intervalDays * 1.2));
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (rating === 'good') {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 4;
    else intervalDays = Math.round(intervalDays * easeFactor);
  } else {
    // easy
    repetitions += 1;
    if (repetitions === 1) intervalDays = 3;
    else intervalDays = Math.round(Math.max(4, intervalDays * easeFactor * 1.3));
    easeFactor = Math.min(3.0, easeFactor + 0.15);
  }

  return {
    cardId: prev.cardId,
    intervalDays,
    easeFactor: Number(easeFactor.toFixed(2)),
    repetitions,
    lastReviewedAt: now,
    dueAt: now + intervalDays * DAY_MS,
  };
}

export function isCardDue(state: FlashcardReviewState | undefined, now = Date.now()): boolean {
  if (!state) return true;
  return state.dueAt <= now;
}

export function formatNextInterval(rating: ReviewRating, prev: FlashcardReviewState): string {
  const next = scheduleNextReview(prev, rating, 0);
  if (rating === 'again') return '10m';
  if (next.intervalDays === 1) return '1d';
  return `${next.intervalDays}d`;
}
