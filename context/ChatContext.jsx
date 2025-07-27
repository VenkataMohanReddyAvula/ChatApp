import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { axios, authUser, socket } = useContext(AuthContext);

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [unseenMessages, setUnseenMessages] = useState({});

  const getMessages = async (receiverId) => {
    if (!authUser) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/messages/${receiverId}`);
      if (data.success) setMessages(data.messages);
    } catch (error) {
      if (error.message !== "Network Error") {
        toast.error("Failed to fetch messages: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async () => {
    if (!authUser) return;
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) setUsers(data.users);
    } catch (error) {
      if (error.message !== "Network Error") {
        toast.error("Fetching users failed: " + error.message);
      }
    }
  };

  const sendMessage = async (receiverId, text, image = null) => {
    if (!authUser) return;
    try {
      const body = { text };
      if (image) body.image = image;

      const { data } = await axios.post(`/api/messages/send/${receiverId}`, body);
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        socket.emit("newMessage", data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error.message !== "Network Error") {
        toast.error("Sending message failed: " + error.message);
      }
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      if (newMsg.sender === selectedUser?._id) {
        setMessages((prev) => [...prev, newMsg]);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMsg.sender]: (prev[newMsg.sender] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser]);

  return (
    <ChatContext.Provider
      value={{
        selectedUser,
        setSelectedUser,
        messages,
        getMessages,
        sendMessage,
        loading,
        users,
        getUsers,
        unseenMessages,
        setUnseenMessages,
      }}>
      {children}
    </ChatContext.Provider>
  );
};
