import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  searchUser,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriendRequests,
  getFriends,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/search", protectRoute, searchUser);
router.get("/friend-requests", protectRoute, getFriendRequests);
router.get("/friends", protectRoute, getFriends);

router.post("/friend-request/send/:id", protectRoute, sendFriendRequest);
router.post("/friend-request/accept/:id", protectRoute, acceptFriendRequest);
router.post("/friend-request/decline/:id", protectRoute, declineFriendRequest);

export default router;
