import express from "express";
import { getCategories, createCategory, deleteCategory } from "../controllers/category.controller.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import upload from "../config/multer.js";
import { optimizeProductImages } from "../middleware/imageOptimizer.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", verifyToken, isAdmin, upload.array("imagenes", 1), optimizeProductImages, createCategory);
router.delete("/:id", verifyToken, isAdmin, deleteCategory);

export default router;