import express from "express";
import { crearOrden, cancelarOrden, listarOrdenes, updateOrdenStatus } from "../controllers/order.controller.js";
import { isAdmin, optionalToken, verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Checkout
router.post("/checkout", optionalToken, crearOrden);
// Cancelar orden
router.put("/cancelar/:id", verifyToken, cancelarOrden);
// Listar ordenes
router.get("/", verifyToken, isAdmin, listarOrdenes);
// Actualizar estatus de la orden
router.put("/:id/status", verifyToken, isAdmin, updateOrdenStatus);

export default router;