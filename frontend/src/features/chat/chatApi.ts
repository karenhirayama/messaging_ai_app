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
    createAiConversation: builder.mutation({
      query: () => ({
        url: "chat/ai-conversation",
        method: "POST",
      }),
      invalidatesTags: ["Conversation"],
    }),
    updateConversationTitle: builder.mutation({
      query: ({ conversationId, title }) => ({
        url: `chat/conversation/${conversationId}/title`,
        method: "PATCH",
        body: { title },
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
  useCreateAiConversationMutation,
  useUpdateConversationTitleMutation,
  useGetConversationHistoryQuery,
  useGenerateAiResponseMutation,
  useGetConversationsQuery,
} = chatApi;
