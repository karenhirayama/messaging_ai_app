import { SendIcon } from "lucide-react";
import { useParams } from "react-router-dom";

import MessageBox from "../../components/MessageBox";

import { useChat } from "../../hooks/useChat";
import { useConversations } from "../../hooks/useConversations";

import { useAppSelector } from "../../store/hooks";

const Conversation = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { conversations } = useConversations();
  const currentUserId = useAppSelector((state) => state.auth.user?.sub) ?? null;

  const activeConversation = conversations.find(
    (conversation) => conversation.conversation_id === conversationId
  );

  const activeReceiverId =  activeConversation?.participant_id ?? null;
  const participantNickname = activeConversation?.participant_nickname ?? "";

  const {
    inputMessage,
    setInputMessage,
    messages,
    messagesEndRef,
    handleKeyPress,
    handleUserMessageSubmit,
    isLoadingHistory,
  } = useChat(conversationId ?? null, activeReceiverId);

  const handleSubmit = () => {
    const content = inputMessage.trim();
    if (!content) return;

    handleUserMessageSubmit();
  };

  const isButtonDisabled = !inputMessage.trim() || isLoadingHistory;

  if (!conversationId || !activeConversation || !currentUserId) {
    return (
      <div className="flex justify-center items-center h-[80vh] text-xl text-gray-400">
        Conversation not found or not loaded.
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
            Start a new conversation with {participantNickname}!
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
          placeholder={`Chatting with ${participantNickname}...`}
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


export default Conversation