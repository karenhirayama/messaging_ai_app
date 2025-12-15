import { useState } from "react";
import { Menu, MessageCirclePlus, UserRoundPlus } from "lucide-react";

import ConversationList from "../ConversationList";
import NewChatModal from "../NewChatModal";
import AddFriendModal from "../AddFriendModal";

import { useConversations } from "../../hooks/useConversations";

const Sidebar = () => {
  const { conversations, isLoadingConversations } = useConversations();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openNewChatModal, setOpenNewChatModal] = useState(false);
  const [openAddFriendModal, setOpenAddFriendModal] = useState(false);

  const widthClass = isSidebarOpen ? "w-64" : "w-18";

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const handleOpenNewChatModal = () => {
    setOpenNewChatModal(true);
  };

  const handleCloseNewChatModal = () => {
    setOpenNewChatModal(false);
  };

  const handleOpenAddFriendModal = () => {
    setOpenAddFriendModal(true);
  };

  const handleCloseAddFriendModal = () => {
    setOpenAddFriendModal(false);
  };

  return (
    <nav
      className={`${widthClass} min-h-screen bg-slate-900 text-gray-400 py-4 px-3 flex flex-col space-y-2 transition-all duration-300 ease-in-out`}
    >
      <button
        onClick={toggleSidebar}
        className="p-2"
        aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
      >
        <Menu size={24} />
      </button>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <button
            onClick={handleOpenNewChatModal}
            className="hover:bg-slate-950 w-full p-3 rounded-full flex items-center gap-2"
          >
            <span>
              <MessageCirclePlus />
            </span>
            <span
              className={`block truncate whitespace-nowrap ${
                isSidebarOpen ? "block" : "hidden"
              }`}
            >
              New Chat
            </span>
          </button>
          <button
            onClick={handleOpenAddFriendModal}
            className="hover:bg-slate-950 w-full p-3 rounded-full flex items-center gap-2"
          >
            <span>
              <UserRoundPlus />
            </span>
            <span
              className={`block truncate whitespace-nowrap ${
                isSidebarOpen ? "block" : "hidden"
              }`}
            >
             Add Friend
            </span>
          </button>
        </div>

        <div className="px-3 flex-1 mt-2">
          <span
            className={`text-gray-100 block truncate whitespace-nowrap ${
              isSidebarOpen ? "block" : "hidden"
            }`}
          >
            Conversations
          </span>
        </div>

        <ConversationList
          isSidebarOpen={isSidebarOpen}
          isLoading={isLoadingConversations}
          conversations={conversations}
        />
      </div>
      <NewChatModal
        isOpen={openNewChatModal}
        onClose={handleCloseNewChatModal}
      />
      <AddFriendModal
        isOpen={openAddFriendModal}
        onClose={handleCloseAddFriendModal}
      />
    </nav>
  );
};

export default Sidebar;
