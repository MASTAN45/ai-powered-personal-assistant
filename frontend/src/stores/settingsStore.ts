import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationSettings {
  importantEmails: boolean;
  deadlineReminders: boolean;
  appointmentReminders: boolean;
  lowConfidenceAlerts: boolean;
  pairingNotifications: boolean;
  dailySummary: boolean;
}

interface AISettings {
  enabled: boolean;
  autoClassification: boolean;
  humanReviewThreshold: number;
  defaultTone: 'professional' | 'friendly' | 'formal' | 'concise';
  showExplanations: boolean;
}

interface GeneralSettings {
  language: string;
  timezone: string;
  dateFormat: string;
}

interface SettingsState {
  notifications: NotificationSettings;
  ai: AISettings;
  general: GeneralSettings;
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
  updateAI: (settings: Partial<AISettings>) => void;
  updateGeneral: (settings: Partial<GeneralSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: {
        importantEmails: true,
        deadlineReminders: true,
        appointmentReminders: true,
        lowConfidenceAlerts: true,
        pairingNotifications: true,
        dailySummary: false,
      },
      ai: {
        enabled: true,
        autoClassification: true,
        humanReviewThreshold: 0.6,
        defaultTone: 'professional',
        showExplanations: true,
      },
      general: {
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateFormat: 'MM/DD/YYYY',
      },

      updateNotifications: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),

      updateAI: (settings) =>
        set((state) => ({
          ai: { ...state.ai, ...settings },
        })),

      updateGeneral: (settings) =>
        set((state) => ({
          general: { ...state.general, ...settings },
        })),
    }),
    {
      name: 'settings-storage',
    }
  )
);
