import { Request, Response, NextFunction } from 'express';
import { pairingService } from '../services/pairing/pairing.service';

/**
 * POST /api/pairing/invite
 * Create invitation to client
 */
export const createInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assistantId = req.user!._id.toString();
    const { clientEmail } = req.body;

    if (req.user!.role !== 'ASSISTANT') {
      res.status(403).json({
        error: 'Only assistants can send invitations',
        code: 'FORBIDDEN',
      });
      return;
    }

    if (!clientEmail) {
      res.status(400).json({
        error: 'clientEmail is required',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const pairing = await pairingService.createInvitation(assistantId, clientEmail);

    res.status(201).json({
      data: { pairing },
      message: 'Invitation created successfully',
    });
  } catch (error: any) {
    if (error.message === 'CLIENT_NOT_FOUND') {
      res.status(404).json({
        error: 'Client with this email not found',
        code: 'CLIENT_NOT_FOUND',
      });
      return;
    }
    if (error.message === 'PAIRING_ALREADY_EXISTS') {
      res.status(409).json({
        error: 'Pairing already exists with this client',
        code: 'PAIRING_ALREADY_EXISTS',
      });
      return;
    }
    next(error);
  }
};

/**
 * POST /api/pairing/accept
 * Accept invitation using code
 */
export const acceptInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientId = req.user!._id.toString();
    const { invitationCode } = req.body;

    if (req.user!.role !== 'CLIENT') {
      res.status(403).json({
        error: 'Only clients can accept invitations',
        code: 'FORBIDDEN',
      });
      return;
    }

    if (!invitationCode) {
      res.status(400).json({
        error: 'invitationCode is required',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const pairing = await pairingService.acceptInvitation(clientId, invitationCode);

    res.status(200).json({
      data: { pairing },
      message: 'Invitation accepted successfully',
    });
  } catch (error: any) {
    if (error.message === 'INVITATION_NOT_FOUND') {
      res.status(404).json({
        error: 'Invalid or expired invitation code',
        code: 'INVITATION_NOT_FOUND',
      });
      return;
    }
    if (error.message === 'INVALID_CLIENT') {
      res.status(403).json({
        error: 'This invitation is not for you',
        code: 'INVALID_CLIENT',
      });
      return;
    }
    if (error.message === 'CLIENT_ALREADY_PAIRED') {
      res.status(409).json({
        error: 'You already have an active pairing',
        code: 'CLIENT_ALREADY_PAIRED',
      });
      return;
    }
    next(error);
  }
};

/**
 * GET /api/pairing/my-pairings
 * Get user's pairings
 */
export const getMyPairings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id.toString();
    const role = req.user!.role;

    const pairings = await pairingService.getPairingsForUser(userId, role);

    res.status(200).json({
      data: { pairings },
      message: 'Pairings retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/pairing/pending
 * Get pending invitations (for clients)
 */
export const getPendingInvitations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientId = req.user!._id.toString();

    if (req.user!.role !== 'CLIENT') {
      res.status(403).json({
        error: 'Only clients can view pending invitations',
        code: 'FORBIDDEN',
      });
      return;
    }

    const invitations = await pairingService.getPendingInvitations(clientId);

    res.status(200).json({
      data: { invitations },
      message: 'Pending invitations retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/pairing/:id
 * Revoke pairing
 */
export const revokePairing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id.toString();
    const pairingId = req.params.id;

    await pairingService.revokePairing(pairingId, userId);

    res.status(200).json({
      message: 'Pairing revoked successfully',
    });
  } catch (error: any) {
    if (error.message === 'PAIRING_NOT_FOUND') {
      res.status(404).json({
        error: 'Pairing not found',
        code: 'PAIRING_NOT_FOUND',
      });
      return;
    }
    if (error.message === 'FORBIDDEN') {
      res.status(403).json({
        error: 'You are not authorized to revoke this pairing',
        code: 'FORBIDDEN',
      });
      return;
    }
    next(error);
  }
};
