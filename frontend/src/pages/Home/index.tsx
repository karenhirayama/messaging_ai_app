import { SendIcon } from "lucide-react";

import MessageBox from "../../components/MessageBox";

import { useChat } from "../../hooks/useChat";
import { useConversations } from "../../hooks/useConversations";

import { useAppSelector } from "../../store/hooks";

const LARI_NICKNAME = import.meta.env.VITE_LARI_NICKNAME || "";
const LARI_RECEIVER_ID = import.meta.env.VITE_LARI_RECEIVER_ID || "";

const Home = () => {
  const { conversations, isLoadingConversations } = useConversations();
  const currentUserId = useAppSelector((state) => state.auth.user?.sub) ?? null;

  const lariConversation =
    conversations.find((conv) => conv.participant_nickname === LARI_NICKNAME) ||
    conversations[0];

  const activeConversationId = lariConversation?.conversation_id ?? null;

  const activeReceiverId = LARI_RECEIVER_ID;

  const {
    inputMessage,
    setInputMessage,
    messages,
    messagesEndRef,
    handleKeyPress,
    handleUserMessageSubmit,
    isLoadingHistory,
  } = useChat(activeConversationId, activeReceiverId);

  const handleSubmit = () => {
    const content = inputMessage.trim();
    if (!content) return;

    handleUserMessageSubmit();
  };

  const isButtonDisabled = !inputMessage.trim() || isLoadingHistory;

  if (isLoadingConversations) {
    return (
      <div className="flex justify-center items-center h-[80vh] text-xl text-gray-400">
        Loading conversations...
      </div>
    );
  }

  if (!activeConversationId || !currentUserId) {
    return (
      <div className="flex justify-center items-center h-[80vh] text-xl text-gray-400">
        No active chat found. Please ensure Lari's conversation was created on
        signup.
      </div>
    );
  }

  if (isLoadingHistory) {
    return (
      <div className="flex justify-center items-center h-[80vh] text-xl text-gray-400">
        Loading conversation history...
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-3xl mx-auto h-[80vh]">
      <div className="flex flex-col gap-4 flex-1 p-6 space-y-5 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            Start a new conversation with Lari!
          </div>
        ) : (
          messages.map((message) => (
            <MessageBox
              key={message.id}
              id={message.id}
              isUser={message.sender_id === currentUserId}
              isAI={message.is_ai_response}
              sender_nickname={message.sender_nickname}
              text={message.content}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 flex items-center gap-2 shrink-0 bg-gray-100 border border-gray-600 rounded-full">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={`Chatting with ${
            lariConversation?.participant_nickname || "Lari"
          }...`}
          className="flex-1 p-3  focus:outline-none transition-shadow text-gray-700 "
        />
        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          className="p-4 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-md flex items-center disabled:bg-indigo-700/50 disabled:cursor-not-allowed"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Home;
