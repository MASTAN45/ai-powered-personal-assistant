import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as pairingController from '../controllers/pairing.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Create invitation (assistants only)
router.post('/invite', pairingController.createInvitation);

// Accept invitation (clients only)
router.post('/accept', pairingController.acceptInvitation);

// Get my pairings
router.get('/my-pairings', pairingController.getMyPairings);

// Get pending invitations (clients only)
router.get('/pending', pairingController.getPendingInvitations);

// Revoke pairing
router.delete('/:id', pairingController.revokePairing);

export default router;
