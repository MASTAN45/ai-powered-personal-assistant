import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  sender: {
    name: string;
    email: string;
  };
  recipients: {
    to: Array<{ name: string; email: string }>;
    cc?: Array<{ name: string; email: string }>;
    bcc?: Array<{ name: string; email: string }>;
  };
  body: {
    text: string;
    html?: string;
  };
  timestamp: Date;
  isRead: boolean;
  attachments?: Array<{
    filename: string;
    size: number;
    mimeType: string;
    url?: string;
  }>;
}

export interface IConversation extends Document {
  clientId: mongoose.Types.ObjectId;
  subject: string;
  sender: {
    name: string;
    email: string;
  };
  messages: IMessage[];
  classification: 'ASSISTANT_TO_REPLY' | 'CLIENT_TO_REPLY' | 'NO_REPLY_NEEDED';
  classificationConfidence: number;
  classificationReasoning: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  suggestedAction?: string;
  isManuallyClassified: boolean;
  needsHumanReview: boolean;
  statusFlags: {
    isRead: boolean;
    isImportant: boolean;
    isArchived: boolean;
    isCompleted: boolean;
  };
  extractedInfo: {
    dates: Array<{ value: string; context: string }>;
    deadlines: Array<{ value: string; description: string }>;
    tasks: Array<{ value: string; completed: boolean }>;
    names: string[];
    amounts: Array<{ value: number; currency?: string; context: string }>;
  };
  lastMessageTimestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    recipients: {
      to: [
        {
          name: String,
          email: String,
        },
      ],
      cc: [
        {
          name: String,
          email: String,
        },
      ],
      bcc: [
        {
          name: String,
          email: String,
        },
      ],
    },
    body: {
      text: { type: String, required: true },
      html: String,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        filename: String,
        size: Number,
        mimeType: String,
        url: String,
      },
    ],
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      index: 'text',
    },
    sender: {
      name: { type: String, required: true },
      email: { type: String, required: true, index: 'text' },
    },
    messages: [MessageSchema],
    classification: {
      type: String,
      enum: ['ASSISTANT_TO_REPLY', 'CLIENT_TO_REPLY', 'NO_REPLY_NEEDED'],
      required: true,
      index: true,
    },
    classificationConfidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    classificationReasoning: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
      index: true,
    },
    suggestedAction: String,
    isManuallyClassified: {
      type: Boolean,
      default: false,
    },
    needsHumanReview: {
      type: Boolean,
      default: false,
      index: true,
    },
    statusFlags: {
      isRead: {
        type: Boolean,
        default: false,
      },
      isImportant: {
        type: Boolean,
        default: false,
      },
      isArchived: {
        type: Boolean,
        default: false,
      },
      isCompleted: {
        type: Boolean,
        default: false,
      },
    },
    extractedInfo: {
      dates: [
        {
          value: String,
          context: String,
        },
      ],
      deadlines: [
        {
          value: String,
          description: String,
        },
      ],
      tasks: [
        {
          value: String,
          completed: {
            type: Boolean,
            default: false,
          },
        },
      ],
      names: [String],
      amounts: [
        {
          value: Number,
          currency: String,
          context: String,
        },
      ],
    },
    lastMessageTimestamp: {
      type: Date,
      required: true,
      index: -1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
ConversationSchema.index({ clientId: 1, 'statusFlags.isArchived': 1, classification: 1 });
ConversationSchema.index({ clientId: 1, lastMessageTimestamp: -1 });
ConversationSchema.index({ clientId: 1, 'statusFlags.isRead': 1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
