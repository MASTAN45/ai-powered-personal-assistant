/// <reference types="vite/client" />
import axios from 'axios';

import { config } from '../config/env';

const API_URL = `${config.apiUrl}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; fullName: string; role: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getCurrentUser: () =>
    api.get('/users/me'),
};

// Conversations API
export const conversationsAPI = {
  getAll: (params?: any) =>
    api.get('/conversations', { params }),
  
  getById: (id: string) =>
    api.get(`/conversations/${id}`),
  
  update: (id: string, data: any) =>
    api.patch(`/conversations/${id}`, data),
  
  bulkUpdate: (conversationIds: string[], updates: any) =>
    api.post('/conversations/bulk-update', { conversationIds, updates }),
  
  getStats: () =>
    api.get('/conversations/stats'),

  markAsRead: (id: string) =>
    api.patch(`/conversations/${id}/read`),

  updateClassification: (id: string, classification: string, confidence?: number) =>
    api.patch(`/conversations/${id}/classification`, { classification, confidence }),

  sendReply: (id: string, replyData: any) =>
    api.post(`/conversations/${id}/reply`, replyData),
};

// Pairing API
export const pairingAPI = {
  createInvitation: (clientEmail: string) =>
    api.post('/pairing/invite', { clientEmail }),
  
  generateInvite: () =>
    api.post('/pairing/generate-invite'),
  
  acceptInvitation: (invitationCode: string) =>
    api.post('/pairing/accept', { invitationCode }),

  acceptInvite: (inviteCode: string) =>
    api.post('/pairing/accept-invite', { inviteCode }),
  
  getMyPairings: () =>
    api.get('/pairing/my-pairings'),
  
  getPending: () =>
    api.get('/pairing/pending'),
  
  revoke: (id: string) =>
    api.delete(`/pairing/${id}`),
};

// Activity API
export const activityAPI = {
  create: (data: any) =>
    api.post('/activity', data),

  getAll: (params?: any) =>
    api.get('/activity', { params }),

  getByUser: (userId: string) =>
    api.get(`/activity/user/${userId}`),
};

// Deadlines API
export const deadlineAPI = {
  extract: (conversationId: string) =>
    api.post('/deadlines/extract', { conversationId }),

  getUpcoming: () =>
    api.get('/deadlines/upcoming'),

  getOverdue: () =>
    api.get('/deadlines/overdue'),

  getAll: () =>
    api.get('/deadlines/all'),

  updateStatus: (deadlineId: string, status: string) =>
    api.patch(`/deadlines/${deadlineId}/status`, { status }),

  confirm: (deadlineId: string, updates: any) =>
    api.patch(`/deadlines/${deadlineId}/confirm`, updates),

  delete: (deadlineId: string) =>
    api.delete(`/deadlines/${deadlineId}`),
};

// Notifications API
export const notificationAPI = {
  getMyNotifications: (limit?: number) =>
    api.get('/notifications/my-notifications', { params: { limit } }),

  getUnread: () =>
    api.get('/notifications/unread'),

  getUnreadCount: () =>
    api.get('/notifications/unread-count'),

  markAsRead: (notificationId: string) =>
    api.patch(`/notifications/${notificationId}/read`),

  markAllAsRead: () =>
    api.patch('/notifications/mark-all-read'),

  delete: (notificationId: string) =>
    api.delete(`/notifications/${notificationId}`),
};

// Seed API
export const seedAPI = {
  seedDatabase: () =>
    api.post('/seed'),
};

export default api;
