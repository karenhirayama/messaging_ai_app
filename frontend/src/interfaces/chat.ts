export interface Conversation {
  conversation_id: string;
  is_ai_chat: boolean;
  participant_nickname: string;
  last_message_content: string;
  last_message_time: Date;
}

export interface ConversationResponse {
  data: Conversation[];
}
