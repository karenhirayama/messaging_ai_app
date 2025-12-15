import { apiSlice } from "../../api/apiSlice";

import type { ConversationResponse } from "../../interfaces/chat";

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createConversation: builder.mutation({
      query: (friendshipId) => ({
        url: "chat/conversation",
        method: "POST",
        body: { friendshipId },
      }),
      invalidatesTags: ["Conversation"],
    }),
    saveMessage: builder.mutation({
      query: (messageData) => ({
        url: "chat/message",
        method: "POST",
        body: messageData,
      }),
    }),
    getConversationHistory: builder.query({
      query: (conversationId) => `chat/history/${conversationId}`,
    }),
    
    generateAiResponse: builder.mutation({
      query: (aiPromptData) => ({
        url: "ai/prompt",
        method: "POST",
        body: aiPromptData,
      }),
    }),

    getConversations: builder.query<ConversationResponse, void>({
      query: () => "chat/conversations",
    }),
  }),
});

export const {
  useCreateConversationMutation,
  useGetConversationHistoryQuery,
  useGenerateAiResponseMutation,
  useGetConversationsQuery,
} = chatApi;
