import { useGetConversationsQuery } from "../features/chat/chatApi";

export const useConversations = () => {
  const {
    data: conversations,
    isLoading,
    isError,
    refetch,
  } = useGetConversationsQuery();
  
  return {
    conversations: conversations?.data || [],
    isLoadingConversations: isLoading,
    isErrorConversations: isError,
    refetchConversations: refetch,
  };
};
