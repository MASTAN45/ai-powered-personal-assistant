import mongoose, { Schema } from 'mongoose';

export interface IChatSession {
  user: mongoose.Types.ObjectId;
  title: string;
  contextType?: 'general' | 'conversation';
  contextId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const chatSessionSchema = new Schema<IChatSession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Chat',
      maxlength: 200,
    },
    contextType: {
      type: String,
      enum: ['general', 'conversation'],
      default: 'general',
    },
    contextId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
    },
  },
  {
    timestamps: true,
  }
);

chatSessionSchema.index({ user: 1, createdAt: -1 });

export const ChatSession = mongoose.model<IChatSession>('ChatSession', chatSessionSchema);