import { logger } from '../../config/logger';

export interface DetectedAction {
  id: string;
  type: 'read' | 'write';
  operation: string;
  description: string;
  data: any;
  requiresConfirmation: boolean;
}

class ActionDetectorService {
  // Keywords that indicate write operations
  private writeKeywords = [
    'mark as complete',
    'mark complete',
    'complete',
    'archive',
    'delete',
    'remove',
    'update',
    'change',
    'modify',
    'set',
    'reclassify',
    'mark as important',
    'mark as urgent',
    'unmark',
    'flag',
    'unflag',
  ];

  // Keywords that indicate read operations
  private readKeywords = [
    'show',
    'list',
    'find',
    'search',
    'get',
    'display',
    'summarize',
    'count',
    'how many',
    'what are',
    'tell me',
  ];

  /**
   * Detect action intent from user message
   */
  public detectAction(message: string): DetectedAction | null {
    const lowerMessage = message.toLowerCase();

    // Check for write operations
    for (const keyword of this.writeKeywords) {
      if (lowerMessage.includes(keyword)) {
        return this.parseWriteAction(message, keyword);
      }
    }

    // Check for read operations
    for (const keyword of this.readKeywords) {
      if (lowerMessage.includes(keyword)) {
        return this.parseReadAction(message, keyword);
      }
    }

    return null;
  }

  /**
   * Parse write action (requires confirmation)
   */
  private parseWriteAction(message: string, keyword: string): DetectedAction {
    const actionId = `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    let operation = 'update';
    let description = 'Update conversation';
    let data: any = {};

    const lowerMessage = message.toLowerCase();

    // Mark as complete
    if (lowerMessage.includes('complete')) {
      operation = 'mark-complete';
      description = 'Mark conversation(s) as complete';
      data = { status: 'complete' };
    }
    // Archive
    else if (lowerMessage.includes('archive')) {
      operation = 'archive';
      description = 'Archive conversation(s)';
      data = { archived: true };
    }
    // Delete
    else if (lowerMessage.includes('delete') || lowerMessage.includes('remove')) {
      operation = 'delete';
      description = 'Delete conversation(s)';
      data = { action: 'delete' };
    }
    // Mark as important/urgent
    else if (lowerMessage.includes('important')) {
      operation = 'mark-important';
      description = 'Mark conversation(s) as important';
      data = { isImportant: true };
    }
    else if (lowerMessage.includes('urgent')) {
      operation = 'reclassify';
      description = 'Reclassify conversation(s) as URGENT';
      data = { classification: 'urgent' };
    }

    // Try to extract conversation IDs or filters
    data.filter = this.extractFilter(message);

    return {
      id: actionId,
      type: 'write',
      operation,
      description,
      data,
      requiresConfirmation: true,
    };
  }

  /**
   * Parse read action (auto-execute)
   */
  private parseReadAction(message: string, keyword: string): DetectedAction {
    const actionId = `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: actionId,
      type: 'read',
      operation: 'query',
      description: 'Fetch conversation data',
      data: { filter: this.extractFilter(message) },
      requiresConfirmation: false,
    };
  }

  /**
   * Extract filter criteria from message
   */
  private extractFilter(message: string): any {
    const lowerMessage = message.toLowerCase();
    const filter: any = {};

    // Classification
    if (lowerMessage.includes('urgent')) {
      filter.classification = 'urgent';
    } else if (lowerMessage.includes('important')) {
      filter.classification = 'important';
    } else if (lowerMessage.includes('fyi')) {
      filter.classification = 'fyi';
    }

    // Status
    if (lowerMessage.includes('unread')) {
      filter.isRead = false;
    } else if (lowerMessage.includes('read')) {
      filter.isRead = true;
    }

    if (lowerMessage.includes('pending')) {
      filter.status = 'pending';
    }

    // Extract numbers (could be IDs or counts)
    const numbers = message.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      filter.count = parseInt(numbers[0]);
    }

    return filter;
  }
}

export const actionDetectorService = new ActionDetectorService();
