import express from "express";
import upload from "../config/multer.js";
import {
    verifyToken,
    isAdmin
} from "../middleware/auth.js";
import {
    optimizeProductImages
} from "../middleware/imageOptimizer.js";
import {
    createProduct,
    deleteProduct,
    getProducts,
    updateProduct,
    restarStockVariante
} from "../controllers/product.controller.js";


const router = express.Router();

// Crear producto con varias imágenes
router.post("/", verifyToken, isAdmin, upload.array("imagenes", 5), optimizeProductImages, createProduct);

// Obtener productos
router.get("/", getProducts);

// Editar Producto
router.put("/:id", verifyToken, isAdmin, upload.array("newImages", 5), optimizeProductImages, updateProduct);

// Eliminar producto
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

// Actualizar Stock
router.put("/:id/stock", verifyToken, isAdmin, restarStockVariante);

export default router;
