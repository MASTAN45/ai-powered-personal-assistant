import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { logger } from '../../config/logger';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  provider: 'gemini' | 'fallback';
  model?: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private isAvailable: boolean = false;
  private readonly modelName: string;

  constructor() {
    this.modelName = process.env.GEMINI_MODEL || 'gemini-pro';
    this.initialize();
  }

  private initialize(): void {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === '' || apiKey === 'your-api-key-here') {
      logger.warn('Gemini API key not configured. Using fallback AI provider.');
      this.isAvailable = false;
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: this.modelName });
      this.isAvailable = true;
      logger.info(`Gemini service initialized with model: ${this.modelName}`);
    } catch (error) {
      logger.error('Failed to initialize Gemini service:', error);
      this.isAvailable = false;
    }
  }

  public async generateResponse(
    messages: AIMessage[],
    systemPrompt?: string
  ): Promise<AIResponse> {
    if (!this.isAvailable || !this.model) {
      throw new Error('GEMINI_UNAVAILABLE');
    }

    try {
      // Build conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // Prepare prompt with system context
      let prompt = '';
      if (systemPrompt) {
        prompt = `${systemPrompt}\n\n`;
      }
      
      // Add the latest user message
      const lastMessage = messages[messages.length - 1];
      prompt += lastMessage.content;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim() === '') {
        throw new Error('Empty response from Gemini');
      }

      return {
        content: text,
        provider: 'gemini',
        model: this.modelName,
      };
    } catch (error: any) {
      logger.error('Gemini generation error:', error);

      // Handle specific error types
      if (error.message?.includes('quota')) {
        throw new Error('QUOTA_EXCEEDED');
      }
      if (error.message?.includes('rate limit')) {
        throw new Error('RATE_LIMIT');
      }
      if (error.message?.includes('invalid')) {
        throw new Error('INVALID_REQUEST');
      }

      throw new Error('GENERATION_FAILED');
    }
  }

  public getStatus(): { available: boolean; provider: string; model?: string } {
    return {
      available: this.isAvailable,
      provider: this.isAvailable ? 'gemini' : 'fallback',
      model: this.isAvailable ? this.modelName : undefined,
    };
  }
}

export const geminiService = new GeminiService();