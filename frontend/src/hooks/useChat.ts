import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAppSelector } from "../store/hooks";
import { useGetConversationHistoryQuery } from "../features/chat/chatApi";

const SOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || "";

export const useChat = (
  conversationId: string | null,
  receiverId: string | null
) => {
  const socketRef = useRef<Socket | null>(null);

  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const currentUserId = useAppSelector((state) => state.auth.user?.sub) ?? null;
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const { data: historyData, isLoading: isLoadingHistory } =
    useGetConversationHistoryQuery(conversationId, {
      skip: !conversationId,
    });

  useEffect(() => {
    if (historyData?.history) {
      setMessages(historyData.history);
    }
  }, [historyData]);

  useEffect(() => {
    if (!isAuthenticated || !currentUserId || !conversationId) {
      if (socketRef.current?.connected) {
        socketRef.current.disconnect();
      }
      socketRef.current = null;
      setIsSocketConnected(false);
      return;
    }

    let token: string | null = null;
    try {
      token = localStorage.getItem("accessToken");
    } catch (error) {
      console.error("Error getting token:", error);
    }

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      query: {
        userId: currentUserId,
        conversationId: conversationId,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket.IO connected to /chat namespace");
      setIsSocketConnected(true);

      socket.emit("joinConversation", { conversationId });
    });

    socket.on("connected", (data) => {
      console.log("Server acknowledged connection:", data);
    });

    socket.on("joinedConversation", (data) => {
      console.log("Joined conversation:", data);
    });

    socket.on("receiveMessage", (messageData) => {
      console.log("Message received via Socket.IO:", messageData);

      setMessages((prev) => [...prev, messageData]);
    });

    socket.on("messageSent", (data) => {
      console.log("Message sent confirmation:", data);
    });

    socket.on("error", (error) => {
      console.error("Socket.IO error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
      setIsSocketConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      setIsSocketConnected(false);
    });

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated, currentUserId, conversationId]);

  const sendMessage = useCallback(async () => {
    const content = inputMessage.trim();

    if (!content || !conversationId || !receiverId || !currentUserId) return;

    const messagePayload = {
      conversationId,
      content: content,
      isAiResponse: false,
      receiverId: receiverId,
    };

    socketRef.current?.emit("sendMessage", messagePayload);
    setInputMessage("");
  }, [inputMessage, conversationId, receiverId, currentUserId]);

  const handleUserMessageSubmit = () => {
    if (inputMessage.trim()) {
      sendMessage();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleUserMessageSubmit();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return {
    inputMessage,
    isSocketConnected,
    messages,
    messagesEndRef,
    setInputMessage,
    handleUserMessageSubmit,
    handleKeyPress,
    isLoadingHistory,
  };
};
