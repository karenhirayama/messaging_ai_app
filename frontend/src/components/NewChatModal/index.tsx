import { X } from "lucide-react";

import { useNewChatModal } from "../../hooks/useNewChatModal";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewChatModal = ({ isOpen, onClose }: NewChatModalProps) => {
  const { friends, onCreateNewChat } = useNewChatModal();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-xl bg-slate-800 p-6 shadow-2xl transition-all duration-300 transform"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <h2 className="text-xl font-semibold text-white">Start a New Chat</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <FriendList friends={friends} onCreateNewChat={onCreateNewChat} />
      </div>
    </div>
  );
};

interface FriendListProps {
  friends: any[];
  onCreateNewChat: (friendshipId: string) => void
}

const FriendList = ({ friends, onCreateNewChat }: FriendListProps) => {
  if (friends.length === 0) {
    return (
      <p className="text-slate-400 p-4 text-center">
        No friends, please go to "Add Friend" to add friends.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-lg font-medium text-white">Your Friends:</h3>
      <ul className="max-h-60 space-y-2 overflow-y-auto pr-2">
        {friends.map((friend, index) => (
          <li
            key={index}
            className="flex items-center justify-between rounded-lg bg-slate-700 p-3"
          >
            <div className="text-sm">
              <p className="text-slate-300">{friend.nickname}</p>
            </div>
            <button
            onClick={() => onCreateNewChat(friend.friendship_id)}
              className="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-500 transition-colors"
            >
              Chat
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewChatModal;
