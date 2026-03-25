import express from "express";
import { 
    getUserProfile, 
    getUserOrders, 
    toggleFavorite 
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/profile", verifyToken, getUserProfile);
router.get("/orders", verifyToken, getUserOrders);
router.post("/favorites", verifyToken, toggleFavorite);

export default router;