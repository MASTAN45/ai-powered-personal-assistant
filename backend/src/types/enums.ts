export interface UserRole {
  ASSISTANT: 'ASSISTANT';
  CLIENT: 'CLIENT';
}

export type UserRoleType = 'ASSISTANT' | 'CLIENT';

export interface ClassificationCategory {
  ASSISTANT_TO_REPLY: 'ASSISTANT_TO_REPLY';
  CLIENT_TO_REPLY: 'CLIENT_TO_REPLY';
  NO_REPLY_NEEDED: 'NO_REPLY_NEEDED';
}

export type ClassificationType = 'ASSISTANT_TO_REPLY' | 'CLIENT_TO_REPLY' | 'NO_REPLY_NEEDED';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface PairingStatus {
  PENDING: 'PENDING';
  ACCEPTED: 'ACCEPTED';
  EXPIRED: 'EXPIRED';
  REVOKED: 'REVOKED';
}

export type PairingStatusType = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
