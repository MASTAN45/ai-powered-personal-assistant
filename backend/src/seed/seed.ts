import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User } from '../models/User.model';
import { Pairing } from '../models/Pairing.model';
import { Conversation } from '../models/Conversation.model';
import { authService } from '../services/auth.service';
import { demoClassificationService } from '../services/ai/classification.service';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedData = async () => {
  try {
    console.log('ðŸŒ± Starting database seed...');
    await connectDatabase();
    
    // Clear existing data
    await User.deleteMany({});
    await Pairing.deleteMany({});
    await Conversation.deleteMany({});
    
    // Create assistant and client
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
    
    console.log('âœ… Created demo users');
    
    // Create pairing
    await Pairing.create({
      assistant: assistant.user._id,
      client: client.user._id,
      status: 'ACCEPTED',
      invitationCode: 'INV-DEMO-1234',
      invitedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      acceptedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    
    console.log('âœ… Created assistant-client pairing');
    
    // Realistic conversation scenarios
    const conversations = [
      // CLIENT_TO_REPLY scenarios (4)
      {
        subject: 'Approval Needed: Website Redesign Proposal',
        clientEmail: 'olivia.parker@parkerconsulting.com',
        clientName: 'Olivia Parker',
        body: `Hi Sarah,

I've reviewed the website redesign proposal you sent last week. The overall direction looks fantastic and aligns well with our brand vision.

Before I give final approval, I need clarification on a few points:

1. Will the additional landing page for our new service line be included in the quoted price?
2. Can you confirm the revised timeline? The proposal mentions 6-8 weeks - I need to know the exact completion date.
3. What's the process for incorporating our feedback during the design phase?

Looking forward to moving forward with this project!

Best regards,
Olivia Parker
Parker Consulting`,
        hours: 3,
        forcedClassification: 'CLIENT_TO_REPLY',
        priority: 'HIGH'
      },
      {
        subject: 'Scheduling: Q4 Strategy Meeting',
        clientEmail: 'james.wilson@wilsoncreative.com',
        clientName: 'James Wilson',
        body: `Hello Sarah,

I'd like to schedule our Q4 strategy review meeting. We have several important initiatives to discuss including the marketing campaign launch and our technology roadmap.

My availability next week:
- Tuesday afternoon (2-5 PM)
- Wednesday morning (9 AM - 12 PM)
- Friday afternoon (1-4 PM)

Please let me know which time works best for David's schedule. The meeting should take about 90 minutes.

Thanks,
James Wilson
Wilson Creative Studio`,
        hours: 8,
        forcedClassification: 'CLIENT_TO_REPLY',
        priority: 'MEDIUM'
      },
      {
        subject: 'URGENT: Campaign Assets Needed by Thursday',
        clientEmail: 'sophia.martinez@martinez-ent.com',
        clientName: 'Sophia Martinez',
        body: `Hi Sarah,

This is urgent. Our marketing team needs the final campaign assets (logos, banners, social media graphics) by THIS THURSDAY at 5 PM so we can schedule the launch for next Monday.

The previous email mentioned Friday delivery, but our timeline has accelerated. Can David expedite this?

Please confirm receipt and let me know if Thursday EOD is possible.

Regards,
Sophia Martinez
Martinez Enterprises`,
        hours: 12,
        forcedClassification: 'CLIENT_TO_REPLY',
        priority: 'HIGH'
      },
      {
        subject: 'Contract Renewal Decision Required',
        clientEmail: 'ethan.brown@browntech.com',
        clientName: 'Ethan Brown',
        body: `Hi Sarah,

Our annual service contract expires on November 30th. To ensure uninterrupted service and lock in this year's pricing, I need David's decision on the renewal by Friday.

The new contract includes:
- 15% volume discount (up from 10%)
- Enhanced SLA with 2-hour response time
- Dedicated account manager
- Quarterly business reviews

The pricing is very competitive and I'd hate for us to lose these benefits. Can you get David's approval this week?

Best,
Ethan Brown
Brown Technologies`,
        hours: 24,
        forcedClassification: 'CLIENT_TO_REPLY',
        priority: 'MEDIUM'
      },

      // ASSISTANT_TO_REPLY scenarios (4)
      {
        subject: 'Re: Dentist Appointment Rescheduling',
        clientEmail: client.user.email,
        clientName: client.user.fullName,
        body: `Sarah,

I need to reschedule my dentist appointment originally scheduled for November 15th at 3 PM. An important client meeting came up that I can't move.

Can you find me a slot next week? Morning appointments (9-11 AM) work best for my schedule.

Thanks,
David`,
        hours: 6,
        forcedClassification: 'ASSISTANT_TO_REPLY',
        priority: 'MEDIUM'
      },
      {
        subject: 'Team Lunch Catering Order',
        clientEmail: client.user.email,
        clientName: client.user.fullName,
        body: `Hi Sarah,

We're having a team celebration lunch this Friday at noon. About 25 people will attend.

Please arrange catering from Bella Italia (the place we used for the last event - everyone loved it).

Budget: $500
Dietary requirements: 3 vegetarian options, 2 gluten-free meals

Can you confirm once the order is placed?

David`,
        hours: 15,
        forcedClassification: 'ASSISTANT_TO_REPLY',
        priority: 'LOW'
      },
      {
        subject: 'NYC Trip - Flight and Hotel Booking',
        clientEmail: client.user.email,
        clientName: client.user.fullName,
        body: `Sarah,

I need to be in New York December 5-7 for investor meetings.

Please book:
- Round trip flights: Morning departure, evening return preferred
- Hotel: 4-star, Times Square area, close to subway
- Car service: Airport transfers both ways

Use the corporate Amex. I'll need the itinerary by end of week.

Thanks,
David Thompson`,
        hours: 30,
        forcedClassification: 'ASSISTANT_TO_REPLY',
        priority: 'HIGH'
      },
      {
        subject: 'Board Member Thank You Gifts',
        clientEmail: client.user.email,
        clientName: client.user.fullName,
        body: `Hi Sarah,

Following last week's successful board meeting, please send thank you gifts to all 8 board members.

The gift baskets from Gourmet Delights would be perfect (we've used them before).

Budget: $200 per person
Include personalized note cards - I'll send you the specific messages for each person by tomorrow.

David`,
        hours: 40,
        forcedClassification: 'ASSISTANT_TO_REPLY',
        priority: 'LOW'
      },

      // NO_REPLY_NEEDED scenarios (3)
      {
        subject: 'Flight Confirmation - NYC Trip',
        clientEmail: 'noreply@americanairlines.com',
        clientName: 'American Airlines',
        body: `Thank you for booking with American Airlines!

FLIGHT CONFIRMATION: ABC123XYZ

Passenger: David Thompson

OUTBOUND FLIGHT
December 5, 2024
San Francisco (SFO) â†’ New York JFK
Flight AA 123
Departure: 8:00 AM PST | Arrival: 4:30 PM EST
Seat: 4A (Premium Economy)

RETURN FLIGHT
December 7, 2024
New York JFK â†’ San Francisco (SFO)
Flight AA 456
Departure: 6:00 PM EST | Arrival: 9:30 PM PST
Seat: 4A (Premium Economy)

Check-in opens 24 hours before departure.
Download the AA app for mobile boarding pass.`,
        hours: 48,
        forcedClassification: 'NO_REPLY_NEEDED',
        priority: 'LOW'
      },
      {
        subject: 'Invoice Processed - November Expenses',
        clientEmail: 'accounting@company.com',
        clientName: 'Accounting Team',
        body: `Hi David,

Your expense report for November has been processed and approved.

Total Reimbursement: $3,247.85

Breakdown:
- Travel: $1,895.00
- Meals & Entertainment: $892.50
- Office Supplies: $460.35

The reimbursement will appear in your next paycheck (November 30th).

If you have any questions, please contact the finance department.

Thank you,
Accounting Team`,
        hours: 55,
        forcedClassification: 'NO_REPLY_NEEDED',
        priority: 'LOW'
      },
      {
        subject: 'Hotel Reservation Confirmed',
        clientEmail: 'reservations@grandplazanyc.com',
        clientName: 'Grand Plaza Hotel New York',
        body: `Booking Confirmed!

Confirmation Number: GPH-789456

Guest Name: David Thompson
Hotel: Grand Plaza Hotel New York
Address: 123 West 45th Street, New York, NY 10036

Check-in: December 5, 2024 (3:00 PM)
Check-out: December 7, 2024 (11:00 AM)

Room Type: Deluxe King Suite
Rate: $447.50 per night (2 nights)
Total: $895.00 + taxes

Amenities Included:
- Complimentary WiFi
- Fitness center access
- Daily continental breakfast

We look forward to welcoming you!

Grand Plaza Hotel New York`,
        hours: 60,
        forcedClassification: 'NO_REPLY_NEEDED',
        priority: 'LOW'
      },

      // NEEDS REVIEW scenarios (3)
      {
        subject: 'Website Deployment Issue',
        clientEmail: 'ethan.brown@browntech.com',
        clientName: 'Ethan Brown',
        body: `Hi Sarah,

We deployed the latest website updates last night, but we're experiencing an issue with the contact form. The submissions aren't coming through to our email.

This is affecting our lead generation. Can David or someone from his team investigate ASAP? Our marketing campaign launches tomorrow and we need this fixed.

I'm available for a call if needed.

Ethan Brown
CTO, Brown Technologies`,
        hours: 5,
        forcedClassification: 'CLIENT_TO_REPLY',
        priority: 'HIGH',
        needsReview: true
      },
      {
        subject: 'Re: Partnership Agreement Review',
        clientEmail: 'robert.kim@techventures.com',
        clientName: 'Robert Kim',
        body: `David,

I sent the partnership agreement for Tech Summit 2024 last week but haven't heard back. Legal needs your sign-off by Friday.

Key terms to review:
- $15,000 speaking fee
- IP rights section (page 8)
- 180-day exclusivity clause

This is a great opportunity but we need to move quickly. Can you review today?

Best,
Robert Kim`,
        hours: 72,
        forcedClassification: 'CLIENT_TO_REPLY',
        priority: 'HIGH',
        needsReview: true
      },
      {
        subject: 'Monthly Service Report Available',
        clientEmail: 'reports@analyticsservice.com',
        clientName: 'Analytics Dashboard',
        body: `Your November service report is now available.

Key Metrics:
- Total API calls: 1,245,678 (â†‘ 23% from last month)
- Average response time: 142ms (â†“ 8ms)
- Uptime: 99.97%
- New users: 2,340

Action Items:
- Review usage spike on Nov 15-17
- Consider upgrading to Enterprise tier
- Schedule quarterly business review

Download full report: [Link]

Questions? Reply to this email or call your account manager.`,
        hours: 80,
        forcedClassification: 'NO_REPLY_NEEDED',
        priority: 'MEDIUM',
        needsReview: true
      },
    ];
    
    console.log(`Creating ${conversations.length} realistic conversation threads...`);
    
    for (const conv of conversations) {
      // Use demo classification or actual service
      let cls;
      if (conv.forcedClassification) {
        cls = {
          classification: conv.forcedClassification,
          confidence: conv.needsReview ? 0.65 : 0.85,
          reasoning: `Classified as ${conv.forcedClassification}`,
          priority: conv.priority,
          needsHumanReview: conv.needsReview || false
        };
      } else {
        cls = await demoClassificationService.classify({
          subject: conv.subject,
          messages: [{ 
            body: { text: conv.body }, 
            sender: { name: conv.clientName, email: conv.clientEmail }, 
            recipients: { to: [{ name: 'Assistant', email: 'demo-assistant@example.com' }] }, 
            timestamp: new Date(), 
            isRead: false 
          }],
          sender: { name: conv.clientName, email: conv.clientEmail }
        });
      }
      
      const timestamp = new Date(Date.now() - conv.hours * 60 * 60 * 1000);
      
      await Conversation.create({
        subject: conv.subject,
        clientId: client.user._id,
        sender: { name: conv.clientName, email: conv.clientEmail },
        classification: cls.classification,
        classificationConfidence: cls.confidence,
        classificationReasoning: cls.reasoning,
        isManuallyClassified: false,
        needsHumanReview: cls.needsHumanReview,
        priority: cls.priority,
        statusFlags: {
          isRead: Math.random() > 0.6,
          isImportant: cls.priority === 'HIGH',
          isArchived: false,
          isCompleted: false
        },
        messages: [{
          sender: { name: conv.clientName, email: conv.clientEmail },
          recipients: { to: [{ email: client.user.email, name: client.user.fullName }] },
          timestamp: timestamp,
          isRead: false,
          body: { text: conv.body, html: `<p>${conv.body.replace(/\n/g, '<br>')}</p>` },
          attachments: []
        }],
        lastMessageTimestamp: timestamp,
        messageCount: 1,
        preview: conv.body.substring(0, 150) + '...',
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      
      console.log(`  âœ“ ${conv.subject} â†’ ${cls.classification}`);
    }
    
    // Show summary
    const createdConversations = await Conversation.find({});
    const stats = {
      total: createdConversations.length,
      clientToReply: createdConversations.filter(c => c.classification === 'CLIENT_TO_REPLY').length,
      assistantToReply: createdConversations.filter(c => c.classification === 'ASSISTANT_TO_REPLY').length,
      noReplyNeeded: createdConversations.filter(c => c.classification === 'NO_REPLY_NEEDED').length,
      needsReview: createdConversations.filter(c => c.needsHumanReview).length
    };
    
    console.log('\nðŸ“Š Seed Summary:');
    console.log(`   Total Conversations: ${stats.total}`);
    console.log(`   Client to Reply: ${stats.clientToReply}`);
    console.log(`   Assistant to Reply: ${stats.assistantToReply}`);
    console.log(`   No Reply Needed: ${stats.noReplyNeeded}`);
    console.log(`   Needs Review: ${stats.needsReview}`);
    
    console.log('\nâœ… Seed complete!');
    console.log('\nðŸ” Demo Credentials:');
    console.log('   Assistant: demo-assistant@example.com / password123');
    console.log('   Client: demo-client@example.com / password123');
    console.log('');
  } catch (error) {
    console.error('âŒ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seedData();