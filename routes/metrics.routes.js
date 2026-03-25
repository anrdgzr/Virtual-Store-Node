import express from "express";
import { getMetrics } from "../controllers/metrics.controller.js";
import { isAdmin, verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, getMetrics);

export default router;