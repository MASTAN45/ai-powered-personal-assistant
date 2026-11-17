import { Deadline, IDeadline } from '../models/Deadline.model';
import { Conversation } from '../models/Conversation.model';

class DeadlineService {
  // Extract potential deadlines from conversation messages
  async extractDeadlinesFromConversation(conversationId: string, userId: string): Promise<IDeadline[]> {
    const conversation = await Conversation.findById(conversationId).populate('messages');
    if (!conversation) throw new Error('Conversation not found');

    const deadlines: any[] = [];
    const messages = (conversation as any).messages || [];

    for (const message of messages) {
      const content = message.body?.text || '';
      const extracted = this.detectDeadlinesInText(content, conversation.subject);
      
      for (const deadline of extracted) {
        // Check if deadline already exists
        const existing = await Deadline.findOne({
          conversation: conversationId,
          dueDate: deadline.dueDate,
        });

        if (!existing) {
          const newDeadline = await Deadline.create({
            title: deadline.title,
            conversation: conversationId,
            extractedFrom: deadline.extractedFrom,
            dueDate: deadline.dueDate,
            dueTime: deadline.dueTime,
            confidence: deadline.confidence,
            status: 'UPCOMING',
            isConfirmed: false,
            extractedBy: userId,
          });
          deadlines.push(newDeadline);
        }
      }
    }

    return deadlines;
  }

  private detectDeadlinesInText(text: string, subject: string): any[] {
    const deadlines: any[] = [];
    
    // Date patterns
    const datePatterns = [
      // MM/DD/YYYY or MM-DD-YYYY
      /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/g,
      // Month DD, YYYY
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})\b/gi,
      // DD Month YYYY
      /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/gi,
      // "by Friday", "by Monday"
      /by\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/gi,
      // "due on DATE"
      /due\s+(?:on|by)?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/gi,
      // "deadline: DATE"
      /deadline:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/gi,
    ];

    const contextKeywords = ['deadline', 'due', 'by', 'before', 'submit', 'deliver', 'complete'];
    
    // Check if text contains deadline-related keywords
    const hasDeadlineContext = contextKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );

    if (!hasDeadlineContext) return deadlines;

    // Extract dates using patterns
    for (const pattern of datePatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const dateStr = match[0];
        const context = text.substring(Math.max(0, match.index! - 50), Math.min(text.length, match.index! + 50));
        
        const parsedDate = this.parseDate(dateStr);
        if (parsedDate && parsedDate > new Date()) {
          deadlines.push({
            title: subject || 'Deadline',
            extractedFrom: context,
            dueDate: parsedDate,
            dueTime: this.extractTime(context),
            confidence: this.calculateConfidence(context, dateStr),
          });
        }
      }
    }

    return deadlines;
  }

  private parseDate(dateStr: string): Date | null {
    try {
      // Handle relative days (by Friday, etc.)
      const dayMatch = dateStr.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
      if (dayMatch) {
        return this.getNextWeekday(dayMatch[1]);
      }

      // Try parsing standard date formats
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date;
      }

      // Handle MM/DD/YYYY format
      const slashMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
      if (slashMatch) {
        const month = parseInt(slashMatch[1]) - 1;
        const day = parseInt(slashMatch[2]);
        const year = parseInt(slashMatch[3]);
        return new Date(year, month, day);
      }

      return null;
    } catch {
      return null;
    }
  }

  private getNextWeekday(dayName: string): Date {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = days.findIndex(d => d.toLowerCase() === dayName.toLowerCase());
    
    const today = new Date();
    const currentDay = today.getDay();
    
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    
    const result = new Date(today);
    result.setDate(today.getDate() + daysUntil);
    return result;
  }

  private extractTime(context: string): string | undefined {
    const timeMatch = context.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    if (timeMatch) {
      return timeMatch[0];
    }
    return undefined;
  }

  private calculateConfidence(context: string, dateStr: string): number {
    let confidence = 0.5;
    
    // Higher confidence if deadline keywords are nearby
    const lowerContext = context.toLowerCase();
    if (lowerContext.includes('deadline')) confidence += 0.2;
    if (lowerContext.includes('due')) confidence += 0.2;
    if (lowerContext.includes('must') || lowerContext.includes('need')) confidence += 0.1;
    
    // Higher confidence for explicit date formats
    if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(dateStr)) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  async getUpcomingDeadlines(userId: string): Promise<IDeadline[]> {
    const now = new Date();
    return Deadline.find({
      extractedBy: userId,
      status: { $in: ['UPCOMING', 'DUE_TODAY', 'OVERDUE'] },
      dueDate: { $gte: now },
    })
      .sort({ dueDate: 1 })
      .populate('conversation', 'subject sender')
      .exec();
  }

  async getOverdueDeadlines(userId: string): Promise<IDeadline[]> {
    const now = new Date();
    return Deadline.find({
      extractedBy: userId,
      status: 'OVERDUE',
      dueDate: { $lt: now },
    })
      .sort({ dueDate: -1 })
      .populate('conversation', 'subject sender')
      .exec();
  }

  async getAllDeadlines(userId: string): Promise<IDeadline[]> {
    return Deadline.find({ extractedBy: userId })
      .sort({ dueDate: 1 })
      .populate('conversation', 'subject sender')
      .exec();
  }

  async updateDeadlineStatus(deadlineId: string, status: IDeadline['status']): Promise<IDeadline | null> {
    return Deadline.findByIdAndUpdate(
      deadlineId,
      { status },
      { new: true }
    ).populate('conversation', 'subject sender');
  }

  async confirmDeadline(deadlineId: string, updates: Partial<IDeadline>): Promise<IDeadline | null> {
    return Deadline.findByIdAndUpdate(
      deadlineId,
      { ...updates, isConfirmed: true },
      { new: true }
    ).populate('conversation', 'subject sender');
  }

  async deleteDeadline(deadlineId: string): Promise<boolean> {
    const result = await Deadline.deleteOne({ _id: deadlineId });
    return result.deletedCount > 0;
  }
}

export default new DeadlineService();