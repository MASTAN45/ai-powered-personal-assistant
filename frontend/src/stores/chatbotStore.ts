import { create } from 'zustand';
import api from '../services/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: 'gemini' | 'fallback';
  model?: string;
  createdAt: Date;
}

export interface ChatSession {
  _id: string;
  title: string;
  messageCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PendingAction {
  id: string;
  type: 'write' | 'read';
  operation: string;
  description: string;
  data: any;
  createdAt: Date;
}

interface ChatbotState {
  isOpen: boolean;
  isMinimized: boolean;
  currentSessionId: string | null;
  messages: ChatMessage[];
  sessions: ChatSession[];
  isLoading: boolean;
  error: string | null;
  providerStatus: {
    available: boolean;
    provider: string;
    model?: string;
  } | null;
  pendingAction: PendingAction | null;

  // Actions
  toggleOpen: () => void;
  toggleMinimize: () => void;
  setOpen: (open: boolean) => void;
  sendMessage: (content: string, conversationId?: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  newSession: () => void;
  deleteSession: (sessionId: string) => Promise<void>;
  getProviderStatus: () => Promise<void>;
  confirmAction: () => Promise<void>;
  cancelAction: () => void;
}

export const useChatbotStore = create<ChatbotState>((set, get) => ({
  isOpen: false,
  isMinimized: false,
  currentSessionId: null,
  messages: [],
  sessions: [],
  isLoading: false,
  error: null,
  providerStatus: null,
  pendingAction: null,

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen, isMinimized: false })),
  toggleMinimize: () => set((state) => ({ isMinimized: !state.isMinimized })),
  setOpen: (open: boolean) => set({ isOpen: open, isMinimized: false }),

  sendMessage: async (content: string, conversationId?: string) => {
    const { currentSessionId, messages } = get();
    set({ isLoading: true, error: null });

    // Optimistically add user message
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date(),
    };

    set({ messages: [...messages, tempUserMessage] });

    try {
      const response = await api.post('/chat/message', {
        sessionId: currentSessionId,
        message: content,
        conversationId,
      });

      const assistantMessage: ChatMessage = {
        id: response.data.message.id,
        role: 'assistant',
        content: response.data.message.content,
        provider: response.data.message.provider,
        model: response.data.message.model,
        createdAt: new Date(response.data.message.createdAt),
      };

      // Check if response contains a pending action
      if (response.data.pendingAction) {
        const action = response.data.pendingAction;
        set({
          pendingAction: {
            id: action.id,
            type: action.type,
            operation: action.operation,
            description: action.description,
            data: action.data,
            createdAt: new Date(),
          },
        });
      }

      // Update state with confirmed session ID and messages
      set((state) => ({
        currentSessionId: response.data.sessionId,
        messages: [
          ...state.messages.filter((m: ChatMessage) => m.id !== tempUserMessage.id),
          { ...tempUserMessage, id: `user-${Date.now()}` },
          assistantMessage,
        ],
        isLoading: false,
        error: null,
      }));

      // Refresh sessions list
      get().loadSessions();
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to send message',
        isLoading: false,
        messages: messages, // Revert optimistic update
      });
    }
  },

  loadSessions: async () => {
    try {
      const response = await api.get('/chat/sessions');
      set({ sessions: response.data });
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  },

  loadSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/chat/sessions/${sessionId}/messages`);
      set({
        currentSessionId: sessionId,
        messages: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to load session',
        isLoading: false,
      });
    }
  },

  newSession: () => {
    set({
      currentSessionId: null,
      messages: [],
      error: null,
    });
  },

  deleteSession: async (sessionId: string) => {
    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      set((state) => ({
        sessions: state.sessions.filter((s) => s._id !== sessionId),
        ...(state.currentSessionId === sessionId && {
          currentSessionId: null,
          messages: [],
        }),
      }));
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  },

  getProviderStatus: async () => {
    try {
      const response = await api.get('/chat/status');
      set({ providerStatus: response.data });
    } catch (error) {
      console.error('Failed to get provider status:', error);
    }
  },

  confirmAction: async () => {
    const { pendingAction } = get();
    if (!pendingAction) return;

    set({ isLoading: true, error: null });

    try {
      await api.post('/chat/action/confirm', {
        actionId: pendingAction.id,
        data: pendingAction.data,
      });

      set({
        pendingAction: null,
        isLoading: false,
      });

      // Add confirmation message
      const confirmMessage: ChatMessage = {
        id: `confirm-${Date.now()}`,
        role: 'assistant',
        content: `✓ Action confirmed: ${pendingAction.description}`,
        createdAt: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, confirmMessage],
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to confirm action',
        isLoading: false,
      });
    }
  },

  cancelAction: () => {
    set({ pendingAction: null });
  },
}));