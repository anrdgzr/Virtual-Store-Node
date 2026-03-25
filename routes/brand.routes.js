import express from "express";

import { uploadBrands, fetchBrands } from "../controllers/brand.controller.js";
import { isAdmin, verifyToken } from "../middleware/auth.js";
import upload from "../config/multer.js";


const router = express.Router();

router.post("/", verifyToken,isAdmin, upload.any(), uploadBrands);

router.get("/", fetchBrands);

export default router;