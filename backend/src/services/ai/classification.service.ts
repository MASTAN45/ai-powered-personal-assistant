import { IConversation } from '../../models/Conversation.model';

export interface ClassificationResult {
  classification: 'ASSISTANT_TO_REPLY' | 'CLIENT_TO_REPLY' | 'NO_REPLY_NEEDED';
  confidence: number;
  reasoning: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  suggestedAction?: string;
  needsHumanReview: boolean;
  signals: string[];
}

export class DemoClassificationService {
  // Keywords that indicate assistant should handle
  private assistantKeywords = [
    'schedule', 'reschedule', 'appointment', 'meeting time', 'calendar', 'availability',
    'confirm', 'confirmation', 'rsvp', 'booking', 'reservation',
    'forward', 'send me', 'can you send', 'please send',
    'reminder', 'follow up', 'follow-up', 'checking in',
    'invoice', 'receipt', 'payment', 'billing',
    'information', 'details', 'status update', 'update on',
    'coordinate', 'arrange', 'organize', 'set up',
  ];

  // Keywords that indicate client must handle
  private clientKeywords = [
    'approve', 'approval', 'decision', 'decide', 'authorize', 'authorization',
    'sign', 'signature', 'review and sign', 'contract',
    'your opinion', 'what do you think', 'your thoughts', 'your input',
    'personal', 'confidential', 'sensitive', 'private matter',
    'executive decision', 'strategic', 'business decision',
    'board', 'investors', 'stakeholders', 'partnership',
    'negotiate', 'negotiation', 'terms', 'agreement',
    'legal', 'compliance', 'regulatory',
  ];

  // Keywords that indicate no reply needed
  private noReplyKeywords = [
    'newsletter', 'unsubscribe', 'notification', 'automated',
    'no reply', 'noreply', 'do not reply',
    'fyi', 'for your information', 'heads up', 'just so you know',
    'thank you', 'thanks', 'received', 'acknowledged',
    'confirmation number', 'order confirmed', 'booking confirmed',
    'out of office', 'auto reply', 'automatic response',
  ];

  // Urgent indicators
  private urgentKeywords = [
    'urgent', 'asap', 'immediately', 'emergency', 'critical',
    'time sensitive', 'deadline', 'due today', 'due tomorrow',
    'last chance', 'final notice', 'overdue', 'past due',
  ];

  // Question patterns
  private questionPatterns = [
    /\?$/m,
    /^(can|could|would|will|should|do|does|is|are|when|where|who|what|why|how)\s/im,
    /please (let me know|confirm|advise|inform)/i,
  ];

  public async classify(conversation: Partial<IConversation>): Promise<ClassificationResult> {
    const signals: string[] = [];
    let score = 0;
    const weights = {
      assistantKeyword: 3,
      clientKeyword: 5,
      noReplyKeyword: 4,
      urgentKeyword: 2,
      hasQuestion: 3,
      senderImportance: 2,
      recentMessage: 1,
    };

    // Combine all text for analysis
    const subject = (conversation.subject || '').toLowerCase();
    const latestMessage = conversation.messages?.[conversation.messages.length - 1];
    const messageBody = latestMessage?.body?.text?.toLowerCase() || '';
    const fullText = `${subject} ${messageBody}`;
    const senderEmail = conversation.sender?.email?.toLowerCase() || '';

    // Check for urgent indicators
    const isUrgent = this.urgentKeywords.some(keyword => fullText.includes(keyword));
    if (isUrgent) {
      score += weights.urgentKeyword;
      signals.push('Contains urgent language');
    }

    // Check for questions
    const hasQuestion = this.questionPatterns.some(pattern => pattern.test(messageBody));
    if (hasQuestion) {
      score += weights.hasQuestion;
      signals.push('Contains question or request');
    }

    // Check for no-reply patterns
    const noReplyMatches = this.noReplyKeywords.filter(keyword => fullText.includes(keyword));
    if (noReplyMatches.length > 0) {
      signals.push(`Contains no-reply indicators: ${noReplyMatches.slice(0, 2).join(', ')}`);
      return {
        classification: 'NO_REPLY_NEEDED',
        confidence: Math.min(0.7 + (noReplyMatches.length * 0.1), 0.95),
        reasoning: `This appears to be an automated message or informational email: ${signals.join('; ')}`,
        priority: 'LOW',
        needsHumanReview: false,
        signals,
      };
    }

    // Check client keywords
    const clientMatches = this.clientKeywords.filter(keyword => fullText.includes(keyword));
    const clientScore = clientMatches.length * weights.clientKeyword;

    // Check assistant keywords  
    const assistantMatches = this.assistantKeywords.filter(keyword => fullText.includes(keyword));
    const assistantScore = assistantMatches.length * weights.assistantKeyword;

    if (clientMatches.length > 0) {
      signals.push(`Contains client-decision keywords: ${clientMatches.slice(0, 3).join(', ')}`);
    }

    if (assistantMatches.length > 0) {
      signals.push(`Contains administrative keywords: ${assistantMatches.slice(0, 3).join(', ')}`);
    }

    // Determine classification based on scores
    let classification: ClassificationResult['classification'];
    let confidence: number;
    let reasoning: string;
    let priority: ClassificationResult['priority'] = 'MEDIUM';
    let suggestedAction: string | undefined;

    if (clientScore > assistantScore && clientScore > 0) {
      classification = 'CLIENT_TO_REPLY';
      confidence = Math.min(0.6 + (clientScore * 0.05), 0.95);
      reasoning = `Requires client decision or approval. ${signals.join('; ')}`;
      priority = isUrgent ? 'URGENT' : clientScore > 10 ? 'HIGH' : 'MEDIUM';
      suggestedAction = 'Forward to client with context and deadline if applicable';
    } else if (assistantScore > clientScore && assistantScore > 0) {
      classification = 'ASSISTANT_TO_REPLY';
      confidence = Math.min(0.65 + (assistantScore * 0.04), 0.92);
      reasoning = `Standard administrative or coordinat ion task. ${signals.join('; ')}`;
      priority = isUrgent ? 'HIGH' : 'MEDIUM';
      suggestedAction = hasQuestion ? 'Respond with requested information' : 'Acknowledge and proceed';
    } else if (hasQuestion) {
      // Has question but unclear keywords - likely assistant
      classification = 'ASSISTANT_TO_REPLY';
      confidence = 0.55;
      reasoning = 'Contains question but unclear responsibility. Defaulting to assistant review.';
      priority = 'MEDIUM';
      suggestedAction = 'Review content and determine appropriate response';
      signals.push('Ambiguous - contains question but unclear keywords');
    } else {
      // No clear signals - needs review
      classification = 'NO_REPLY_NEEDED';
      confidence = 0.45;
      reasoning = 'No clear action required. May be informational.';
      priority = 'LOW';
      signals.push('No strong signals detected');
    }

    // Low confidence needs human review
    const needsHumanReview = confidence < 0.6;

    return {
      classification,
      confidence,
      reasoning,
      priority,
      suggestedAction,
      needsHumanReview,
      signals,
    };
  }
}

export const demoClassificationService = new DemoClassificationService();
