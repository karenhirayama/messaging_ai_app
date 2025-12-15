import { useState } from "react";

import {
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useReceivedListQuery,
  useSentListQuery,
} from "../features/friendship/friendshipApi";

type ActiveTabType = "requests_received" | "requests_sent";

export const useAddFriendModal = () => {
  const [sendRequest, { isLoading: isSending }] =
    useSendFriendRequestMutation();
  const [acceptRequest, { isLoading: isAccepting }] =
    useAcceptFriendRequestMutation();
  const { data: receivedList, isLoading: isReceivedListLoading } =
    useReceivedListQuery();
  const { data: sentList, isLoading: isSentListLoading } = useSentListQuery();

  const [activeTab, setActiveTab] =
    useState<ActiveTabType>("requests_received");

  const [newFriendEmail, setNewFriendEmail] = useState("");

  const handleSendRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    

    if (newFriendEmail && newFriendEmail.includes("@")) {
      try {
        await sendRequest(newFriendEmail).unwrap();

        setNewFriendEmail("");
        console.log(`Successfully sent request to: ${newFriendEmail}`);
      } catch (error) {
        console.error("Failed to send friend request:", error);
        alert(`Failed to send request to ${newFriendEmail}.`);
      }
    } else {
      alert("Please enter a valid email address.");
    }
  };

  const handleAcceptRequest = async (friendshipId: number, email: string) => {
    try {
      await acceptRequest(friendshipId).unwrap();

      console.log(`Accepted request from: ${email}`);
    } catch (error) {
      console.error("Failed to accept friend request:", error);
      alert(`Failed to accept request from ${email}.`);
    }
  };

  const handleChangeNewFriendEmail = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewFriendEmail(e.target.value);
  };

  const handleChangeActiveTab = (newTab: ActiveTabType) => {
    setActiveTab(newTab);
  };

  console.log("receivedList", receivedList);
  console.log("sentList", sentList);

  return {
    activeTab,
    receivedList,
    newFriendEmail,
    isSending,
    isAccepting,
    isReceivedListLoading,
    sentList,
    isSentListLoading,
    onSendRequest: handleSendRequest,
    onAcceptRequest: handleAcceptRequest,
    onChangeNewFriendEmail: handleChangeNewFriendEmail,
    onChangeActiveTab: handleChangeActiveTab,
  };
};
