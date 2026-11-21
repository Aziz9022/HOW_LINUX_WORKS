export type ThemeMode = 'light' | 'dark';
export type FontSizeScale = 'sm' | 'md' | 'lg';
export type AppView = 'dashboard' | 'chapter' | 'terminal' | 'revision' | 'audit';

export interface UserPreferences {
  theme: ThemeMode;
  fontSize: FontSizeScale;
  lastChapter: number;
  lastView: AppView;
}

const PREFS_KEY = 'hlw_learning_lab_prefs_v1';

const DEFAULT_PREFS: UserPreferences = {
  theme: 'light',
  fontSize: 'md',
  lastChapter: 1,
  lastView: 'dashboard',
};

export function loadPreferences(): UserPreferences {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) {
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      return { ...DEFAULT_PREFS, theme: prefersDark ? 'dark' : 'light' };
    }
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      fontSize:
        parsed.fontSize === 'sm' || parsed.fontSize === 'lg' ? parsed.fontSize : 'md',
      lastChapter:
        typeof parsed.lastChapter === 'number' &&
        parsed.lastChapter >= 1 &&
        parsed.lastChapter <= 17
          ? parsed.lastChapter
          : 1,
      lastView:
        parsed.lastView === 'chapter' ||
        parsed.lastView === 'terminal' ||
        parsed.lastView === 'revision' ||
        parsed.lastView === 'audit'
          ? parsed.lastView
          : 'dashboard',
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota / private mode failures
  }
}
