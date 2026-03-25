import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const crearOrden = async (req, res) => {
    try {
        const { cart, metodoPago, datosCliente, tipoEnvio } = req.body;

        if (!cart || cart.length === 0) {
            await resend.emails.send({
                from: "Tienda <onboarding@resend.dev>",
                to: datosCliente.email,
                subject: "Error en tu pedido",
                html: `<p>
                    Un usuario está intentando crear una orden, 
                    pero falló debido a que su carrito venía vacío.
                </p>`
            });

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

            // 🔹 VALIDAR CADA SABOR
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
                    await Product.updateOne(
                        {
                            _id: item.producto,
                            "sabores.nombre": sabor.nombre
                        },
                        {
                            $inc: {
                                "sabores.$.cantidad": -sabor.cantidad
                            }
                        }
                    );
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

        await resend.emails.send({
        from: "Gault VPS <onboarding@resend.dev>", // usar dominio real en prod
        to: datosCliente.email,
        subject: "Confirmación de tu pedido | Gault VPS",
        html: `
            <div style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:24px;">
                <div style="max-width:640px; margin:auto; background:#ffffff; padding:28px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.05);">

                <!-- LOGO -->
                <div style="text-align:center; margin-bottom:20px;">
                    <img src="https://tudominio.com/logo.png" alt="Gault VPS" width="120" />
                </div>

                <h2 style="color:#222;">¡Gracias por tu pedido, ${datosCliente.nombre}! 🎉</h2>

                <p style="color:#555; line-height:1.5;">
                    Tu orden fue creada correctamente. A continuación te compartimos todos los detalles de tu compra.
                </p>

                <hr style="border:none; border-top:1px solid #eee; margin:24px 0;" />

                <!-- INFO GENERAL -->
                <table width="100%" style="font-size:14px; color:#444;">
                    <tr>
                    <td><strong>ID de la orden:</strong></td>
                    <td align="right">${nuevaOrden._id}</td>
                    </tr>
                    <tr>
                    <td><strong>Método de pago:</strong></td>
                    <td align="right">${metodoPago}</td>
                    </tr>
                    <tr>
                    <td><strong>Método de envío:</strong></td>
                    <td align="right">${tipoEnvio}</td>
                    </tr>
                    <tr>
                    <td><strong>Dirección de envío:</strong></td>
                    <td align="right">${datosCliente.direccion}</td>
                    </tr>
                </table>

                <h3 style="margin-top:32px;">🛒 Productos</h3>

                <!-- PRODUCTOS -->
                ${cart.map(item => {
                    const cantidadTotal = item.sabores.reduce(
                    (s, sabor) => s + Number(sabor.cantidad),
                    0
                    );
                    const subtotal = item.precioUnitario * cantidadTotal;

                    return `
                    <div style="border:1px solid #eee; border-radius:8px; padding:14px; margin-bottom:14px;">
                    <p style="margin:0 0 6px 0;">
                        <strong>${item.nombre}</strong>
                    </p>

                    <ul style="margin:6px 0 10px 16px; padding:0; color:#555;">
                        ${item.sabores.map(s => `
                        <li>${s.cantidad} × ${s.nombre}</li>
                        `).join("")}
                    </ul>

                    <table width="100%" style="font-size:13px; color:#666;">
                        <tr>
                        <td>Precio unitario:</td>
                        <td align="right">$${item.precioUnitario.toFixed(2)}</td>
                        </tr>
                        <tr>
                        <td>Subtotal:</td>
                        <td align="right"><strong>$${subtotal.toFixed(2)}</strong></td>
                        </tr>
                    </table>
                    </div>
                    `;
                }).join("")}

                <hr style="border:none; border-top:1px solid #eee; margin:24px 0;" />

                <!-- TOTAL -->
                <table width="100%" style="font-size:16px;">
                    <tr>
                    <td><strong>Total pagado:</strong></td>
                    <td align="right"><strong>$${total.toFixed(2)}</strong></td>
                    </tr>
                </table>

                <p style="margin-top:24px; font-size:14px; color:#666;">
                    Si tienes alguna duda sobre tu pedido, puedes responder a este correo y nuestro equipo te ayudará con gusto.
                </p>

                <p style="font-size:14px; color:#666;">
                    — Equipo <strong>Gault VPS</strong>
                </p>

                </div>
            </div>
            `
        });


        res.status(201).json({
            success: true,
            message: "Orden creada exitosamente",
            orden: nuevaOrden,
        });
    } catch (error) {
        console.error("❌ Error en crearOrden:", error);
        if (req.body?.datosCliente?.email) {
            await resend.emails.send({
                from: "Tienda <onboarding@resend.dev>",
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