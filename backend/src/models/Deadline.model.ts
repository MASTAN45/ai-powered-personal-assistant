import { Schema, model, Document } from 'mongoose';

export interface IDeadline extends Document {
  title: string;
  conversation: Schema.Types.ObjectId;
  extractedFrom: string; // message content snippet
  dueDate: Date;
  dueTime?: string;
  timezone?: string;
  confidence: number; // 0-1
  status: 'UPCOMING' | 'DUE_TODAY' | 'OVERDUE' | 'COMPLETED' | 'DISMISSED';
  isConfirmed: boolean;
  extractedBy: Schema.Types.ObjectId; // user who confirmed
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const deadlineSchema = new Schema<IDeadline>({
  title: {
    type: String,
    required: true,
  },
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  extractedFrom: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
    index: true,
  },
  dueTime: String,
  timezone: String,
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  status: {
    type: String,
    enum: ['UPCOMING', 'DUE_TODAY', 'OVERDUE', 'COMPLETED', 'DISMISSED'],
    default: 'UPCOMING',
    index: true,
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
  extractedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  notes: String,
}, {
  timestamps: true,
});

// Index for efficient deadline queries
deadlineSchema.index({ extractedBy: 1, status: 1, dueDate: 1 });
deadlineSchema.index({ conversation: 1 });

// Auto-update status based on due date
deadlineSchema.pre('save', function(next) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(this.dueDate.getFullYear(), this.dueDate.getMonth(), this.dueDate.getDate());
  
  if (this.status !== 'COMPLETED' && this.status !== 'DISMISSED') {
    if (dueDay < today) {
      this.status = 'OVERDUE';
    } else if (dueDay.getTime() === today.getTime()) {
      this.status = 'DUE_TODAY';
    } else {
      this.status = 'UPCOMING';
    }
  }
  
  next();
});

export const Deadline = model<IDeadline>('Deadline', deadlineSchema);