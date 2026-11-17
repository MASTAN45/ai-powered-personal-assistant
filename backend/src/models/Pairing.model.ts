import mongoose, { Document, Schema } from 'mongoose';

export interface IPairing extends Document {
  assistant: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  invitationCode: string;
  invitedAt: Date;
  acceptedAt?: Date;
  revokedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PairingSchema = new Schema<IPairing>(
  {
    assistant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'],
      default: 'PENDING',
      index: true,
    },
    invitationCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: Date,
    revokedAt: Date,
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
PairingSchema.index({ assistant: 1, status: 1 });
PairingSchema.index({ client: 1, status: 1 });

export const Pairing = mongoose.model<IPairing>('Pairing', PairingSchema);
