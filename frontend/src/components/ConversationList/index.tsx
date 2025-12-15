import { useNavigate } from "react-router-dom";

import type { Conversation } from "../../interfaces/chat";

interface ConversationListProps {
  isSidebarOpen: boolean;
  isLoading: boolean;
  conversations: Conversation[];
}

 const ConversationList = ({
  isSidebarOpen,
  isLoading,
  conversations,
}: ConversationListProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div
        className={`flex-1 flex flex-col ${isSidebarOpen ? "block" : "hidden"}`}
      >
        <span
          className={`text-gray-100 block truncate whitespace-nowrap ${
            isSidebarOpen ? "block" : "hidden"
          }`}
        >
          Loading chats...
        </span>
      </div>
    );
  }

  if (conversations.length === 0) {
    <div
      className={`flex-1 flex flex-col ${isSidebarOpen ? "block" : "hidden"}`}
    >
      <span
        className={`text-gray-100 block truncate whitespace-nowrap ${
          isSidebarOpen ? "block" : "hidden"
        }`}
      >
        Start new conversation.
      </span>
    </div>;
  }

  return (
    <div
      className={`flex-1 flex flex-col ${isSidebarOpen ? "block" : "hidden"}`}
    >
      <ul className="space-y-2">
        {conversations?.map((conversation: any) => (
          <li
            key={conversation.conversation_id}
            className="p-2 rounded-full hover:bg-slate-800 cursor-pointer"
            onClick={() => navigate(`/conversation/${conversation.conversation_id}`)}
          >
            <span
              className={`block truncate whitespace-nowrap ${
                isSidebarOpen ? "block" : "hidden"
              }`}
            >
              {conversation.participant_nickname}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList