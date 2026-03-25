import express from "express";
import { crearOrden, cancelarOrden, listarOrdenes, updateOrdenStatus} from "../controllers/order.controller.js";
import { isAdmin, optionalToken, verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/checkout", optionalToken, crearOrden);
router.put("/cancelar/:id", cancelarOrden);
router.get("/", verifyToken, isAdmin, listarOrdenes);
router.put("/update-status", verifyToken, isAdmin, updateOrdenStatus);
export default router;