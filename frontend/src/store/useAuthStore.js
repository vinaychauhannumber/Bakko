import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore.js";

const BASE_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5001" 
  : (import.meta.env.VITE_API_URL || "/");

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  friendRequests: [],
  searchResult: null,
  verificationEmail: null,
  isVerifyingOtp: false,
  isResendingOtp: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
      get().getFriendRequests();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      if (res.data?.status === "PENDING_VERIFICATION") {
        set({ verificationEmail: res.data.email });
        toast.success("Verification OTP sent to your email!");
        return { status: "PENDING_VERIFICATION" };
      } else {
        set({ authUser: res.data });
        toast.success("Account created successfully");
        get().connectSocket();
        return { status: "SUCCESS" };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      return { error: true };
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
      get().getFriendRequests();
      return { status: "SUCCESS" };
    } catch (error) {
      if (error.response?.data?.status === "UNVERIFIED") {
        set({ verificationEmail: error.response.data.email });
        toast.error("Please verify your account. OTP sent.");
        return { status: "UNVERIFIED" };
      }
      toast.error(error.response?.data?.message || "Login failed");
      return { error: true };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  searchUser: async (username) => {
    try {
      const res = await axiosInstance.get(`/users/search?username=${username}`);
      set({ searchResult: res.data });
      return res.data;
    } catch (error) {
      set({ searchResult: null });
      toast.error(error.response?.data?.message || "User not found");
      return null;
    }
  },

  clearSearchResult: () => set({ searchResult: null }),

  sendFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/users/friend-request/send/${userId}`);
      toast.success("Friend request sent!");
      if (get().searchResult?._id === userId) {
        set({ searchResult: { ...get().searchResult, hasSentRequest: true } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  },

  getFriendRequests: async () => {
    try {
      const res = await axiosInstance.get("/users/friend-requests");
      set({ friendRequests: res.data });
    } catch (error) {
      console.log("Error getting friend requests:", error);
    }
  },

  acceptFriendRequest: async (requestId) => {
    try {
      await axiosInstance.post(`/users/friend-request/accept/${requestId}`);
      toast.success("Friend request accepted!");
      set({
        friendRequests: get().friendRequests.filter((req) => req._id !== requestId),
      });
      useChatStore.getState().getUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  },

  declineFriendRequest: async (requestId) => {
    try {
      await axiosInstance.post(`/users/friend-request/decline/${requestId}`);
      toast.success("Friend request declined");
      set({
        friendRequests: get().friendRequests.filter((req) => req._id !== requestId),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to decline request");
    }
  },

  verifyOtp: async (otp) => {
    set({ isVerifyingOtp: true });
    try {
      const email = get().verificationEmail;
      const res = await axiosInstance.post("/auth/verify-otp", { email, otp });
      set({ authUser: res.data, verificationEmail: null });
      toast.success("Account verified and logged in!");
      get().connectSocket();
      get().getFriendRequests();
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
      return { error: true };
    } finally {
      set({ isVerifyingOtp: false });
    }
  },

  resendOtp: async () => {
    set({ isResendingOtp: true });
    try {
      const email = get().verificationEmail;
      await axiosInstance.post("/auth/resend-otp", { email });
      toast.success("OTP resent successfully!");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
      return { error: true };
    } finally {
      set({ isResendingOtp: false });
    }
  },

  loginWithGoogle: async (credential) => {
    try {
      const res = await axiosInstance.post("/auth/google-login", { credential });
      set({ authUser: res.data, verificationEmail: null });
      toast.success("Logged in with Google successfully!");
      get().connectSocket();
      get().getFriendRequests();
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Google login failed");
      return { error: true };
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("incomingFriendRequest", (data) => {
      toast.success(`New friend request from @${data.senderUsername}!`);
      get().getFriendRequests();
    });

    socket.on("friendRequestAccepted", (data) => {
      toast.success(`@${data.accepterUsername} accepted your friend request!`);
      useChatStore.getState().getUsers();
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
