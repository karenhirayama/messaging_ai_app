import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';

import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;
  private readonly model = 'gemini-2.5-flash';

  constructor(
    private configService: ConfigService,
    private readonly chatService: ChatService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.ai = new GoogleGenAI({
      apiKey,
    });
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      });

      if (!response.text) {
        throw new Error('AI generation returned no text or was blocked.');
      }

      return response.text;
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  async generateAiResponse(
    userId: string,
    conversationId: string,
    prompt: string,
  ) {
    const clientMessage = prompt.replace('@Lari', '').trim();

    const history = await this.chatService.getConversationHistory(
      conversationId,
      userId,
    );

    let contextHistory = history.map((message) => ({
      role: message.sender_id === userId ? 'user' : 'assistant',
      parts: [
        {
          text: `${message.sender_nickname || 'Friend'}: ${message.content}`,
        },
      ],
    }));

    contextHistory.push({
      role: 'user',
      parts: [{ text: `User Prompt: ${clientMessage}` }],
    });

    const systemPrompt =
      'You are Lari, a helpful and friendly AI integrated into a messaging app. The user is asking a question within the context of the conversation history provided below. Analyze the history conversation and the current prompt to provide a concise, relevant, and conversational answer.';

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: contextHistory,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      const aiText = response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (typeof aiText !== 'string' || aiText.trim() === '') {
        console.error(
          'AI generation failed to produce text in generateAiResponse. Response:',
          JSON.stringify(response),
        );
        const fallbackText =
          "Apologies, I couldn't generate a response right now. The model might have encountered an issue or the content was blocked.";

        await this.chatService.saveMessage(
          userId,
          conversationId,
          prompt,
          false,
        );

        await this.chatService.saveMessage(
          userId,
          conversationId,
          fallbackText,
          true,
        );

        return {
          text: fallbackText,
          warning: 'AI response generation failed.',
        };
      }

      await this.chatService.saveMessage(userId, conversationId, aiText, true);

      const newHistory = await this.chatService.getConversationHistory(
        conversationId,
        userId,
      );

      return newHistory;
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Failed to generate content');
    }
  }
}
