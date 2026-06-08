import * as orderService from "../services/order.service.js";

export const crearOrden = async (req, res) => {
    try {
        const orderData = req.body;
        const userId = req.user?.id;

        const nuevaOrden = await orderService.createOrderService(orderData, userId);

        res.status(201).json({
            message: "Orden creada con éxito",
            orden: nuevaOrden
        });
    } catch (error) {
        console.error("Error en checkout:", error);
        res.status(400).json({ error: error.message });
    }
};

export const cancelarOrden = async (req, res) => {
    try {
        const { id } = req.params;
        const ordenCancelada = await orderService.cancelOrderService(id);

        res.status(200).json({
            message: "Orden cancelada y stock restaurado",
            orden: ordenCancelada
        });
    } catch (error) {
        console.error("Error al cancelar orden:", error);
        res.status(400).json({ error: error.message });
    }
};

export const listarOrdenes = async (req, res) => {
    try {
        const ordenes = await orderService.getOrdersService();
        res.status(200).json(ordenes);
    } catch (error) {
        console.error("Error listando órdenes:", error);
        res.status(500).json({ error: "Error interno del servidor al listar órdenes" });
    }
};

export const updateOrdenStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const ordenActualizada = await orderService.updateOrderStatusService(id, estado);

        res.status(200).json({
            message: "Estado de orden actualizado",
            orden: ordenActualizada
        });
    } catch (error) {
        console.error("Error actualizando estado:", error);
        res.status(400).json({ error: error.message });
    }
};