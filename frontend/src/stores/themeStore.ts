import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type Density = 'comfortable' | 'compact';

interface ThemeState {
  theme: Theme;
  density: Density;
  reducedMotion: boolean;
  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
  setReducedMotion: (reduced: boolean) => void;
  getEffectiveTheme: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      density: 'comfortable',
      reducedMotion: false,

      setTheme: (theme) => {
        set({ theme });
        applyTheme(get().getEffectiveTheme());
      },

      setDensity: (density) => set({ density }),

      setReducedMotion: (reduced) => set({ reducedMotion: reduced }),

      getEffectiveTheme: () => {
        const state = get();
        if (state.theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return state.theme;
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.getEffectiveTheme());
        }
      },
    }
  )
);

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.setAttribute('data-theme', theme);
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const state = useThemeStore.getState();
    if (state.theme === 'system') {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}
