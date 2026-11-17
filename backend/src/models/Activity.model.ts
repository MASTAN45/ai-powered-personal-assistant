import { Schema, model, Document } from 'mongoose';

export interface IActivity extends Document {
  eventType: 'CONVERSATION_RECEIVED' | 'CLASSIFICATION_CREATED' | 'CLASSIFICATION_CHANGED' | 
             'MANUAL_OVERRIDE' | 'REPLY_GENERATED' | 'DRAFT_SAVED' | 'STATUS_CHANGED' |
             'PAIRING_CREATED' | 'PAIRING_ACCEPTED' | 'CONVERSATION_COMPLETED';
  user: Schema.Types.ObjectId;
  conversation?: Schema.Types.ObjectId;
  relatedEntity?: Schema.Types.ObjectId;
  details: {
    previousValue?: string;
    newValue?: string;
    reason?: string;
    additionalInfo?: any;
  };
  timestamp: Date;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
  };
}

const activitySchema = new Schema<IActivity>({
  eventType: {
    type: String,
    required: true,
    enum: [
      'CONVERSATION_RECEIVED',
      'CLASSIFICATION_CREATED',
      'CLASSIFICATION_CHANGED',
      'MANUAL_OVERRIDE',
      'REPLY_GENERATED',
      'DRAFT_SAVED',
      'STATUS_CHANGED',
      'PAIRING_CREATED',
      'PAIRING_ACCEPTED',
      'CONVERSATION_COMPLETED'
    ],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
  },
  relatedEntity: {
    type: Schema.Types.ObjectId,
  },
  details: {
    previousValue: String,
    newValue: String,
    reason: String,
    additionalInfo: Schema.Types.Mixed,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
activitySchema.index({ user: 1, timestamp: -1 });
activitySchema.index({ conversation: 1, timestamp: -1 });
activitySchema.index({ eventType: 1, timestamp: -1 });

export const Activity = model<IActivity>('Activity', activitySchema);