import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const createOrderService = async (orderData, userId) => {
    let multiplier = 1;

    if (userId) {
        const user = await User.findById(userId);
        if (user) {
            if (user.userType === "contratista") multiplier = 0.90;
            if (user.userType === "distribuidor") multiplier = 0.85;
            if (user.userType === "mayorista") multiplier = 0.80;
        }
    }

    let subtotalOriginalCalculado = 0;
    let totalCalculado = 0;
    const productosProcesados = [];

    for (let item of orderData.productos) {
        const dbProduct = await Product.findById(item.producto);
        if (!dbProduct) throw new Error(`El producto ${item.producto} ya no existe.`);

        const precioRealUnitario = dbProduct.precioBase * multiplier;
        let subtotalVariantes = 0;

        for (let variante of item.variantes) {
            const updateResult = await Product.updateOne(
                {
                    _id: item.producto,
                    "variantes.sku": variante.sku,
                    "variantes.cantidad": { $gte: variante.cantidad }
                },
                {
                    $inc: { "variantes.$.cantidad": -variante.cantidad }
                }
            );

            if (updateResult.modifiedCount === 0) {
                throw new Error(`Stock insuficiente para la variante SKU: ${variante.sku}. Por favor actualiza tu carrito.`);
            }

            subtotalVariantes += (precioRealUnitario * variante.cantidad);
        }

        subtotalOriginalCalculado += (dbProduct.precioBase * item.cantidad);
        totalCalculado += subtotalVariantes;

        productosProcesados.push({
            producto: item.producto,
            cantidad: item.cantidad,
            precioUnitario: precioRealUnitario,
            subtotal: subtotalVariantes,
            variantes: item.variantes
        });
    }

    const descuentoTotal = subtotalOriginalCalculado - totalCalculado;

    const nuevaOrden = new Order({
        usuario: userId || null,
        productos: productosProcesados,
        subtotalOriginal: subtotalOriginalCalculado,
        descuentoAplicado: descuentoTotal,
        total: totalCalculado,
        metodoPago: orderData.metodoPago,
        datosCliente: orderData.datosCliente,
        tipoEnvio: orderData.tipoEnvio,
        detallesEnvio: orderData.detallesEnvio
    });

    return await nuevaOrden.save();
};

export const cancelOrderService = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Orden no encontrada");
    if (order.estado === "cancelado") throw new Error("La orden ya estaba cancelada");

    for (let item of order.productos) {
        for (let variante of item.variantes) {
            await Product.updateOne(
                { _id: item.producto, "variantes.sku": variante.sku },
                { $inc: { "variantes.$.cantidad": variante.cantidad } }
            );
        }
    }

    order.estado = "cancelado";
    return await order.save();
};

export const getOrdersService = async () => {
    return await Order.find()
        .populate("usuario", "nombre email userType")
        .populate("productos.producto", "nombre imagenes marca")
        .sort({ createdAt: -1 });
};

export const updateOrderStatusService = async (orderId, nuevoEstado) => {
    const estadosValidos = ["pendiente", "confirmado", "en_preparacion", "listo_para_recoleccion", "entregado", "cancelado"];
    if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error("Estado de orden inválido");
    }

    const order = await Order.findByIdAndUpdate(
        orderId,
        { estado: nuevoEstado },
        { new: true }
    );

    if (!order) throw new Error("Orden no encontrada");
    return order;
};