import { useNavigate } from "react-router-dom";

import { useCreateConversationMutation } from "../features/chat/chatApi";
import { useGetFriendsListQuery } from "../features/friendship/friendshipApi";

export const useNewChatModal = () => {
  const navigate = useNavigate();

  const { data: friends, isLoading: isFriendsLoading } =
    useGetFriendsListQuery();
  const [createNewConversation] = useCreateConversationMutation();

  const handleCreateNewChat = async (friendshipId: string) => {
    try {
      const result = await createNewConversation(friendshipId).unwrap();

      const newConversationId = result.conversation_id;

      if (newConversationId) {
        navigate(`/conversation/${newConversationId}`);
      }
    } catch (error) {
      console.error("Failed create new chat:", error);
    }
  };

  return {
    friends,
    isFriendsLoading,
    onCreateNewChat: handleCreateNewChat,
  };
};
