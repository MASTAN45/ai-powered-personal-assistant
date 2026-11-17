import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  user: Schema.Types.ObjectId;
  type: 'NEW_EMAIL' | 'IMPORTANT_EMAIL' | 'LOW_CONFIDENCE' | 'DEADLINE_UPCOMING' | 
        'DEADLINE_OVERDUE' | 'CLIENT_ACTION' | 'PAIRING_EVENT';
  title: string;
  message: string;
  relatedConversation?: Schema.Types.ObjectId;
  relatedDeadline?: Schema.Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'NEW_EMAIL',
      'IMPORTANT_EMAIL',
      'LOW_CONFIDENCE',
      'DEADLINE_UPCOMING',
      'DEADLINE_OVERDUE',
      'CLIENT_ACTION',
      'PAIRING_EVENT'
    ],
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedConversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
  },
  relatedDeadline: {
    type: Schema.Types.ObjectId,
    ref: 'Deadline',
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  readAt: Date,
}, {
  timestamps: true,
});

// Compound index for efficient queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);