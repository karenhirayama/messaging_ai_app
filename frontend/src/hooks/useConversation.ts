import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { useAppSelector } from "../store/hooks";

import { useConversations } from "./useConversations";
import { useChat } from "./useChat";

export const useConversation = () => {
  const { conversationId } = useParams<{ conversationId: string }>();

  const {conversations, refetchConversations} = useConversations()

  useEffect(() => {
    refetchConversations();
  }, [conversationId]);

  const currentUserId = useAppSelector((state) => state.auth.user?.sub) ?? null;

  const activeConversation = conversations.find(
    (conversation) => conversation.conversation_id === conversationId
  );

  const activeReceiverId = activeConversation?.participant_id ?? null;
  const participantNickname = activeConversation?.participant_nickname ?? "";

  const {
    inputMessage,
    setInputMessage,
    messages,
    messagesEndRef,
    handleKeyPress,
    handleUserMessageSubmit,
    isLoadingHistory,
    isAiResponding,
  } = useChat(conversationId ?? null, activeReceiverId);

  const handleSubmit = () => {
    const content = inputMessage.trim();
    if (!content) return;

    handleUserMessageSubmit();
  };

  return {
    conversationId,
    activeConversation,
    currentUserId,
    conversations,
    inputMessage,
    setInputMessage,
    messages,
    messagesEndRef,
    handleKeyPress,
    isLoadingHistory,
    isAiResponding,
    participantNickname,
    onSubmit: handleSubmit,
  };
};
