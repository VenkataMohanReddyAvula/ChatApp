import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check", { headers: { token } });
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
      } else {
        toast.error("Auth failed: " + data.message);
        logout();
      }
    } catch (error) {
      toast.error("Auth check failed: " + (error.response?.data?.message || error.message));
      logout();
    }
  };

  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        setAuthUser(data.userData);
        connectSocket(data.userData);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Login failed: " + error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["token"];
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    if (socket) socket.disconnect();
    toast.success("Logged out successfully");
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body, {
        headers: { token },
      });
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error("Profile update failed: " + error.message);
    }
  };

  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });
    newSocket.connect();
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      axios.defaults.headers.common["token"] = storedToken;
      setToken(storedToken);
      checkAuth();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ axios, authUser, onlineUsers, socket, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};