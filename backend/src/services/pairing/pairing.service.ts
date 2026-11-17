import crypto from 'crypto';
import { Pairing, IPairing } from '../../models/Pairing.model';
import { User } from '../../models/User.model';

export class PairingService {
  /**
   * Create invitation from assistant to client
   */
  async createInvitation(assistantId: string, clientEmail: string): Promise<IPairing> {
    // Find client by email
    const client = await User.findOne({ email: clientEmail.toLowerCase(), role: 'CLIENT' });
    
    if (!client) {
      throw new Error('CLIENT_NOT_FOUND');
    }

    // Check if pairing already exists
    const existingPairing = await Pairing.findOne({
      assistant: assistantId,
      client: client._id,
      status: { $in: ['PENDING', 'ACCEPTED'] },
    });

    if (existingPairing) {
      throw new Error('PAIRING_ALREADY_EXISTS');
    }

    // Generate unique invitation code
    const invitationCode = this.generateInvitationCode();

    // Create pairing
    const pairing = await Pairing.create({
      assistant: assistantId,
      client: client._id,
      status: 'PENDING',
      invitationCode,
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return pairing;
  }

  /**
   * Accept invitation using code
   */
  async acceptInvitation(clientId: string, invitationCode: string): Promise<IPairing> {
    // Find pending invitation
    const pairing = await Pairing.findOne({
      invitationCode,
      status: 'PENDING',
      expiresAt: { $gt: new Date() },
    }).populate('assistant', 'fullName email');

    if (!pairing) {
      throw new Error('INVITATION_NOT_FOUND');
    }

    // Verify client
    if (pairing.client.toString() !== clientId) {
      throw new Error('INVALID_CLIENT');
    }

    // Check if client already has an active pairing
    const existingActivePairing = await Pairing.findOne({
      client: clientId,
      status: 'ACCEPTED',
    });

    if (existingActivePairing) {
      throw new Error('CLIENT_ALREADY_PAIRED');
    }

    // Accept pairing
    pairing.status = 'ACCEPTED';
    pairing.acceptedAt = new Date();
    await pairing.save();

    return pairing;
  }

  /**
   * Get pairings for user
   */
  async getPairingsForUser(
    userId: string,
    role: 'ASSISTANT' | 'CLIENT'
  ): Promise<IPairing[]> {
    const query = role === 'ASSISTANT' 
      ? { assistant: userId }
      : { client: userId };

    const pairings = await Pairing.find(query)
      .populate('assistant', 'fullName email')
      .populate('client', 'fullName email')
      .sort({ createdAt: -1 });

    return pairings;
  }

  /**
   * Get active pairings for assistant
   */
  async getActivePairings(assistantId: string): Promise<IPairing[]> {
    const pairings = await Pairing.find({
      assistant: assistantId,
      status: 'ACCEPTED',
    })
      .populate('client', 'fullName email')
      .sort({ acceptedAt: -1 });

    return pairings;
  }

  /**
   * Get pending invitations for client
   */
  async getPendingInvitations(clientId: string): Promise<IPairing[]> {
    const invitations = await Pairing.find({
      client: clientId,
      status: 'PENDING',
      expiresAt: { $gt: new Date() },
    })
      .populate('assistant', 'fullName email')
      .sort({ invitedAt: -1 });

    return invitations;
  }

  /**
   * Revoke pairing
   */
  async revokePairing(pairingId: string, userId: string): Promise<void> {
    const pairing = await Pairing.findById(pairingId);

    if (!pairing) {
      throw new Error('PAIRING_NOT_FOUND');
    }

    // Verify user is part of this pairing
    const isAssistant = pairing.assistant.toString() === userId;
    const isClient = pairing.client.toString() === userId;

    if (!isAssistant && !isClient) {
      throw new Error('FORBIDDEN');
    }

    // Revoke
    pairing.status = 'REVOKED';
    pairing.revokedAt = new Date();
    await pairing.save();
  }

  /**
   * Generate unique invitation code
   */
  private generateInvitationCode(): string {
    const randomBytes = crypto.randomBytes(8);
    const code = randomBytes.toString('hex').toUpperCase();
    return `INV-${code.substring(0, 4)}-${code.substring(4, 8)}-${code.substring(8)}`;
  }
}

export const pairingService = new PairingService();
