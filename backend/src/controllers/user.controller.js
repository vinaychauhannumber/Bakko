import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Search for user by exact username
export const searchUser = async (req, res) => {
  try {
    const { username } = req.query;
    const currentUserId = req.user._id;

    if (!username) {
      return res.status(400).json({ message: "Username query parameter is required" });
    }

    const searchUsername = username.toLowerCase().trim();

    // Check if searching for oneself
    if (req.user.username === searchUsername) {
      return res.status(400).json({ message: "You cannot search for yourself" });
    }

    const user = await User.findOne({ username: searchUsername });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check relationships using string comparisons
    const isFriend = req.user.friends.some(id => id.toString() === user._id.toString());
    const hasSentRequest = req.user.sentRequests.some(id => id.toString() === user._id.toString());
    const hasReceivedRequest = req.user.receivedRequests.some(id => id.toString() === user._id.toString());

    res.status(200).json({
      _id: user._id,
      username: user.username,
      fullName: isFriend ? user.fullName : "Anonymous",
      profilePic: isFriend ? user.profilePic : "",
      isFriend,
      hasSentRequest,
      hasReceivedRequest,
    });
  } catch (error) {
    console.error("Error in searchUser: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (receiverId === senderId.toString()) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    const sender = await User.findById(senderId);

    // Check if already friends
    if (sender.friends.some(id => id.toString() === receiverId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    // Check if request already sent
    if (sender.sentRequests.some(id => id.toString() === receiverId)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Update sender sentRequests
    sender.sentRequests.push(receiverId);
    await sender.save();

    // Update receiver receivedRequests
    receiver.receivedRequests.push(senderId);
    await receiver.save();

    // Emit socket event to receiver if online
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingFriendRequest", {
        senderId: sender._id,
        senderUsername: sender.username,
      });
    }

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error in sendFriendRequest: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    // Check if there was indeed a request
    if (!receiver.receivedRequests.some(id => id.toString() === senderId)) {
      return res.status(400).json({ message: "No pending friend request from this user" });
    }

    // Add to friends lists
    receiver.friends.push(senderId);
    sender.friends.push(receiverId);

    // Remove from requests arrays
    receiver.receivedRequests = receiver.receivedRequests.filter(id => id.toString() !== senderId);
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== receiverId.toString());

    await receiver.save();
    await sender.save();

    // Emit socket event to sender if online
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("friendRequestAccepted", {
        accepterId: receiver._id,
        accepterUsername: receiver.username,
      });
    }

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Decline friend request
export const declineFriendRequest = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    // Remove from requests arrays
    receiver.receivedRequests = receiver.receivedRequests.filter(id => id.toString() !== senderId);
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== receiverId.toString());

    await receiver.save();
    await sender.save();

    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    console.error("Error in declineFriendRequest: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get pending received requests
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("receivedRequests", "_id username fullName profilePic");
    res.status(200).json(user.receivedRequests);
  } catch (error) {
    console.error("Error in getFriendRequests: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get friends list
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("friends", "-password");
    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getFriends: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
