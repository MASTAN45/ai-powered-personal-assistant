import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User } from '../models/User.model';
import { Pairing } from '../models/Pairing.model';
import { Conversation } from '../models/Conversation.model';
import { authService } from '../services/auth.service';
import type { IUser } from '../models/User.model';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const DEMO_ASSISTANT_EMAIL = 'demo-assistant@example.com';
const DEMO_CLIENT_EMAIL = 'demo-client@example.com';
const DEMO_PASSWORD = 'password123';

const seedRealisticData = async () => {
  try {
    console.log('🌱 Starting realistic demo data seed...\n');
    await connectDatabase();
    
    // Step 1: Ensure demo accounts exist (idempotent)
    let assistant: IUser | null = await User.findOne({ email: DEMO_ASSISTANT_EMAIL });
    let client: IUser | null = await User.findOne({ email: DEMO_CLIENT_EMAIL });
    
    if (!assistant) {
      console.log('Creating demo assistant...');
      const assistantResult = await authService.register({
        email: DEMO_ASSISTANT_EMAIL,
        password: DEMO_PASSWORD,
        fullName: 'Sarah Chen',
        role: 'ASSISTANT',
      });
      assistant = await User.findById(assistantResult.user._id);
      console.log('✅ Demo assistant created');
    } else {
      console.log('✓ Demo assistant exists');
    }
    
    if (!client) {
      console.log('Creating demo client...');
      const clientResult = await authService.register({
        email: DEMO_CLIENT_EMAIL,
        password: DEMO_PASSWORD,
        fullName: 'David Thompson',
        role: 'CLIENT',
      });
      client = await User.findById(clientResult.user._id);
      console.log('✅ Demo client created');
    } else {
      console.log('✓ Demo client exists');
    }

    // Early return if users are not found
    if (!assistant || !client) {
      throw new Error('Failed to create or find demo users');
    }
    
    // Step 2: Ensure pairing exists (idempotent)
    const existingPairing = await Pairing.findOne({
      assistant: assistant._id,
      client: client._id,
    });
    
    if (!existingPairing) {
      console.log('Creating demo pairing...');
      await Pairing.create({
        assistant: assistant._id,
        client: client._id,
        status: 'ACCEPTED',
        invitationCode: 'INV-DEMO-SEED',
        invitedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        acceptedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });
      console.log('✅ Demo pairing created');
    } else {
      console.log('✓ Demo pairing exists');
    }
    
    // Step 3: Check if conversations already exist
    const existingConversations = await Conversation.countDocuments({ clientId: client._id });
    
    if (existingConversations > 0) {
      console.log(\\n✓ Found \ existing conversations\);
      console.log('Skipping conversation creation (already seeded)\n');
      console.log('To reseed, delete conversations manually in MongoDB Atlas first.\n');
    } else {
      console.log('\nCreating realistic conversations...\n');
      
      const conversations = [
        // CLIENT_TO_REPLY - Requires client action
        {
          subject: 'Q4 Budget Approval Required',
          sender: { name: 'Michael Rodriguez', email: 'michael.r@techcorp.com' },
          classification: 'CLIENT_TO_REPLY',
          priority: 'HIGH',
          confidence: 0.92,
          reasoning: 'Email explicitly requests budget approval with decision deadline',
          hoursAgo: 4,
          messages: [
            {
              body: \Hi David,\n\nI hope this email finds you well. I'm reaching out regarding the Q4 marketing budget proposal I submitted last week.\n\nWe need your approval by end of day Thursday to proceed with the planned campaigns. The proposal includes:\n\n• Social media advertising (\,000)\n• Content creation (\,000)\n• Event sponsorships (\,000)\n• Total: \,000\n\nPlease review the attached detailed breakdown and let me know if you have any questions or need clarification on any items.\n\nLooking forward to your response.\n\nBest regards,\nMichael Rodriguez\nMarketing Director\,
              hoursAgo: 4
            }
          ]
        },
        {
          subject: 'Website Redesign Proposal - Feedback Needed',
          sender: { name: 'Emily Chen', email: 'emily.chen@designstudio.com' },
          classification: 'CLIENT_TO_REPLY',
          priority: 'MEDIUM',
          confidence: 0.88,
          reasoning: 'Designer is waiting for client feedback on proposal to proceed',
          hoursAgo: 12,
          messages: [
            {
              body: \Dear David,\n\nThank you for the opportunity to present our website redesign proposal. We've incorporated all the elements we discussed in our last meeting.\n\nKey highlights:\n- Modern, responsive design\n- Improved user navigation\n- Enhanced mobile experience\n- Integrated blog platform\n- SEO optimization\n\nThe timeline would be 8-10 weeks from approval, with launch targeted for early Q1.\n\nCould you share your thoughts on the design direction and overall approach? I've attached mockups for the homepage and three internal pages.\n\nI'm happy to schedule a call if you'd like to discuss any aspects in detail.\n\nBest,\nEmily Chen\nSenior Designer\,
              hoursAgo: 12
            }
          ]
        },
        {
          subject: 'Annual Contract Renewal - Action Required',
          sender: { name: 'Robert Kim', email: 'robert.kim@cloudsolutions.io' },
          classification: 'CLIENT_TO_REPLY',
          priority: 'HIGH',
          confidence: 0.95,
          reasoning: 'Contract expiring soon, requires immediate decision and signature',
          hoursAgo: 6,
          messages: [
            {
              body: \Hi David,\n\nYour annual CloudSolutions subscription expires on November 30th. To ensure uninterrupted service, we need your renewal decision this week.\n\nRenewal benefits:\n✓ Lock in current pricing (rates increase 12% Jan 1st)\n✓ 500GB additional storage included\n✓ Priority support with 2-hour response time\n✓ Quarterly business reviews\n\nTotal: \,400/year (vs. \,888 at new rates)\n\nI can send the renewal contract today if you'd like to proceed. Just reply with confirmation and I'll handle the rest.\n\nLet me know if you have any questions!\n\nRegards,\nRobert Kim\nAccount Executive\,
              hoursAgo: 6
            }
          ]
        },
        {
          subject: 'Partnership Agreement Review Needed',
          sender: { name: 'Jessica Martinez', email: 'j.martinez@legalpartners.com' },
          classification: 'CLIENT_TO_REPLY',
          priority: 'HIGH',
          confidence: 0.90,
          reasoning: 'Legal document requires review and approval with time sensitivity',
          hoursAgo: 18,
          messages: [
            {
              body: \David,\n\nI've finalized the partnership agreement for the TechSummit 2025 collaboration. Legal has reviewed and approved the terms.\n\nKey provisions:\n- 18-month partnership term\n- \,000 speaking fee\n- Intellectual property rights (Section 8)\n- 90-day exclusivity clause\n- Joint marketing opportunities\n\nWe need your signature by Friday to meet the event planning deadline. The agreement is attached.\n\nPlease review sections 8 and 12 carefully - these are the terms we negotiated last month.\n\nLet me know if you need any clarifications.\n\nBest,\nJessica Martinez\nPartnership Director\,
              hoursAgo: 18
            }
          ]
        },
        
        // ASSISTANT_TO_REPLY - Assistant needs to handle
        {
          subject: 'Travel Arrangements for NYC Conference',
          sender: { name: client.fullName, email: client.email },
          classification: 'ASSISTANT_TO_REPLY',
          priority: 'MEDIUM',
          confidence: 0.93,
          reasoning: 'Client requesting assistant to book travel arrangements',
          hoursAgo: 8,
          messages: [
            {
              body: \Sarah,\n\nI need travel arrangements for the NYC Tech Conference December 12-14.\n\nPlease book:\n- Round-trip flights from SFO (prefer morning departure, evening return)\n- Hotel near Times Square, 4-star, close to conference venue\n- Ground transportation to/from airport\n\nBudget: Standard corporate travel policy\n\nI'll need the complete itinerary by end of week. Use the company Amex.\n\nThanks!\nDavid\,
              hoursAgo: 8
            }
          ]
        },
        {
          subject: 'Team Lunch Catering - Friday',
          sender: { name: client.fullName, email: client.email },
          classification: 'ASSISTANT_TO_REPLY',
          priority: 'LOW',
          confidence: 0.89,
          reasoning: 'Administrative task delegated to assistant',
          hoursAgo: 20,
          messages: [
            {
              body: \Hi Sarah,\n\nWe're celebrating the project launch with a team lunch this Friday at 12:30 PM.\n\nPlease arrange catering for 28 people from Bella Italia (everyone loved them last time).\n\nDietary requirements:\n- 4 vegetarian meals\n- 2 gluten-free options\n- 1 vegan option\n\nBudget: \\n\nCan you confirm once ordered?\n\nThanks,\nDavid\,
              hoursAgo: 20
            }
          ]
        },
        {
          subject: 'Dentist Appointment Reschedule',
          sender: { name: client.fullName, email: client.email },
          classification: 'ASSISTANT_TO_REPLY',
          priority: 'MEDIUM',
          confidence: 0.91,
          reasoning: 'Personal scheduling task for assistant',
          hoursAgo: 15,
          messages: [
            {
              body: \Sarah,\n\nI need to reschedule my dentist appointment (currently Nov 20, 3 PM). A client meeting came up that I can't move.\n\nCan you find me a slot next week? Morning appointments work best (9-11 AM).\n\nThanks,\nDavid\,
              hoursAgo: 15
            }
          ]
        },
        {
          subject: 'Board Gift Baskets',
          sender: { name: client.fullName, email: client.email },
          classification: 'ASSISTANT_TO_REPLY',
          priority: 'LOW',
          confidence: 0.87,
          reasoning: 'Gift coordination task for assistant',
          hoursAgo: 30,
          messages: [
            {
              body: \Hi Sarah,\n\nFollowing last week's successful board meeting, please send thank-you gift baskets to all 8 board members.\n\nUse Gourmet Delights (we've used them before). Budget \ per person.\n\nI'll send you personalized message content for each person tomorrow.\n\nThanks,\nDavid\,
              hoursAgo: 30
            }
          ]
        },
        
        // NO_REPLY_NEEDED - FYI/Informational
        {
          subject: 'Flight Confirmation - NYC Trip',
          sender: { name: 'American Airlines', email: 'noreply@aa.com' },
          classification: 'NO_REPLY_NEEDED',
          priority: 'LOW',
          confidence: 0.96,
          reasoning: 'Automated flight confirmation, no action required',
          hoursAgo: 24,
          messages: [
            {
              body: \Flight Confirmation\n\nConfirmation Code: ABC123\n\nPassenger: David Thompson\n\nDECEMBER 12, 2024\nSan Francisco (SFO) → New York (JFK)\nFlight AA 245\nDeparture: 8:45 AM PST | Arrival: 5:15 PM EST\nSeat: 4A (Premium Economy)\n\nDECEMBER 14, 2024\nNew York (JFK) → San Francisco (SFO)\nFlight AA 312\nDeparture: 7:00 PM EST | Arrival: 10:25 PM PST\nSeat: 4A (Premium Economy)\n\nCheck-in opens 24 hours before departure.\nDownload the AA app for mobile boarding pass.\,
              hoursAgo: 24
            }
          ]
        },
        {
          subject: 'November Expense Report Approved',
          sender: { name: 'Finance Department', email: 'finance@company.com' },
          classification: 'NO_REPLY_NEEDED',
          priority: 'LOW',
          confidence: 0.94,
          reasoning: 'Expense confirmation, informational only',
          hoursAgo: 36,
          messages: [
            {
              body: \Hi David,\n\nYour November expense report has been processed and approved.\n\nTotal Reimbursement: \,847.60\n\nBreakdown:\n- Business Travel: \,650.00\n- Client Entertainment: \.50\n- Office Supplies: \.10\n\nReimbursement will appear in your December 1st paycheck.\n\nIf you have questions, contact the finance team.\n\nFinance Department\,
              hoursAgo: 36
            }
          ]
        },
        {
          subject: 'Hotel Reservation Confirmed - NYC',
          sender: { name: 'Marriott Hotels', email: 'reservations@marriott.com' },
          classification: 'NO_REPLY_NEEDED',
          priority: 'LOW',
          confidence: 0.95,
          reasoning: 'Hotel confirmation, no action needed',
          hoursAgo: 26,
          messages: [
            {
              body: \Reservation Confirmed\n\nConfirmation Number: MH-789456\n\nGuest Name: David Thompson\nHotel: New York Marriott Marquis\nAddress: 1535 Broadway, New York, NY 10036\n\nCheck-in: December 12, 2024 (3:00 PM)\nCheck-out: December 14, 2024 (11:00 AM)\n\nRoom Type: Deluxe King Room\nRate: \.00 per night (2 nights)\nTotal: \.00 + taxes\n\nAmenities:\n✓ Complimentary WiFi\n✓ Fitness center access\n✓ Business center\n\nWe look forward to welcoming you!\,
              hoursAgo: 26
            }
          ]
        },
        {
          subject: 'Weekly Analytics Report',
          sender: { name: 'Analytics Platform', email: 'reports@analytics.io' },
          classification: 'NO_REPLY_NEEDED',
          priority: 'LOW',
          confidence: 0.91,
          reasoning: 'Automated weekly report, informational',
          hoursAgo: 48,
          messages: [
            {
              body: \Your Weekly Report - Nov 11-17\n\nKey Metrics:\n📈 Website Traffic: 45,230 visitors (+8% from last week)\n📊 Conversion Rate: 3.2% (+0.4%)\n👥 New Users: 12,450\n⏱️ Avg. Session: 4:23 minutes\n\nTop Pages:\n1. Homepage (18,420 views)\n2. Product Catalog (8,340 views)\n3. Pricing (5,120 views)\n\nTop Traffic Sources:\n1. Organic Search: 42%\n2. Direct: 28%\n3. Social Media: 18%\n4. Paid Ads: 12%\n\nFull report available in your dashboard.\,
              hoursAgo: 48
            }
          ]
        },
        
        // NEEDS_REVIEW - Ambiguous or requires human judgment
        {
          subject: 'Potential Partnership Opportunity',
          sender: { name: 'Amanda Foster', email: 'a.foster@innovateventures.com' },
          classification: 'CLIENT_TO_REPLY',
          priority: 'MEDIUM',
          confidence: 0.68,
          reasoning: 'Unsolicited business inquiry, unclear if legitimate or spam',
          hoursAgo: 10,
          needsReview: true,
          messages: [
            {
              body: \Dear David,\n\nI came across your company profile and was impressed by your recent growth trajectory.\n\nInnovate Ventures specializes in helping mid-size tech companies scale through strategic partnerships and market expansion.\n\nWe've successfully partnered with companies like TechStart, CloudBase, and DataFlow.\n\nI'd love to schedule a brief 15-minute call to explore potential synergies.\n\nWould next Tuesday or Thursday work for you?\n\nBest regards,\nAmanda Foster\nBusiness Development Director\nInnovate Ventures\,
              hoursAgo: 10
            }
          ]
        },
        {
          subject: 'Urgent: Server Performance Issues',
          sender: { name: 'DevOps Team', email: 'devops@company.com' },
          classification: 'CLIENT_TO_REPLY',
          priority: 'HIGH',
          confidence: 0.72,
          reasoning: 'Technical issue that may require client decision or may be handled by team',
          hoursAgo: 2,
          needsReview: true,
          messages: [
            {
              body: \Hi David,\n\nWe've detected elevated response times on the production API servers over the past 2 hours.\n\nCurrent Status:\n- Average response time: 2.3s (normal: 0.4s)\n- Error rate: 1.2% (normal: 0.1%)\n- Traffic: Normal levels\n\nWe've identified the issue as database query inefficiency and have two options:\n\n1. Quick fix: Optimize specific queries (2 hours)\n2. Comprehensive: Database infrastructure upgrade (\/month additional cost)\n\nQuick fix will resolve immediate issue. Comprehensive solution prevents future occurrences.\n\nWhat would you like us to prioritize?\n\nDevOps Team\,
              hoursAgo: 2
            }
          ]
        },
        {
          subject: 'Re: Contract Terms Discussion',
          sender: { name: 'Patricia Wilson', email: 'p.wilson@megacorp.com' },
          classification: 'CLIENT_TO_REPLY',
          priority: 'MEDIUM',
          confidence: 0.70,
          reasoning: 'Ongoing negotiation, unclear if ready for client input or still being handled',
          hoursAgo: 14,
          needsReview: true,
          messages: [
            {
              body: \David,\n\nFollowing our conversation last week, I've reviewed the proposed terms with our legal team.\n\nWe're generally comfortable with the structure, but have a few considerations:\n\n1. Payment terms: Can we move to Net-45 instead of Net-30?\n2. Deliverable timeline: Extension of 2 weeks on Phase 2?\n3. Intellectual property: Some clarification needed on section 4.2\n\nThese aren't dealbreakers, just points for discussion. Are you available for a quick call this week to iron out these details?\n\nBest,\nPatricia Wilson\nProcurement Director\,
              hoursAgo: 14
            }
          ]
        },
      ];
      
      console.log(\Creating \ realistic conversations...\n\);
      
      for (const conv of conversations) {
        const timestamp = new Date(Date.now() - conv.hoursAgo * 60 * 60 * 1000);
        
        const messages = conv.messages.map((msg: any, idx: number) => ({
          sender: conv.sender,
          recipients: { to: [{ email: client.email, name: client.fullName }] },
          timestamp: new Date(timestamp.getTime() - ((conv.messages.length - idx - 1) * 3600000)),
          isRead: false,
          body: { text: msg.body, html: \<p>\</p>\ },
          attachments: []
        }));
        
        await Conversation.create({
          subject: conv.subject,
          clientId: client._id,
          sender: conv.sender,
          classification: conv.classification,
          classificationConfidence: conv.confidence,
          classificationReasoning: conv.reasoning,
          isManuallyClassified: false,
          needsHumanReview: conv.needsReview || false,
          priority: conv.priority,
          statusFlags: {
            isRead: conv.classification === 'NO_REPLY_NEEDED' || Math.random() > 0.7,
            isImportant: conv.priority === 'HIGH',
            isArchived: false,
            isCompleted: false
          },
          messages: messages,
          lastMessageTimestamp: timestamp,
          messageCount: messages.length,
          preview: messages[messages.length - 1].body.text.substring(0, 150) + '...',
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        
        console.log(\  ✓ \ → \ (\)\);
      }
      
      const stats = {
        total: conversations.length,
        clientToReply: conversations.filter(c => c.classification === 'CLIENT_TO_REPLY').length,
        assistantToReply: conversations.filter(c => c.classification === 'ASSISTANT_TO_REPLY').length,
        noReplyNeeded: conversations.filter(c => c.classification === 'NO_REPLY_NEEDED').length,
        needsReview: conversations.filter(c => c.needsReview).length,
      };
      
      console.log('\n📊 Seed Summary:');
      console.log(\   Total: \\);
      console.log(\   Client to Reply: \\);
      console.log(\   Assistant to Reply: \\);
      console.log(\   No Reply Needed: \\);
      console.log(\   Needs Review: \\);
    }
    
    console.log('\n✅ Realistic demo data seed complete!');
    console.log('\n🔐 Demo Credentials:');
    console.log('   Assistant: demo-assistant@example.com / password123');
    console.log('   Client: demo-client@example.com / password123\n');
    
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seedRealisticData();
