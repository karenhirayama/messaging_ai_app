import { Mail, UserPlus, X, Check, Clock } from "lucide-react";

import { useAddFriendModal } from "../../hooks/useAddFriendModal";
import { isApiError } from "../../utils/error";

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddFriendModal = ({ isOpen, onClose }: AddFriendModalProps) => {
  const {
    activeTab,
    receivedList,
    newFriendEmail,
    sentList,
    sendError,
    onSendRequest,
    onAcceptRequest,
    onChangeNewFriendEmail,
    onChangeActiveTab,
  } = useAddFriendModal();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg h-[500px] rounded-xl bg-slate-800 p-6 shadow-2xl transition-all duration-300 transform"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <h2 className="text-xl font-semibold text-white">
            Manage Friends & Requests
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSendRequest} className="mt-4 flex gap-2">
          <div className="relative flex-grow">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="email"
              value={newFriendEmail}
              onChange={onChangeNewFriendEmail}
              placeholder="Enter friend's email to send request"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-10 pr-4 text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-sky-600 px-4 py-2 text-white font-medium hover:bg-sky-500 transition-colors"
          >
            <UserPlus size={18} /> Send
          </button>
        </form>
        
        {isApiError(sendError) ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
            <span className="text-red-600 text-sm">
              {sendError.data.message}
            </span>
          </div>
        ) : null}

        <div className="mt-6">
          <div className="flex border-b border-slate-700">
            <TabButton
              label="Requests Received"
              count={receivedList.length}
              isActive={activeTab === "requests_received"}
              onClick={() => onChangeActiveTab("requests_received")}
            />
            <TabButton
              label="Requests Sent"
              count={sentList.length}
              isActive={activeTab === "requests_sent"}
              onClick={() => onChangeActiveTab("requests_sent")}
            />
          </div>

          <div className="mt-4 max-h-60 overflow-y-auto pr-2">
            {activeTab === "requests_received" && (
              <RequestList
                requests={receivedList}
                type="received"
                onAccept={onAcceptRequest}
              />
            )}
            {activeTab === "requests_sent" && (
              <RequestList requests={sentList} type="sent" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TabButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

const TabButton = ({ label, count, isActive, onClick }: TabButtonProps) => (
  <button
    className={`p-3 text-sm font-medium ${
      isActive
        ? "border-b-2 border-sky-500 text-sky-500"
        : "text-slate-400 hover:text-white"
    } transition-colors`}
    onClick={onClick}
  >
    {label} ({count})
  </button>
);

interface RequestListProps {
  requests: any[];
  type: any;
  onAccept?: (friendshipId: number, email: string) => void;
}

const RequestList = ({ requests, type, onAccept }: RequestListProps) => {
  if (requests.length === 0) {
    return (
      <p className="text-slate-400 p-4 text-center">
        {type === "received"
          ? "No pending friend requests."
          : "No outstanding requests sent."}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {requests.map((req, index) => (
        <li
          key={index}
          className="flex items-center justify-between rounded-lg bg-slate-700 p-3"
        >
          <div className="text-sm">
            <p className="font-semibold text-white">{req.email}</p>
          </div>

          {type === "received" && onAccept ? (
            <button
              onClick={() => onAccept(req.friendship_id, req.email)}
              className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-500 transition-colors"
            >
              <Check size={16} /> Accept
            </button>
          ) : null}

          {type === "sent" ? (
            <div className="flex items-center gap-1 text-slate-400">
              <Clock size={16} /> Pending
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
};

export default AddFriendModal;
