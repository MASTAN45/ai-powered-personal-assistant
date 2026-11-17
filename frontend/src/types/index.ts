export interface User {
  _id: string;
  email: string;
  fullName: string;
  role: 'ASSISTANT' | 'CLIENT';
  createdAt: string;
}

export type Classification = 'ASSISTANT_TO_REPLY' | 'CLIENT_TO_REPLY' | 'NO_REPLY_NEEDED';

export interface Conversation {
  _id: string;
  subject: string;
  clientId: string;
  sender: {
    email: string;
    name: string;
  };
  classification: Classification;
  classificationConfidence: number;
  classificationReasoning: string;
  isManuallyClassified: boolean;
  needsHumanReview: boolean;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  statusFlags: {
    isRead: boolean;
    isImportant: boolean;
    isArchived: boolean;
    isCompleted: boolean;
  };
  messages: Message[];
  lastMessageTimestamp: string;
  messageCount: number;
  preview: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id?: string;
  from: {
    email: string;
    name: string;
  };
  timestamp: string;
  body: {
    text: string;
    html?: string;
  };
  attachments?: Attachment[];
}

export interface Attachment {
  filename: string;
  size: number;
  mimeType: string;
  url?: string;
}

export interface Pairing {
  _id: string;
  assistant: User;
  client: User;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED';
  invitationCode: string;
  invitedAt: string;
  acceptedAt?: string;
  revokedAt?: string;
  expiresAt: string;
}

export interface ConversationStats {
  assistantToReply: number;
  clientToReply: number;
  noReplyNeeded: number;
  unread: number;
  important: number;
  total: number;
}