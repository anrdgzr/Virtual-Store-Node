import express from "express";

import { uploadBrands, fetchBrands, removeBrand } from "../controllers/brand.controller.js";
import { isAdmin, verifyToken } from "../middleware/auth.js";
import upload from "../config/multer.js";

const router = express.Router();

router.post("/", verifyToken, isAdmin, upload.any(), uploadBrands);

router.get("/", fetchBrands);

router.delete("/:id", verifyToken, isAdmin, removeBrand);

export default router;