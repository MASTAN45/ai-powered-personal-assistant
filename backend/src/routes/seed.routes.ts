import { Router } from 'express';
import { User } from '../models/User.model';
import { logger } from '../config/logger';
import { Pairing } from '../models/Pairing.model';
import { Conversation } from '../models/Conversation.model';
import { authService } from '../services/auth.service';
import { demoClassificationService } from '../services/ai/classification.service';

const router = Router();

router.post('/seed', async (req, res) => {
  try {
    await User.deleteMany({});
    await Pairing.deleteMany({});
    await Conversation.deleteMany({});
    
    const assistant = await authService.register({
      email: 'demo-assistant@example.com',
      password: 'password123',
      fullName: 'Sarah Chen',
      role: 'ASSISTANT',
    });
    
    const client = await authService.register({
      email: 'demo-client@example.com',
      password: 'password123',
      fullName: 'David Thompson',
      role: 'CLIENT',
    });
    
    await Pairing.create({
      assistant: assistant.user._id,
      client: client.user._id,
      status: 'ACCEPTED',
      invitationCode: 'INV-DEMO-1234',
      invitedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      acceptedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    
    const conversations = [
      { subject: 'URGENT: Q4 Budget Approval Required', name: 'John Martinez', email: 'john.martinez@company.com', body: 'Hi David,\\n\\nI need your approval on the Q4 budget proposals by end of day Thursday.\\n\\nKey items:\\n- Marketing: dollars 250K\\n- Hiring: 5 positions\\n- Tech: dollars 180K\\n\\nBest,\\nJohn', hours: 2 },
      { subject: 'Partnership Agreement - Your Review Needed', name: 'Robert Kim', email: 'robert.kim@tech.com', body: 'David, Legal has reviewed the partnership agreement. We need your final approval before proceeding.\\n\\nDeadline: Friday 5 PM\\n\\nBest, Robert', hours: 5 },
      { subject: 'Board Meeting Agenda - Input Required', name: 'Jennifer Clark', email: 'jennifer@company.com', body: 'Please review the board meeting agenda. We need your input on Q3 results and 2024 strategy. Confirm by Wednesday.', hours: 12 },
      { subject: 'Contract Renewal Decision', name: 'Lisa Wong', email: 'lisa@vendor.com', body: 'Your contract expires November 30th. We need your decision on renewal by Friday. New terms include 15 percent discount.', hours: 18 },
      { subject: 'Investment Opportunity', name: 'Amanda Lewis', email: 'amanda@vc.com', body: 'Time-sensitive Series B investment in fintech. dollars 12M ARR, 300 percent growth. Investment: dollars 250K minimum. Decision needed Friday.', hours: 24 },
      { subject: 'Please reschedule dentist', name: 'David Thompson', email: client.user.email, body: 'Sarah, reschedule my dentist appointment November 15th. Need morning slot next week. Thanks', hours: 6 },
      { subject: 'Arrange catering for team lunch', name: 'David Thompson', email: client.user.email, body: 'Hi Sarah, team lunch Friday noon, 25 people. Italian place, dollars 500 budget. 3 veg, 2 GF. Confirm when ordered.', hours: 10 },
      { subject: 'Book NYC flights', name: 'David Thompson', email: client.user.email, body: 'Sarah, need NYC trip Dec 5-7. Book flights, hotel near Times Square, car service. Corporate account.', hours: 30 },
      { subject: 'Flight Confirmation NYC', name: 'American Airlines', email: 'noreply@aa.com', body: 'Confirmation ABC123. Dec 5 SFO-JFK 8am-4:30pm. Dec 7 return 6pm-9:30pm. Check-in 24h before.', hours: 48 },
      { subject: 'Invoice Processed', name: 'Accounting', email: 'accounting@company.com', body: 'Expense report approved. Total: dollars 3,247.85. Reimbursement next paycheck. Thanks, Accounting', hours: 50 },
      { subject: 'Hotel Confirmation', name: 'Grand Plaza', email: 'reservations@hotel.com', body: 'Confirmed! Grand Plaza NYC, Dec 5-7, Deluxe King, dollars 895. Confirmation: XYZ789', hours: 55 },
    ];
    
    for (const conv of conversations) {
      const cls = await demoClassificationService.classify({ subject: conv.subject, messages: [{ 
          body: { text: conv.body }, 
          sender: { name: conv.name, email: conv.email }, 
          recipients: { to: [{ name: client.user.fullName, email: client.user.email }] }, 
          timestamp: new Date(), 
          isRead: false 
        }], sender: { name: conv.name, email: conv.email } });
      const timestamp = new Date(Date.now() - conv.hours * 60 * 60 * 1000);
      
      await Conversation.create({
        subject: conv.subject,
        clientId: client.user._id,
        sender: { name: conv.name, email: conv.email },
        classification: cls.classification,
        classificationConfidence: cls.confidence,
        classificationReasoning: cls.reasoning,
        isManuallyClassified: false,
        needsHumanReview: cls.needsHumanReview,
        priority: cls.priority,
        statusFlags: { isRead: Math.random() > 0.7, isImportant: cls.classification === 'CLIENT_TO_REPLY', isArchived: false, isCompleted: false },
        messages: [{ sender: { name: conv.name, email: conv.email }, recipients: { to: [{ email: client.user.email, name: 'David Thompson' }] }, timestamp: timestamp, isRead: false, body: { text: conv.body }, attachments: [] }],
        lastMessageTimestamp: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
    
    res.json({ success: true, message: 'Database seeded successfully', users: 2, conversations: conversations.length });
  } catch (error: any) {
    logger.error('Seed error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
