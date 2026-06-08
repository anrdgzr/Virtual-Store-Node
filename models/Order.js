import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: false
        },
        productos: [
            {
                producto: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                cantidad: { type: Number, required: true },
                precioUnitario: { type: Number, required: true },
                subtotal: { type: Number, required: true },
                variantes: [
                    {
                        sku: { type: String },
                        atributo: { type: String, required: true },
                        cantidad: { type: Number, required: true }
                    }
                ]
            },
        ],
        subtotalOriginal: { type: Number, required: true },
        descuentoAplicado: { type: Number, default: 0 },
        total: { type: Number, required: true },
        metodoPago: {
            type: String,
            enum: ["transferencia", "entrega_tarjeta", "entrega_efectivo", "paypal", "tienda"],
            required: true,
        },
        datosCliente: {
            nombre: { type: String, required: true },
            telefono: { type: String, required: true },
            // direccion: { type: String, required: true },
            email: { type: String, required: true },
        },
        estado: {
            type: String,
            enum: ["pendiente", "confirmado", "en_preparacion", "listo_para_recoleccion", "entregado", "cancelado"],
            default: "pendiente",
        },
        tipoEnvio: {
            type: String,
            enum: ["app", "punto_encuentro", "domicilio", "pickup_tienda"],
            required: true,
        },
        detallesEnvio: {
            direccion: { type: String },
            referenciaUbicacion: { type: String },
            driverDetails: { type: String },
        }
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema, "orders");
