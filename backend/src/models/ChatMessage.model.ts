import mongoose, { Schema } from 'mongoose';

export interface IChatMessage {
  session: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  provider?: 'gemini' | 'fallback';
  model?: string;
  conversationContext?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    session: {
      type: Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    provider: {
      type: String,
      enum: ['gemini', 'fallback'],
    },
    model: {
      type: String,
    },
    conversationContext: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

chatMessageSchema.index({ session: 1, createdAt: 1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);