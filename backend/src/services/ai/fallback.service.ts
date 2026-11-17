import { AIMessage, AIResponse } from './gemini.service';
import { logger } from '../../config/logger';

export class FallbackAIService {
  public async generateResponse(messages: AIMessage[], context?: any): Promise<AIResponse> {
    logger.info('Using fallback AI service');

    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content.toLowerCase();

    // Pattern matching for common queries
    let response = '';

    if (userQuery.includes('summarize') || userQuery.includes('summary')) {
      response = this.generateSummary(context);
    } else if (userQuery.includes('urgent') || userQuery.includes('priority')) {
      response = this.generateUrgentList(context);
    } else if (userQuery.includes('deadline') || userQuery.includes('appointment')) {
      response = this.generateDeadlineInfo(context);
    } else if (userQuery.includes('draft') || userQuery.includes('reply') || userQuery.includes('response')) {
      response = this.generateReplyDraft(context);
    } else if (userQuery.includes('action') || userQuery.includes('to do') || userQuery.includes('todo')) {
      response = this.generateActionItems(context);
    } else {
      response = `I understand you're asking about: "${lastMessage.content}"\n\nAs a rule-based assistant, I can help you with:\n\n- Summarizing pending emails\n- Finding urgent conversations\n- Identifying deadlines and appointments\n- Drafting email replies\n- Listing action items\n\nPlease ask a more specific question, or configure the Gemini API key for advanced AI capabilities.`;
    }

    return {
      content: response,
      provider: 'fallback',
    };
  }

  private generateSummary(context?: any): string {
    if (!context || !context.conversations) {
      return 'No conversation data available to summarize. Please ensure you have active conversations.';
    }

    const conversations = context.conversations;
    const pending = conversations.filter((c: any) => 
      c.classification === 'CLIENT_TO_REPLY' || c.classification === 'ASSISTANT_TO_REPLY'
    );

    return `📧 **Email Summary**\n\nYou have **${conversations.length} total conversations**:\n- ${pending.length} requiring attention\n- ${conversations.filter((c: any) => c.priority === 'HIGH').length} high priority\n- ${conversations.filter((c: any) => !c.statusFlags.isRead).length} unread\n\nMost recent conversations need responses from ${pending.length > 0 ? 'clients and you' : 'various parties'}.`;
  }

  private generateUrgentList(context?: any): string {
    if (!context || !context.conversations) {
      return 'No conversations found.';
    }

    const urgent = context.conversations.filter((c: any) => c.priority === 'HIGH');

    if (urgent.length === 0) {
      return '✅ Great news! You have no urgent conversations at the moment.';
    }

    const list = urgent.slice(0, 5).map((c: any, i: number) => 
      `${i + 1}. **${c.subject}** - ${c.client?.fullName || 'Unknown client'}`
    ).join('\n');

    return `🚨 **Urgent Conversations (${urgent.length})**\n\n${list}\n\n${urgent.length > 5 ? `... and ${urgent.length - 5} more` : ''}`;
  }

  private generateDeadlineInfo(context?: any): string {
    if (!context || !context.deadlines) {
      return 'No deadline information available.';
    }

    const deadlines = context.deadlines;
    if (deadlines.length === 0) {
      return '📅 You have no upcoming deadlines.';
    }

    const list = deadlines.slice(0, 5).map((d: any, i: number) => 
      `${i + 1}. **${d.title}** - ${new Date(d.dueDate).toLocaleDateString()}`
    ).join('\n');

    return `📅 **Upcoming Deadlines (${deadlines.length})**\n\n${list}`;
  }

  private generateReplyDraft(context?: any): string {
    if (!context || !context.selectedConversation) {
      return 'Please select a specific conversation to draft a reply.';
    }

    const conversation = context.selectedConversation;
    return `📝 **Draft Reply**\n\nDear ${conversation.client?.fullName || 'Client'},\n\nThank you for your message regarding "${conversation.subject}".\n\n[Your response here]\n\nBest regards`;
  }

  private generateActionItems(context?: any): string {
    if (!context || !context.conversations) {
      return 'No action items found.';
    }

    const actionNeeded = context.conversations.filter((c: any) => 
      c.classification === 'ASSISTANT_TO_REPLY' || c.statusFlags.needsReview
    );

    if (actionNeeded.length === 0) {
      return '✅ No pending actions at the moment!';
    }

    const list = actionNeeded.slice(0, 5).map((c: any, i: number) => 
      `${i + 1}. Reply to **${c.subject}**`
    ).join('\n');

    return `✓ **Action Items (${actionNeeded.length})**\n\n${list}`;
  }
}

export const fallbackAIService = new FallbackAIService();