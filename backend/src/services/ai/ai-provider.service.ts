import { geminiService, AIMessage, AIResponse } from './gemini.service';
import { fallbackAIService } from './fallback.service';
import { logger } from '../../config/logger';

export class AIProviderService {
  public async generateResponse(
    messages: AIMessage[],
    context?: any,
    systemPrompt?: string
  ): Promise<AIResponse> {
    try {
      // Try Gemini first
      const status = geminiService.getStatus();
      
      if (status.available) {
        try {
          return await geminiService.generateResponse(messages, systemPrompt);
        } catch (error: any) {
          logger.warn(`Gemini failed: ${error.message}. Falling back to rule-based AI.`);
          // Fall through to fallback
        }
      }

      // Use fallback
      return await fallbackAIService.generateResponse(messages, context);
    } catch (error) {
      logger.error('All AI providers failed:', error);
      throw new Error('AI service temporarily unavailable');
    }
  }

  public getProviderStatus() {
    return geminiService.getStatus();
  }
}

export const aiProviderService = new AIProviderService();