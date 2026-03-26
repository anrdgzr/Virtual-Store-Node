import Product from "../models/Product.js";
import Order from "../models/Order.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

export const crearOrden = async (req, res) => {
    try {
        const { cart, metodoPago, datosCliente, tipoEnvio } = req.body;

        if (!cart || cart.length === 0) {
            return res.status(400).json({ error: "El carrito está vacío" });
        }

        let total = 0;
        const productosOrden = [];

        for (let item of cart) {
            const producto = await Product.findById(item.id);

            if (!producto) {
                return res.status(404).json({
                    error: `Producto no encontrado: ${item.id}`
                });
            }

            let cantidadTotalProducto = 0;
            const saboresOrden = [];

            for (let saborComprado of item.sabores) {
                if (Number(saborComprado.cantidad) <= 0) continue;

                const saborDB = producto.sabores.find(
                    (s) => s.nombre === saborComprado.nombre
                );

                if (!saborDB) {
                    return res.status(400).json({
                        error: `El sabor ${saborComprado.nombre} no existe para ${producto.nombre}`
                    });
                }

                if (saborDB.stock < saborComprado.cantidad) {
                    return res.status(400).json({
                        error: `Stock insuficiente para ${producto.nombre} - ${saborComprado.nombre}. Disponible: ${saborDB.stock}`
                    });
                }

                cantidadTotalProducto += Number(saborComprado.cantidad);
                saboresOrden.push({
                    nombre: saborComprado.nombre,
                    cantidad: Number(saborComprado.cantidad)
                });
            }

            if (cantidadTotalProducto === 0) {
                return res.status(400).json({
                    error: `Debes seleccionar al menos un sabor para ${producto.nombre}`
                });
            }

            const precioUnitario = Number(producto.precio);
            const subtotal = precioUnitario * cantidadTotalProducto;

            total += subtotal;

            productosOrden.push({
                producto: producto.id,
                cantidad: cantidadTotalProducto,
                precioUnitario,
                subtotal,
                subtotal,
                sabores: saboresOrden 
            });
        }

        for (let item of productosOrden) {
            for (let sabor of item.sabores) {
                const updateResult = await Product.updateOne(
                    {
                        _id: item.producto,
                        "sabores.nombre": sabor.nombre,
                        "sabores.cantidad": { $gte: sabor.cantidad } 
                    },
                    {
                        $inc: {
                            "sabores.$.cantidad": -sabor.cantidad
                        }
                    }
                );

                if (updateResult.modifiedCount === 0) {
                    return res.status(400).json({ 
                        error: `¡Alguien más acaba de comprar el último ${sabor.nombre}! Por favor actualiza tu carrito.` 
                    });
                }
            }
        }

        const nuevaOrden = new Order({
            usuario: req.user ? req.user.id : undefined,
            productos: productosOrden,
            total,
            metodoPago,
            datosCliente,
            tipoEnvio,
            estado: "pendiente"
        });

        await nuevaOrden.save();

        const htmlBody = `
            <div style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:24px;">
                <div style="max-width:640px; margin:auto; background:#ffffff; padding:28px; border-radius:10px; border: 4px solid #000; box-shadow: 8px 8px 0px #000;">
                    <h2 style="color:#222; text-transform: uppercase;">¡Gracias por tu pedido, ${datosCliente.nombre}!</h2>
                    <p style="color:#555; line-height:1.5; font-weight: bold;">
                        Tu orden <strong>#${nuevaOrden._id.toString().slice(-6).toUpperCase()}</strong> fue creada correctamente. 
                    </p>
                    <hr style="border:none; border-top:3px solid #000; margin:24px 0;" />
                    <h3 style="margin-top:32px; color: #FF3366;"> RESUMEN DE COMPRA</h3>
                    ${cart.map(item => {
                        const cantidadTotal = item.sabores.reduce((s, sabor) => s + Number(sabor.cantidad), 0);
                        const subtotal = item.precioUnitario * cantidadTotal;
                        return `
                        <div style="border:2px solid #000; border-radius:8px; padding:14px; margin-bottom:14px; background-color: #f9f9f9;">
                            <p style="margin:0 0 6px 0; font-weight: bold; text-transform: uppercase;">${item.nombre}</p>
                            <ul style="margin:6px 0 10px 16px; padding:0; color:#555;">
                                ${item.sabores.map(s => `<li>${s.cantidad} × ${s.nombre}</li>`).join("")}
                            </ul>
                            <p style="margin:0; text-align:right; font-weight:bold;">Subtotal: $${subtotal.toFixed(2)}</p>
                        </div>
                        `;
                    }).join("")}
                    <hr style="border:none; border-top:3px solid #000; margin:24px 0;" />
                    <h2 style="text-align: right; color: #00E5FF; text-shadow: 1px 1px 0px #000;">TOTAL: $${total.toFixed(2)} MXN</h2>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"Gault Vapes" <${process.env.GMAIL_USER}>`,
            to: datosCliente.email,
            subject: `Confirmación de pedido #${nuevaOrden._id.toString().slice(-6).toUpperCase()} | Gault Vapes`,
            html: htmlBody
        });

        res.status(201).json({
            success: true,
            message: "Orden creada exitosamente",
            orden: nuevaOrden,
        });
    } catch (error) {
        console.error("❌ Error en crearOrden:", error);
        if (req.body?.datosCliente?.email) {
            await transporter.sendMail({
                from: `"Gault Vapes" <${process.env.EMAIL_USER}>`,
                to: req.body.datosCliente.email,
                subject: "Error al procesar tu orden",
                html: `
                    <p>Ocurrió un error inesperado y no pudimos crear tu pedido.</p>
                    <p>Por favor intenta más tarde.</p>
                `
            });
        }
        res.status(500).json({ error: "Error al crear la orden" });
    }
};

export const listarOrdenes = async (req, res) => {
    try {
        const ordenes = await Order.find().populate("productos.producto");
        res.json(ordenes);
    } catch (error) {
        console.error("❌ Error en listarOrdenes:", error);
        res.status(500).json({ error: "Error al obtener órdenes" });
    }
};

export const cancelarOrden = async (req, res) => {
    try {
        const { id } = req.params;
        const orden = await Order.findById(id);

        if (!orden) return res.status(404).json({ error: "Orden no encontrada" });
        if (orden.estado !== "pendiente") {
            return res.status(400).json({ error: "Solo se pueden cancelar órdenes pendientes" });
        }

        // Restaurar stock
        for (let item of orden.productos) {
            for (let sabor of item.sabores) {
                await Product.updateOne(
                    {
                        _id: item.producto,
                        "sabores.nombre": sabor.nombre
                    },
                    {
                        $inc: { "sabores.$.cantidad": +sabor.cantidad }
                    }
                );
            }
        }

        orden.estado = "cancelado";
        await orden.save();

        res.json({ success: true, message: "Orden cancelada", orden });
    } catch (error) {
        console.error("❌ Error en cancelarOrden:", error);
        res.status(500).json({ error: "Error al cancelar orden" });
    }
};

export const updateOrdenStatus = async (req, res) => {
    try {
        const { id, status } = req.params;
        const orden = await Order.findById(id);

        if (!orden) return res.status(404).json({ error: "Orden no encontrada" });

        orden.estado = status;
        await orden.save();

        res.json({ success: true, message: "Orden cancelada", orden });
    } catch (error) {
        console.error("❌ Error en cancelarOrden:", error);
        res.status(500).json({ error: "Error al cancelar orden" });
    }
};