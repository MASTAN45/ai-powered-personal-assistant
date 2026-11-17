import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  role: 'ASSISTANT' | 'CLIENT';
  profileImage?: string;
  preferences: {
    company?: string;
    timezone: string;
    notificationFrequency: 'real-time' | 'hourly' | 'daily';
    aiMode: 'demo' | 'ai';
    classificationThresholds?: {
      urgent: number;
      important: number;
    };
  };
  onboardingStatus: {
    completed: boolean;
    currentStep: number;
    completedSteps: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['ASSISTANT', 'CLIENT'],
      required: true,
      index: true,
    },
    profileImage: {
      type: String,
    },
    preferences: {
      company: String,
      timezone: {
        type: String,
        default: 'UTC',
      },
      notificationFrequency: {
        type: String,
        enum: ['real-time', 'hourly', 'daily'],
        default: 'real-time',
      },
      aiMode: {
        type: String,
        enum: ['demo', 'ai'],
        default: 'demo',
      },
      classificationThresholds: {
        urgent: {
          type: Number,
          default: 0.8,
        },
        important: {
          type: Number,
          default: 0.6,
        },
      },
    },
    onboardingStatus: {
      completed: {
        type: Boolean,
        default: false,
      },
      currentStep: {
        type: Number,
        default: 1,
      },
      completedSteps: {
        type: [Number],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
